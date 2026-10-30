# Website → CRM lead integration

How leads from www.pikorua.in reach the in-house CRM. Two paths deliver the same payload:

1. **Push (instant).** As soon as a form is saved, the website POSTs the lead to the CRM webhook.
2. **Pull (backup).** Every 5 minutes the CRM fetches any lead not yet marked synced, then acks it.

A lead may arrive by both paths. The CRM stores it once, keyed on `(source='website', external_id = lead.id)`.

## Networking

Both containers join the external Docker network `pikorua-integrations`. No traffic goes over host ports or the internet.

| Direction | URL |
|---|---|
| Push: website → CRM | `http://pikorua-crm-api:4000/api/webhooks/website` |
| Pull: CRM → website | `http://pikorua-website-app:3000/api/crm/leads` |

The website listens on port **3000 inside Docker**. Port 3100 is only its host-loopback mapping.

The network is created by the website's `deploy/deploy.sh`. To create it by hand, run `docker network create pikorua-integrations`. The CRM's compose file joins it like this:

```yaml
services:
  pikorua-crm-api:
    networks:
      - pikorua-crm-application
      - pikorua-crm-database
      - pikorua-integrations
networks:
  pikorua-integrations:
    external: true
```

## Shared secrets

Generate each with `openssl rand -hex 32`. Store them in the env files of both apps on the VPS. Never send them over chat or email.

| Website env | CRM side | Used for |
|---|---|---|
| `CRM_WEBHOOK_SECRET` | the same value | Signing the push |
| `CRM_API_KEY` | the same value | `Authorization: Bearer` on the pull and ack |
| `CRM_WEBHOOK_URL` | (none) | Push target, as in the table above |

The push stays off until both `CRM_WEBHOOK_URL` and `CRM_WEBHOOK_SECRET` are set on the website.

## Push: `POST /api/webhooks/website` (built by the CRM)

**Request**
- `Content-Type: application/json`
- `X-Pikorua-Timestamp`: Unix time in **seconds**, for example `1793347200`.
- `X-Pikorua-Signature`: `sha256=<hex>`. The hex is HMAC-SHA256 with `CRM_WEBHOOK_SECRET` over the string `"<timestamp>.<raw body>"`.
- Body: **one lead object**, exactly the shape of one item in the pull response's `leads[]`. One mapper can handle both paths.

**The CRM must**
1. Compute the signature over the **raw request bytes**, not re-serialised JSON. Compare it in constant time and reject any mismatch with 401.
2. Reject timestamps more than 5 minutes from now (401).
3. Insert or skip by `id`. Reply 2xx when the lead is stored, including when it was already stored. Keep the reply under 5 seconds.

**Website behaviour.** The website tries 3 times: straight away, then after about 10 s, then after about 60 s. It treats a non-2xx reply or a timeout over 5 s as a failure. Each attempt gets a fresh timestamp and signature. On 2xx the website marks the lead `crm_synced = true`. After three failures the lead waits for the pull.

**Signature test vector**

```
secret    = test_secret_do_not_use
timestamp = 1793347200
body      = {"id":"b03a6a59-2a1a-4a01-bea5-0d43c6e1aa7a","source":"enquiry","phone":"+919876543210"}
signature = sha256=bf7b1ae7124b69a2ee3e3b53307c6db21759b622e66bac7a01decf2582ab97a3
```

Node verification sketch:

```ts
import { createHmac, timingSafeEqual } from "crypto";

function verify(rawBody: Buffer, timestamp: string, header: string, secret: string): boolean {
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  const expected = "sha256=" + createHmac("sha256", secret)
    .update(`${timestamp}.`).update(rawBody).digest("hex");
  const a = Buffer.from(expected), b = Buffer.from(header ?? "");
  return a.length === b.length && timingSafeEqual(a, b);
}
```

## Pull: `GET /api/crm/leads` (built by the website)

`Authorization: Bearer <CRM_API_KEY>` is required. The endpoint is rate-limited to 60 requests per minute.

| Param | Meaning |
|---|---|
| `unsynced=true` | Only leads with `crm_synced = false` |
| `limit` | Page size. Default 100, max 500 |
| `since` | Optional `created_at` cursor (exclusive). Not needed with `unsynced=true` |

Leads come back oldest first. The response is `{ "leads": [...], "count": n, "next_since": "<created_at of last lead>" }`.

