# PIKORUA Website: Vercel + Supabase → Hostinger VPS (KVM 2, 8GB)

> Status: **planned, not started** (drafted 2026-10-21). Nothing in this document has been executed yet.

## Context
The site (Next.js 16 App Router) runs on Vercel and uses Supabase for two things:
1. **Postgres DB**, accessed through `@supabase/supabase-js` (PostgREST) in 4 code areas.
2. **Storage**: the public `media` bucket. Admin uploads go there, and images are referenced by hardcoded `https://rwtueiruyktjzvsgdcoh.supabase.co/storage/v1/object/public/media/...` URLs.

Goal: move everything onto the Hostinger VPS. The app runs under Node/PM2 behind Nginx, the DB is plain PostgreSQL on the same box, and media is served from local disk by Nginx. Supabase, Vercel **and Brevo** are removed entirely. Sanity CMS, GTM and weserv.nl stay as they are, because they are external SaaS.

Decisions made:
- **Plain PostgreSQL with a rewritten data layer.** No self-hosted Supabase.
- **VPS: KVM 2 (2 vCPU, 8GB).** It is **shared with other running apps**, which must not be touched.
- **Leads are saved to the DB, and Brevo is removed completely** (Phase 4h).

What the codebase shows:
- DB call sites: `src/app/admin/actions.ts` (~25 queries plus storage upload at L348-389), `src/lib/supabase/queries.ts` (~14 reads), `src/app/api/cron/auto-blog/route.ts` (select + insert). Clients are in `src/lib/supabase/client.ts` and `server.ts`. All usage is server-side; no Supabase Auth or Realtime.
- Hardcoded Supabase URLs: `src/lib/media.ts:1`, `src/lib/supabase/queries.ts:9`, `src/lib/data/blog.ts:313`, `src/lib/data/properties.ts:645`, `src/app/layout.tsx:392` (preconnect), and `next.config.ts` (CSP `media-src`/`connect-src` and `images.remotePatterns`).
- Vercel-specific items: 3 crons in `vercel.json` (dropped, see Phase 6), and `VERCEL_ENV`/`NEXT_PUBLIC_VERCEL_URL` checks in `seo.ts`, `layout.tsx` and `image-loader.ts`. These are harmless on the VPS: unset means production.
- DB objects beyond tables: the `compute_is_hot()` function and `set_is_hot` trigger on `leads` (latest version in migration 012), indexes, and RLS "public read" policies. RLS is no longer needed once the DB is private.
- `/api/leads` currently **does not write to the DB**; it only sends to Brevo. This is fixed in Phase 4h.
- Lead forms send values the `leads` table rejects: source `popup`, categories `office`/`showroom`, and a `locations` **array** where the table has a single `location` column. Also fixed in 4h.
- Repo: `https://github.com/pikoruarealty/pikoruawebsite.git`. Migration work happens on branch `vps-migration`.

---

## Golden rule: the VPS is shared, so only add things
Other apps already run on this VPS. The migration only **adds** PIKORUA-specific items and never modifies or restarts anything else:
- **Never touch**: other Nginx site files, other PM2 processes, other databases/roles, SSH config, firewall rules, system timezone, swap, global package versions, or other crontab entries.
- **Never run**: `apt upgrade`, `pm2 kill`, `pm2 delete all`, `pm2 restart all`, `systemctl restart postgresql`, global edits to `postgresql.conf`/`nginx.conf`, or anything with `ufw` that removes or reorders rules.
- **Nginx**: only `nginx -t && systemctl reload nginx` (reload, never restart), and only after `nginx -t` passes.
- Before every phase, look first (read-only), then add.

---

## Phase 0: Prep (local, ~1 hr)
1. ✅ Repo already exists on GitHub (`pikoruarealty/pikoruawebsite`); it's the deploy channel to the VPS. Work is on branch `vps-migration`.
2. Collect every production env var from the Vercel dashboard (Settings → Environment Variables), only the ones still needed (see the env table in Phase 4). Save them securely; they will become `.env.production` on the VPS.
3. Lower the DNS TTL for `pikorua.in` and `www` to 300s, at least 24h before cutover.
4. Record baseline row counts per table and the total object count and size of the `media` bucket. They are used to verify the migration.
5. **CRM.** The leads CRM is **in-house and runs on the same VPS**. Before Brevo it fetched website leads, but the codebase has no CRM route, so it must have read Supabase directly. **Decision: build a lead endpoint on the website for the CRM to call (Phase 4i).** The only CRM-side change is its lead source URL and key.

