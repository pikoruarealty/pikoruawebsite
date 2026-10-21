# PIKORUA Website: Vercel + Supabase → Hostinger VPS (KVM 2, 8GB)

> Status: **planned, not started** (drafted 2026-10-21). Nothing in this document has been executed yet.

## Context
The site (Next.js 16 App Router) runs on Vercel and uses Supabase for two things:
1. **Postgres DB**, accessed through `@supabase/supabase-js` (PostgREST) in 4 code areas.
2. **Storage**: the public `media` bucket. Admin uploads go there, and images are referenced by hardcoded `https://rwtueiruyktjzvsgdcoh.supabase.co/storage/v1/object/public/media/...` URLs.

Goal: move everything onto the Hostinger VPS as a **self-contained Docker Compose stack** (`pikorua-website`), like the other apps on the box: an app container (Next.js standalone, `127.0.0.1:3100`) and its own Postgres 17 container (`127.0.0.1:5433`). Host Nginx proxies to the app and serves uploaded media from `/var/www/pikorua-media` (bind-mounted into the app container). Supabase, Vercel **and Brevo** are removed entirely. Sanity CMS, GTM and weserv.nl stay as they are, because they are external SaaS.

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
- **Never touch**: other Nginx site files, other containers/Compose projects/volumes/images, the host Postgres (`postgresql@17-main`, used by `pikorua_hrm`), `cloudflared`, SSH config, firewall rules, system timezone, swap, global package versions, or other crontab entries.
- **Never run**: `apt upgrade`, `docker system prune`, `docker image/volume/network prune`, `docker stop $(docker ps -q)`, `docker compose down` outside `pikorua-website`, `systemctl restart docker|postgresql|nginx`, global edits to `postgresql.conf`/`nginx.conf`, or anything with `ufw`.
- **Docker**: always use `docker compose --env-file .env.production ...` from the website repo directory, which scopes every command to the `pikorua-website` project.
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

**1a results (2026-10-21)**
- Ubuntu 26.04.1, 2 vCPU, 7.7 GB RAM (5.5 GB available), 2 GB swap, 78 GB free disk.
- Ports in use (all loopback except 22/80/443): 3001 (node, likely the CRM), 5432 (host Postgres 17.11), 8012 (uvicorn), 18001/18002/18081/18100/27018 (docker-proxy), 18080 (nginx), 20241 (cloudflared). **Chosen: app 3100, db 5433.**
- Running: Docker 29.8.1, Nginx 1.28.3, host Postgres 17.11 (DBs: `pikorua_hrm`), cloudflared, Certbot 5.8.0. ufw inactive. No Node/PM2 on the host (not needed with Docker).
- Existing deploy users follow `deploy_<app>` (`deploy`, `deploy_hrm`, `deploy_propsight`).
- Existing Nginx files named `pikorua-live`, `pikorua-tls-hold`, `pikorua-acme`, `pikorua-phase5-loopback`, `pikorua-apps`, `pikorua-crm`, `pikorua-hrm`, `pikorua-propsight`. **Open question:** check whether any of them already claims `pikorua.in`/`www.pikorua.in`, and how `cloudflared` routes hostnames, before adding the site config.

**1b. Add only what's missing**
- **Linux user**: create `deploy_website` (matching the `deploy_<app>` convention), add only your SSH key to its `authorized_keys`, and add it to the `docker` group. Don't change `sshd_config`. Note that docker-group access is effectively root; that's the same as the other deploy users presumably have.
- **No Node, PM2 or host Postgres changes.** Everything runs in the `pikorua-website` Compose stack.
- **Media folder**: `sudo mkdir -p /var/www/pikorua-media && sudo chown 1001:1001 /var/www/pikorua-media`. UID 1001 is the `nextjs` user inside the app image. Nginx reads it through the default `o+rx`.
- **Nginx and Certbot**: reuse them. Firewall: leave as is.

## Phase 2: Database migration
**2a. Postgres container**
- Clone the repo and create `.env.production` first (Phase 5, steps 1–2), then start only the database: `docker compose --env-file .env.production up -d --wait db`. That creates the `pikorua` database and the `pikorua_app` role in the `pikorua-website-db` container (data in the `pikorua-website_pgdata` volume), reachable only at `127.0.0.1:5433`.
- The host's own `psql`/`pg_dump`/`pg_restore` 17.11 are used for the steps below, connecting to `127.0.0.1:5433`. Nothing on the host Postgres is touched. Set `export PGPASSWORD=<POSTGRES_PASSWORD>` in the shell for these steps.