**Backlog and regular poll.** Loop `GET ?unsynced=true&limit=500`, store the leads, then ack their ids. Repeat until `count` is 0. Acked leads drop out of the next page, so the loop always moves forward. Don't combine this with `since`, because leads created in the same instant could be skipped.

## Ack: `POST /api/crm/leads/ack` (built by the website)

The body is `{ "ids": ["<uuid>", ...] }`, with 1 to 500 valid UUIDs. Send the same Bearer key.

The response is `{ "ok": true, "synced": [...] }`, listing only the ids that were newly marked. Re-acking an already-synced id is a no-op and returns 200; unknown ids are ignored the same way. An empty list returns 400, so skip the call when there's nothing to ack.

## Lead payload

```json
{
  "id": "f5f4884b-cf10-420c-a557-aa0ced757c76",
  "created_at": "2026-10-30 14:22:05.481+00",
  "source": "consultation",
  "name": "Priya Shah",
  "phone": "+919876543210",
  "whatsapp": "+919876543210",
  "email": "priya@example.com",
  "category": "villa",
  "location": "thaltej",
  "locations": ["thaltej", "sg-highway"],
  "budget_band": "5-7cr",
  "purpose": null,
  "timeline": "1-3months",
  "preferred_callback_time": null,
  "property_ref": null,
  "message": "Interest: Luxury villas\nLooking near schools",
  "status": "new",
  "is_hot": true,
  "crm_synced": false,
  "utm": { "utm_source": "google", "utm_medium": "cpc", "utm_campaign": "nri-villas" },
  "consent": true,
  "consultation_bookings": [
    {
      "id": "0c5e4b8a-6d0e-4f43-9d55-3c2f1b9a7e10",
      "created_at": "2026-10-30T14:22:05.481+00:00",
      "lead_id": "f5f4884b-cf10-420c-a557-aa0ced757c76",
      "preferred_date": "2026-11-05",
      "preferred_time": "10:00",
      "purpose": "nri",
      "notes": "Visiting Ahmedabad that week",
      "status": "pending"
    }
  ],
  "property_enquiries": []
}
```

### Field notes

- **One form submission is one lead with a new `id`.** The website never re-sends or edits a delivered lead, so a later consultation from the same person arrives as a new lead. To group repeat enquiries from one person, match on `phone`.
- **`phone` / `whatsapp`** are always E.164 with `+`. `whatsapp` may be `null`.
- **`source`**: `discovery`, `enquiry` (property enquiry), `callback`, `consultation`, `contact`, `popup`. Older rows may also have `whatsapp`.
- **`locations`** is every area the visitor picked. **`location`** is the first of them, kept for older code, and either may be `null`. Area slugs include `iskon-ambli`, `sindhu-bhavan`, `thaltej`, `shilaj`, `vaishno-devi`, `sg-highway` and `other`.
- **`category`**: `apartment`, `penthouse`, `villa`, `bungalow`, `plot`, `residential-investment`, `office`, `showroom`.
- **`budget_band`**: `1-2cr`, `3-4cr`, `5-7cr`, `8-10cr`, `10cr-plus`, `custom`. Older rows may hold `3-5cr` or `5-10cr`.
- **`purpose`** (lead): `self-use`, `investment`, `nri-purchase`, `selling`, `exploring`. It's `null` for consultations; their purpose is on the booking.
- **`timeline`**: `immediately`, `1-3months`, `3-6months`, `exploring`.
- **`is_hot`** is true when the budget is 5 Cr or more and the timeline is immediate or 1–3 months.
- **`property_enquiries[]`** is present for `source = enquiry`, with `property_ref` (the listing slug the visitor enquired about) and `message`. Suggested mapping: CRM project/listing reference plus remarks.
- **`consultation_bookings[]`** is present for `source = consultation`, with `preferred_date` (YYYY-MM-DD), `preferred_time` (HH:MM), `purpose` (`buy`, `sell`, `invest`, `nri`, `explore`) and `notes`. Suggested mapping: a meeting or site-visit request.
- **`status`** and **`crm_synced`** are internal website fields. The CRM can ignore them.
- Timestamps in the lead row are Postgres text (`2026-10-30 14:22:05.481+00`), while nested rows use ISO format. Parse both as timestamps with time zone.
- New columns may be added later. Ignore fields you don't know.