## Phase 1: VPS discovery (read-only), then add-only setup
**1a. Inventory: read-only commands only. Record the output in this doc.**
- OS and resources: `lsb_release -a`, `free -h`, `df -h`, `nproc`
- Running services: `systemctl list-units --type=service --state=running`
- Ports in use: `ss -tlnp`. Pick a **free** port for PIKORUA (e.g. 3100) and confirm 5432 is or isn't already Postgres.
- Installed tools: `node -v`, `npm -v`, `pm2 -v`, `pm2 ls`, `nginx -v`, `ls /etc/nginx/sites-enabled/`, `psql --version`, `certbot --version`, `ufw status`
- Existing users and cron: `ls /home`, `crontab -l`

**1b. Add only what's missing**
- **Linux user**: create a new `pikorua` user, and add only your SSH key to its `authorized_keys`. Don't change `sshd_config`.
- **Node**: if Node ≥ 20 already exists, use it. If not, install Node 22 **for the `pikorua` user only via `nvm`**, so the system Node used by other apps doesn't change.
- **PM2**: install it in the `pikorua` user's own npm (via nvm), so it runs as a separate PM2 daemon under that user and is isolated from other apps' PM2.
- **Postgres**:
  - **If Postgres already exists**, use the existing server. Add only a new role `pikorua_app` and a new database `pikorua`. No `postgresql.conf` tuning and no restart; a `pg_hba.conf` change is only needed if local password auth isn't already allowed, and then it's one appended line plus `SELECT pg_reload_conf()`.
  - **If not installed**, install PostgreSQL 17 from the PGDG repo. It listens on localhost only by default.
  - The `pg_dump` client must be ≥ the Supabase server version. If the system client is older, use the `postgres:17` Docker image just for the dump, or install `postgresql-client-17` alongside, which doesn't affect the server.
- **Nginx and Certbot**: if they already exist, reuse them. If not, install them. Firewall: ports 80/443 are almost certainly already open; add nothing unless `ufw status` shows them closed.
- **Build memory**: if `free -h` shows a tight margin, build the app locally or in GitHub Actions and ship the `.next` output, rather than adding swap on the server.

## Phase 2: Database migration
**2a. Postgres on the VPS**
- Create role `pikorua_app` with a strong password and database `pikorua` owned by `pikorua_app`. These are new objects only.
- No server-wide tuning, because other apps may share this Postgres. The PIKORUA dataset is small and the defaults are fine. If needed, set per-role settings only: `ALTER ROLE pikorua_app SET work_mem='16MB'`.

**2b. Dump from Supabase** (using Supabase → Project Settings → Database → *direct/session* connection string, port 5432):
```
pg_dump "$SUPABASE_DB_URL" --schema=public --no-owner --no-privileges -Fc -f supabase_public.dump
```
Dumping the live schema, rather than replaying `supabase/migrations/*`, picks up drift such as columns added in the dashboard (`image_alts`, `faqs`, etc.).

**2c. Restore and clean up**
```
pg_restore -d pikorua --no-owner --role=pikorua_app supabase_public.dump
```
Then run `deploy/sql/post_restore.sql` (to be added to the repo):
- `DROP POLICY ...` for every policy, and `ALTER TABLE ... DISABLE ROW LEVEL SECURITY` on all 12 tables. The `anon`/`authenticated` roles don't exist here; ignore restore errors that mention them.
- Confirm `compute_is_hot()` and the `set_is_hot` trigger exist. `gen_random_uuid()` is built into PG13+, so no extension is needed.
- **Rewrite stored media URLs** from `https://rwtueiruyktjzvsgdcoh.supabase.co/storage/v1/object/public/media` to `https://www.pikorua.in/media`:
  - text columns: `properties.cover_image`, `blogs.cover_image`, `blogs.author_avatar`, `blogs.html_content`, `locations.hero_image`, `testimonials.review_url` via `replace()`
  - `text[]` columns: `properties.images`, `blogs.content`, `properties.description`, `locations.corridor_description` via `array(select replace(x, old, new) from unnest(col) x)`
  - jsonb columns: `properties.image_alts`, `pages.content`, `blogs.faqs`, `site_settings.social_links` via `replace(col::text, old, new)::jsonb`