**2b. Dump from Supabase** (using Supabase → Project Settings → Database → *direct/session* connection string, port 5432):
```
pg_dump "$SUPABASE_DB_URL" --schema=public --no-owner --no-privileges -Fc -f supabase_public.dump
```
Dumping the live schema, rather than replaying `supabase/migrations/*`, picks up drift such as columns added in the dashboard (`image_alts`, `faqs`, etc.).

**2c. Restore and clean up**
```
pg_restore -h 127.0.0.1 -p 5433 -U pikorua_app -d pikorua --no-owner supabase_public.dump
psql -h 127.0.0.1 -p 5433 -U pikorua_app -d pikorua -v ON_ERROR_STOP=1 -f deploy/sql/post_restore.sql
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
2. `rsync -avz media-export/ deploy_website@VPS:/var/www/pikorua-media/`, then on the VPS `sudo chown -R 1001:1001 /var/www/pikorua-media`. Folder layout stays identical (`properties/…`, `images/…`, etc.).
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
- **How the CRM reaches it**: call it **over localhost**, `http://127.0.0.1:3100/api/crm/leads`. That works if the CRM runs directly on the host (port 3001 is a host `node` process). If the CRM runs in a container, it must use the Docker host gateway (`host.docker.internal` with `extra_hosts: host-gateway`) instead of `127.0.0.1`. Either way, traffic never leaves the server. In the PIKORUA Nginx site file, add `location /api/crm/ { return 404; }` so the endpoint is not reachable from the internet at all. The API key stays required anyway.
- Remove the empty `pushToCrm` stub from `/api/leads`, and add `CRM_API_KEY` to `.env.local.example` and `.env.production`.
- **CRM-side change: DEFERRED.** The user will update the CRM later, separately from this migration. This migration only builds and tests the website endpoint; it makes no CRM changes.
  - Until the CRM is switched, new website leads land in the PIKORUA DB with `crm_synced = false` and are visible in `/admin`. Nothing is lost: when the CRM is pointed at `/api/crm/leads?unsynced=true`, it picks up the whole backlog.
  - Leads already in Supabase come across in the DB restore with their existing `crm_synced` values, so nothing is fetched twice.
  - **Don't delete the Supabase project until the CRM has been switched over.** The CRM still reads it, and deleting it first would make the CRM error rather than just see no new leads.

**Local test**: run Postgres locally (Docker `postgres:17`), restore the same dump plus `post_restore.sql`, and point `DATABASE_URL` at it. Then `npm run check` and `npm run build`, and click through every admin action and public page.

## Phase 5: Deploy the app on the VPS (Docker Compose)
Files in the repo: `Dockerfile` (Next.js `output: "standalone"`, Node 22, runs as UID 1001), `docker-compose.yml` (project `pikorua-website`: `app` on `127.0.0.1:3100`, `db` Postgres 17 on `127.0.0.1:5433`), `deploy/deploy.sh`, `deploy/nginx/pikorua.in.conf`.

1. As `deploy_website`: `git clone https://github.com/pikoruarealty/pikoruawebsite.git /home/deploy_website/pikorua-website` and check out the release branch.
2. Create `.env.production` in the repo dir with `chmod 600`, following `.env.local.example`. Values must be **unquoted**. Set `POSTGRES_PASSWORD`, `DATABASE_URL=...@db:5432/pikorua`, `BUILD_DATABASE_URL=...@127.0.0.1:5433/pikorua`, `NEXT_PUBLIC_SITE_URL=https://www.pikorua.in`, `NEXT_PUBLIC_SITE_LIVE=true`, `ADMIN_*` and `CRM_API_KEY`, plus the optional ones.
3. Start the DB and migrate data (Phase 2), and copy media (Phase 3).
4. `deploy/deploy.sh`: git pull, then `up -d --wait db`, `build app`, `up -d --wait app`. **The DB must be restored before the first build**, because statically generated pages are built from it. The build mounts `.env.production` as a BuildKit secret, so no secrets end up in the image, and reaches the DB through `BUILD_DATABASE_URL` on the host network.
   - The app runs as one container, which the in-memory rate limiter and the ISR file cache need. The ISR cache lives in the container and is rebuilt after each deploy.