- Apply the lead-table fixes from 4h (migration 013).
- Verify that row counts match the Phase 0 baseline.

## Phase 3: Media (Storage) migration
1. Add `scripts/export-storage.ts`, modeled on the client setup in `scripts/upload-images.ts`. It recursively `list()`s the `media` bucket and `download()`s each object into `./media-export/<same path>`. Run it locally while Supabase is still live.
2. `rsync -avz media-export/ pikorua@VPS:/var/www/pikorua-media/`. Folder layout stays identical (`properties/…`, `images/…`, etc.).
3. Compare the file count and total size with the Phase 0 baseline.

## Phase 4: Code changes (local branch `vps-migration`)
**4a. New DB layer**: `npm i pg` and `npm i -D @types/pg`. Later, `npm uninstall @supabase/supabase-js`, once the scripts no longer need it.
- New `src/lib/db.ts` (`import "server-only"`): a singleton `pg.Pool` from `DATABASE_URL` (max 10). Cache it on `globalThis` in dev to survive HMR. Export `query<T>(sql, params)`.
- **Type parsers**: register `pg.types.setTypeParser(1184, v => v)` and `(1114, v => v)` so `timestamptz` comes back as **strings**, as PostgREST returned them. `text[]` and `jsonb` already return as JS arrays and objects, as before.
- Always use parameterized queries (`$1, $2`) and never interpolate strings into SQL. For partial updates in admin actions, add a small `buildUpdate(table, allowedColumns, patch)` helper with an explicit column whitelist per table.

**4b. Rewrite the call sites.** Each `supabase.from(t).select/insert/update/delete/eq/order/limit/single/maybeSingle` becomes the equivalent SQL. Keep each function's signature and return shape so callers don't change.
- `src/lib/supabase/queries.ts` → move to `src/lib/db/queries.ts`. Update imports in the pages that use it; find them with `rg "lib/supabase/queries"`.
- `src/app/admin/actions.ts`: leads, lead_events, properties, testimonials, blogs, pages, general_faqs.
- `src/app/api/cron/*`: not rewritten; deleted instead (Phase 6).
- Delete `src/lib/supabase/client.ts` and `server.ts`.

**4c. Media upload** (`actions.ts` L348-389): write the buffer with `fs.promises.writeFile` to `path.join(MEDIA_DIR, "properties", fileName)` and return `${MEDIA_PUBLIC_URL}/properties/${fileName}`. Validate the extension against an allowlist (jpg, jpeg, png, webp, avif, gif, mp4) and keep the existing random filename.

**4d. Replace the hardcoded Supabase URLs** with one constant `MEDIA_BASE = process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? "https://www.pikorua.in/media"` exported from `src/lib/media.ts`, and use it in `queries.ts`, `data/blog.ts` and `data/properties.ts`. Remove the Supabase preconnect in `layout.tsx`.

**4e. `next.config.ts`**: remove the supabase.co entries from CSP `media-src`/`connect-src` and `remotePatterns`, and add `{ pathname: "/media/**" }` to `localPatterns`.

**4f. Env**: update `.env.local.example`. Remove `SUPABASE_*` and `BREVO_*`/`BRAVE_API_KEY`, and add `DATABASE_URL`, `MEDIA_DIR=/var/www/pikorua-media`, `NEXT_PUBLIC_MEDIA_BASE_URL`, and `CRM_API_KEY`. Update `src/lib/env.ts`/`server-env.ts` accordingly, and update the "Database", "Hosting" and "Lead pipeline" sections of `CLAUDE.md`.

**Env vars for `.env.production` on the VPS** (checked against `process.env` usage in `src/`):

| Variable | Status | Why |
|---|---|---|
| `NEXT_PUBLIC_SITE_LIVE=true` | **Required** | Defaults to `false`, which shows the holding page |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | **Required** | `/admin` login |
| `DATABASE_URL` | **Required (new)** | Local Postgres connection |
| `MEDIA_DIR` | **Required (new)** | Where admin uploads are written |
| `CRM_API_KEY` | **Required (new)** | Protects `/api/crm/leads` |
| `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_MEDIA_BASE_URL` | Recommended | Default to `https://www.pikorua.in` (and `/media`), but set them explicitly |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Feature | Google indexing actions in admin |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID`, `NEXT_PUBLIC_MICROSOFT_CLARITY_PROJECT_ID` | Feature | Analytics; empty means tracking is off |
| `INDEX_NOW_KEY`, `SANITY_WEBHOOK_SECRET`, `NEXT_PUBLIC_SANITY_*`, `NEXT_PUBLIC_GTM_ID` | Only if used | Not in the Vercel list. Each feature no-ops or uses a default without its variable |
| `NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY`, `BREVO_*`, `RESEND_*`, Zoho/HubSpot, `CRON_SECRET`, `OPENROUTER_API_KEY` | **Drop** | Removed by this migration (crons and AI not needed) |

**4g. Scripts**: port `scripts/count-db.ts` to `pg` (used for verification). Mark `seed-supabase.ts` and `upload-images.ts` as legacy or delete them.

**4h. Save leads to DB, remove Brevo completely**
- New SQL migration `supabase/migrations/013_leads_vps.sql`, also included in `post_restore.sql`:
  - Widen `leads_source_check` to add `'popup'`.
  - Widen `leads_category_check` to add `'office'` and `'showroom'`.
  - `ALTER TABLE leads ADD COLUMN locations text[]`. Keep `location` = first selected item for the existing check and indexes.
- Rewrite `src/app/api/leads/route.ts` `POST`. Keep the rate limit, honeypot and Zod validation, then in **one transaction**:
  1. `INSERT INTO leads (...) RETURNING id`, mapping `budgetBand→budget_band`, `preferredCallbackTime→preferred_callback_time`, `propertyRef→property_ref`, `utm` (jsonb), `consent`, and `interest` folded into `message`. `is_hot` is set by the existing trigger.
  2. Source-specific child row: `enquiry` → `property_enquiries`; `consultation` → `consultation_bookings` (preferred_date, preferred_time, purpose, notes).
  3. `INSERT INTO lead_events (lead_id, type='created', payload={source})`.
  - Return `{ ok: true, leadId }` from the DB id. On a DB failure, return **500**, not a silent `ok`, so the form shows an error instead of losing the lead.
- Delete `syncBrevoContact`, `sendBrevoLeadEmail`, `buildLeadRows` and the HTML/label helpers. Drop the `pushToCrm` stub unless CRM is still planned.
- Remove Brevo from `src/lib/server-env.ts` and `src/lib/email.ts`. Delete `email.ts` if nothing else imports it.
- The admin panel's leads view (`actions.ts` L90-130) becomes the place to see new leads. Check that it renders the `locations` array and the `popup` source.

**4i. CRM lead endpoint (decided)**
The in-house CRM on the same VPS pulls leads from the website through a protected API. This replaces its old Supabase connection. The DB already has the needed pieces: `leads.crm_synced` and the `lead_events` type `crm_synced`.
- New `src/app/api/crm/leads/route.ts`, `GET`:
  - Auth: `Authorization: Bearer <CRM_API_KEY>` (new env var), compared with `crypto.timingSafeEqual`; anything else returns 401. Rate-limited with the existing `src/lib/rate-limit.ts` pattern.
  - Query: `?since=<ISO timestamp>` and/or `?unsynced=true`, `&limit=` (default 100, max 500), ordered by `created_at ASC`. The response includes each lead's `property_enquiries`/`consultation_bookings` row, if any, and a `next_since` cursor.
  - Response shape: leads as a JSON array using the DB's snake_case column names, close to what Supabase returned, so adapting the CRM later is easy. Document the shape in this file once built.
- New `src/app/api/crm/leads/ack/route.ts`, `POST { ids: string[] }`: sets `crm_synced = true` and inserts a `lead_events` row (`type='crm_synced'`) per lead, in one transaction. Same auth.
- **How the CRM reaches it**: call it **over localhost**, `http://127.0.0.1:<FREE_PORT>/api/crm/leads`, so traffic never leaves the server. In the PIKORUA Nginx site file, add `location /api/crm/ { return 404; }` so the endpoint is not reachable from the internet at all. The API key stays required anyway.
- Remove the empty `pushToCrm` stub from `/api/leads`, and add `CRM_API_KEY` to `.env.local.example` and `.env.production`.
- **CRM-side change: DEFERRED.** The user will update the CRM later, separately from this migration. This migration only builds and tests the website endpoint; it makes no CRM changes.
  - Until the CRM is switched, new website leads land in the PIKORUA DB with `crm_synced = false` and are visible in `/admin`. Nothing is lost: when the CRM is pointed at `/api/crm/leads?unsynced=true`, it picks up the whole backlog.
  - Leads already in Supabase come across in the DB restore with their existing `crm_synced` values, so nothing is fetched twice.
  - **Don't delete the Supabase project until the CRM has been switched over.** The CRM still reads it, and deleting it first would make the CRM error rather than just see no new leads.