5. **New** Nginx file from `deploy/nginx/pikorua.in.conf` → `/etc/nginx/sites-available/pikorua.in` (`APP_PORT` → `3100`), symlinked into `sites-enabled`. Don't edit any existing site file or `nginx.conf`. First resolve the 1a open question (existing `pikorua-*` configs and `cloudflared` routing). It contains:
   - `location /media/` → `alias /var/www/pikorua-media/` with long cache headers
   - `location /api/crm/` → `return 404` (the CRM uses `127.0.0.1:3100` directly)
   - `location /` → `proxy_pass http://127.0.0.1:3100` with the forwarding headers
   - `client_max_body_size 20m;` (server actions allow 15MB), gzip on.
   - Apply with `sudo nginx -t && sudo systemctl reload nginx`.
6. Logs: `docker compose --env-file .env.production logs -f app`. Restart policy is `unless-stopped`, so both containers come back after a reboot through the Docker daemon, with no systemd unit of our own.

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
2. Run a final delta: take a fresh Supabase dump, then reset the DB with `psql -h 127.0.0.1 -p 5433 -U pikorua_app -d pikorua -c 'drop schema public cascade; create schema public;'`, restore, and run `post_restore.sql` again. Then re-run `deploy/deploy.sh` so pages rebuild from the final data. Re-run the storage export and rsync, which copies only new files.
3. Change DNS A records for `pikorua.in` and `www` to the VPS IP. Remove the Vercel domain assignment only after the new site is confirmed.
4. `certbot --nginx -d pikorua.in -d www.pikorua.in`, which edits only the PIKORUA site file. Check renewal with `certbot renew --dry-run --cert-name pikorua.in`.
5. **CRM:** no change at cutover; the switch is deferred (4i). Just confirm the endpoint works with a local `curl` using the key. Submit a test lead and confirm it arrives in the CRM.
6. Sanity webhook: the URL `https://www.pikorua.in/api/revalidate` is unchanged. Publish a test edit and confirm revalidation.
7. Google Search Console: no change needed (same domain). Watch crawl errors for a week.

## Phase 9: Post-migration
- **Backups**: a nightly cron in the `deploy_website` crontab that runs `docker exec pikorua-website-db pg_dump -U pikorua_app -Fc pikorua > backup.dump` (this DB only) and a `tar` of `/var/www/pikorua-media`, keeps 14 days locally, and copies offsite (rclone to Google Drive or Backblaze B2). **Test one restore.**
- **Monitoring**: UptimeRobot (free) on `/` and one API route, plus `docker compose --env-file .env.production logs app`.
- **Rollback window**: keep the Vercel project and Supabase project (paused, not deleted) for 2 weeks. Rolling back means pointing DNS back.
- **Later (separate task): switch the in-house CRM** to `http://127.0.0.1:3100/api/crm/leads` with `CRM_API_KEY`, replacing its Supabase URL and key. Then confirm that the backlog of unsynced leads arrives.
- **Decommission**: after 2 stable weeks **and once the CRM has been switched**, take a final Supabase dump for the archive, then delete the Supabase project, the Vercel project and `vercel.json`. Cancel the Brevo account and API key.
- Optional later: with Brevo gone, there is no instant alert on a new lead. If wanted, add a small non-blocking notification (Resend, or a Telegram/WhatsApp bot) after the DB commit.

## Verification summary
1. Locally: `npm run check && npm run build` pass, with full admin and public click-through against a local Postgres restore.
2. Leads: submit each of the 6 forms (discovery, enquiry, callback, consultation, contact, popup). Each returns 200 and produces a `leads` row plus a `lead_events` 'created' row, with `property_enquiries`/`consultation_bookings` rows where relevant. A discovery lead with budget `8-10cr` and timeline `immediately` gets `is_hot = true`. Each lead appears in `/admin`. `rg -i brevo src` returns nothing.
3. DB: per-table row counts match Supabase. `... WHERE col LIKE '%supabase.co%'` returns 0 across the rewritten columns.
4. Media: file count and size match the bucket, and an upload via admin renders on the site.
5. CRM endpoint (tested with `curl` on the VPS, since the CRM switch is deferred): `GET /api/crm/leads?unsynced=true` with the key returns the test leads, `POST /ack` flips `crm_synced` to `true`, and a `lead_events` 'crm_synced' row exists. A request to `/api/crm/leads` without the key returns 401, and `https://www.pikorua.in/api/crm/leads` from outside the server returns 404.
6. Other apps unaffected: re-run the Phase 1a inventory after each phase. Other containers, Nginx sites, listening ports and host databases are unchanged, and the other sites still load.
7. Production: the Phase 7 checklist passes on the live domain, the SSL cert is valid, and no browser requests go to supabase.co.