**Local test**: run Postgres locally (Docker `postgres:17`), restore the same dump plus `post_restore.sql`, and point `DATABASE_URL` at it. Then `npm run check` and `npm run build`, and click through every admin action and public page.

## Phase 5: Deploy the app on the VPS
1. `git clone` to `/var/www/pikorua` as the `pikorua` user. First confirm the path doesn't already exist; if it does, use `/home/pikorua/app` instead. Create `.env.production` with `chmod 600`, containing all Vercel vars plus the new ones, with `NEXT_PUBLIC_SITE_URL=https://www.pikorua.in` and `NEXT_PUBLIC_SITE_LIVE` matching production.
2. `npm ci && npm run build`. **`.env.production` (with `DATABASE_URL`) must exist before the build, and the DB must already be restored.** Otherwise statically generated pages are baked without DB content (the build still passes, logging `Missing required environment variable: DATABASE_URL`) and only pick it up on their daily revalidation.
3. Run PM2 as `pikorua` in **fork mode with 1 instance**, because the in-memory rate limiter and the ISR file cache assume a single process: `pm2 start npm --name pikorua -- start -- -p <FREE_PORT>`. Then run `pm2 save` and `pm2 startup` **as `pikorua`**. This creates a separate `pm2-pikorua` systemd unit and leaves other apps' PM2 alone. Use `pm2 install pm2-logrotate` in this user's PM2 only.
4. **New** Nginx file `/etc/nginx/sites-available/pikorua.in`, symlinked into `sites-enabled`. Don't edit any existing site file or `nginx.conf`. First check with `grep -r pikorua /etc/nginx/` that no existing site already claims the domain.
   - `location /media/ { alias /var/www/pikorua-media/; expires 1y; add_header Cache-Control "public, immutable"; }`
   - `location / { proxy_pass http://127.0.0.1:<FREE_PORT>; }` with `Host`, `X-Forwarded-For`, `X-Forwarded-Proto` and `X-Real-IP` headers.
   - `client_max_body_size 20m;` (server actions allow 15MB), gzip on.
   - Apply with `nginx -t && systemctl reload nginx`.
5. `deploy/deploy.sh`: `git pull && npm ci && npm run build && pm2 reload pikorua`, which reloads only this process. Optionally add a GitHub Action that SSHes in as `pikorua` and runs it on push to `main`.
6. The `pikorua` user owns `/var/www/pikorua-media`, so admin uploads work. Nginx needs read access (`chmod o+rx` on the path).

## Phase 6: Vercel crons are dropped (decided)
The user doesn't need the scheduled jobs (auto-blog, IndexNow, URL inspection), `CRON_SECRET` or `OPENROUTER_API_KEY`. `CRON_SECRET` was never set on Vercel, so all 3 routes have been returning 401 and never ran; nothing is lost.
- Delete `src/app/api/cron/` (all 3 routes) and `vercel.json`. No crontab entries are added for them.
- `src/lib/ai/blogAutomation.ts`, `index-now.ts` and `google-url-inspection.ts`: delete them if nothing else imports them (check with `rg`).
- The admin AI buttons (SEO/excerpt/FAQ/alt-text generation in `actions.ts`, which call OpenRouter) will fail without the key. Hide those buttons, or make them return a clear "AI not configured" message instead of erroring.

## Phase 7: Staging check (before DNS switch)
- Test via a `hosts` file override for `www.pikorua.in` pointing at the VPS IP, or via a temporary `staging.pikorua.in` A record with its own cert.
- Checklist: home, properties list and detail, blog list and detail, about (`pages` table), testimonials, FAQs, sitemap.xml and `/sitemap/*.xml`, `llms.txt`, `/studio` (Sanity), **every lead form (row appears in DB and in `/admin`)**, `/admin` login plus edit and save for each entity, **image upload** (file lands in `/var/www/pikorua-media/properties/` and renders).
- Confirm no requests go to `supabase.co`: run `rg supabase.co src` (should be empty) and check the browser Network tab.

## Phase 8: Cutover (low-traffic window, ~1 hr)
1. Freeze admin edits on the old site.
2. Run a final delta: dump, restore and run `post_restore.sql` again (into a fresh DB, then swap), and re-run the storage export with rsync, which copies only new files.
3. Change DNS A records for `pikorua.in` and `www` to the VPS IP. Remove the Vercel domain assignment only after the new site is confirmed.
4. `certbot --nginx -d pikorua.in -d www.pikorua.in`, which edits only the PIKORUA site file. Check renewal with `certbot renew --dry-run --cert-name pikorua.in`.
5. **CRM:** no change at cutover; the switch is deferred (4i). Just confirm the endpoint works with a local `curl` using the key. Submit a test lead and confirm it arrives in the CRM.
6. Sanity webhook: the URL `https://www.pikorua.in/api/revalidate` is unchanged. Publish a test edit and confirm revalidation.
7. Google Search Console: no change needed (same domain). Watch crawl errors for a week.

## Phase 9: Post-migration
- **Backups**: a nightly cron in the `pikorua` crontab that runs `pg_dump -Fc pikorua` (this DB only) and a `tar` of `/var/www/pikorua-media`, keeps 14 days locally, and copies offsite (rclone to Google Drive or Backblaze B2). **Test one restore.**
- **Monitoring**: UptimeRobot (free) on `/` and one API route, plus `pm2 logs pikorua`.
- **Rollback window**: keep the Vercel project and Supabase project (paused, not deleted) for 2 weeks. Rolling back means pointing DNS back.
- **Later (separate task): switch the in-house CRM** to `http://127.0.0.1:<FREE_PORT>/api/crm/leads` with `CRM_API_KEY`, replacing its Supabase URL and key. Then confirm that the backlog of unsynced leads arrives.
- **Decommission**: after 2 stable weeks **and once the CRM has been switched**, take a final Supabase dump for the archive, then delete the Supabase project, the Vercel project and `vercel.json`. Cancel the Brevo account and API key.
- Optional later: with Brevo gone, there is no instant alert on a new lead. If wanted, add a small non-blocking notification (Resend, or a Telegram/WhatsApp bot) after the DB commit.

## Verification summary
1. Locally: `npm run check && npm run build` pass, with full admin and public click-through against a local Postgres restore.
2. Leads: submit each of the 6 forms (discovery, enquiry, callback, consultation, contact, popup). Each returns 200 and produces a `leads` row plus a `lead_events` 'created' row, with `property_enquiries`/`consultation_bookings` rows where relevant. A discovery lead with budget `8-10cr` and timeline `immediately` gets `is_hot = true`. Each lead appears in `/admin`. `rg -i brevo src` returns nothing.
3. DB: per-table row counts match Supabase. `... WHERE col LIKE '%supabase.co%'` returns 0 across the rewritten columns.
4. Media: file count and size match the bucket, and an upload via admin renders on the site.
5. CRM endpoint (tested with `curl` on the VPS, since the CRM switch is deferred): `GET /api/crm/leads?unsynced=true` with the key returns the test leads, `POST /ack` flips `crm_synced` to `true`, and a `lead_events` 'crm_synced' row exists. A request to `/api/crm/leads` without the key returns 401, and `https://www.pikorua.in/api/crm/leads` from outside the server returns 404.
6. Other apps unaffected: re-run the Phase 1a inventory after each phase. Other PM2 processes, Nginx sites, listening ports and databases are unchanged, and the other sites still load.
7. Production: the Phase 7 checklist passes on the live domain, the SSL cert is valid, and no browser requests go to supabase.co.
