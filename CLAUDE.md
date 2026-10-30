# PIKORUA Realty — Project Architecture

## Stack
- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4 — tokens defined in `src/app/globals.css` via `@theme`, never hardcode hex values
- **CMS**: Sanity v3 — Studio at `/studio`, schemas in `src/sanity/schemas/`
- **Database**: PostgreSQL on the VPS, accessed with `pg` via `src/lib/db.ts` — leads + transactional data, properties, blogs, testimonials, FAQs and page singletons (`pages` table), managed via the custom `/admin` panel (`src/app/admin/actions.ts`).
- **Media**: uploads written to `MEDIA_DIR` on disk and served by Nginx under `/media` (`MEDIA_BASE` in `src/lib/media.ts`).
- **Hosting**: Hostinger VPS (shared with other apps) — Docker Compose project `pikorua-website` (one Next.js standalone `app` container + its own Postgres 17 `db` container) behind host Nginx. See `docker-compose.yml`, `deploy/deploy.sh` and `docs/VPS_MIGRATION_PLAN.md`.
- **Email**: none for leads — leads are saved to the DB and pulled by the in-house CRM via `/api/crm/leads`.
- **Validation**: Zod v4 — shared schemas in `src/lib/validations/lead.ts` used on both client and server

## Two non-negotiable constraints (from PRD)
1. **Residential-first, with a selective commercial add-on** — `ResidentialCategory` type in `src/types/index.ts` is the single source of truth. Core business is residential; `office` and `showroom` exist as a deliberate, narrow commercial-advisory add-on (see `src/lib/data/geo.ts` commercial landing page). Do not add further commercial types (retail, warehouse, etc.) without an explicit product decision — the union is otherwise closed.
2. **Five main pages only** — Home, Properties, About, Testimonials, Contact. No sixth nav item ever.

## Key patterns

### Empty-state guard
Use `renderListGuard()` from `src/lib/utils.ts` whenever rendering a list of properties or testimonials. This makes it structurally impossible to render an empty grid — the fallback must be an `EmptyStateRedirect` component. Never render "No Properties Found."

### Lead pipeline
All form submissions → `POST /api/leads` → rate limit → honeypot check → Zod validate → **one DB transaction**: `leads` row (+ `property_enquiries` / `consultation_bookings` row for those sources) + `lead_events` 'created' row. `is_hot` is set by the `set_is_hot` trigger. A DB failure returns 500 so the form shows an error instead of losing the lead.
→ Client redirected to `/thank-you?source=X&purpose=Y`.

In-house CRM sync (spec: `docs/crm-integration.md`): after the response, `/api/leads` pushes the new lead to `CRM_WEBHOOK_URL`, HMAC-signed with `CRM_WEBHOOK_SECRET` (`src/lib/crm-push.ts`, 3 tries, marks `crm_synced` on 2xx). Backup: the CRM pulls `GET /api/crm/leads?unsynced=true` then `POST /api/crm/leads/ack { ids }` (Bearer `CRM_API_KEY`). Push and pull share `src/lib/crm-leads.ts` (same payload, phones in E.164). The two containers talk over the external Docker network `pikorua-integrations`; `/api/crm/` is blocked publicly in Nginx.

### ISR revalidation
Sanity publishes content → POST to `/api/revalidate?secret=<SANITY_WEBHOOK_SECRET>` → `revalidateTag()` for the relevant data type. Queries in `src/lib/sanity/queries.ts` use `{ next: { tags: [...] } }` to opt into this.

### Automated blog
`POST /api/cron/auto-blog` (Bearer `CRON_SECRET`, host crontab on 127.0.0.1 only; Nginx 404s `/api/cron/`) → `runAutoBlog()` in `src/lib/ai/blogPipeline.ts`: next editorial pillar → Google News → OpenRouter draft → quality gate (`src/lib/ai/blogQuality.ts`: schema, HTML allowlist sanitiser, link validation, topic de-duplication, regulated-topic / guarantee / unsupported-figure holds) → with `BLOG_AUTOPUBLISH=true` nothing waits for a person: one AI revision pass, then sentences with guaranteed-return wording or figures not in the source are removed (`finalizeForAutoPublish`), and the post goes live with a ★ disclaimer chosen by topic at render time (`src/lib/data/blog-disclaimers.ts`, backed by `/terms`); unfixable drafts are discarded. Otherwise drafts are saved as pending review. What was changed goes in `review_notes`. Admins pause posting from /admin → Blogs (migration 015). Every run is logged in `blog_automation_runs`. Two of every eight slots draft evergreen briefs from `src/lib/ai/blogTopicQueue.ts` (facts with sources only). `?dryRun=1` drafts and gates without saving. Never attribute unreviewed AI posts to a person, never use scraped images. Report: `docs/seo/BLOG_AUTOMATION_REPORT.md`.

### Sitemaps and SEO routes
Sitemaps and generated internal links come from `src/lib/data/public-routes.ts` (pages that actually render), never from raw data lists — several data hrefs 404. `/p/[...combo]` matching lives in `src/lib/data/combo-matching.ts`; `SEO_COMBO_STRICT_MATCHING=true` enables real filters. Only indexable URLs go in sitemaps. FAQPage/structured data must match visible content; check with `npm run check:seo-crawl -- --base <url>`. Keyword-to-page map: `docs/seo/page-map.csv` (one page per intent; don't add variant pages).

### Sanity queries
All in `src/lib/sanity/queries.ts`. Always filter `isPublished == true`. Never fetch unpublished documents on the public site.

### Images
Always use `next/image` with explicit `width` + `height` to avoid CLS. Use `sanityImageProps()` from `src/lib/sanity/image.ts` to get `src`, `blurDataURL`, and `placeholder="blur"`.

### Environment variables
- Public vars (`NEXT_PUBLIC_*`): accessed via `env` export from `src/lib/env.ts`
- Server-only vars: accessed via `getServerEnv()` from `src/lib/env.ts` — only call inside Route Handlers, Server Actions, or Server Components
- `DATABASE_URL`, `CRM_API_KEY` and `CRM_WEBHOOK_SECRET` are server-only. The database listens on localhost only; there is no public DB access.

### Database access
- `src/lib/db.ts` (`server-only`): `query`, `queryOne`, `withTransaction`, `upsert(table, row, { jsonColumns })`. Always use `$1` parameters — never interpolate values into SQL. Pass jsonb columns in `jsonColumns` (arrays elsewhere go to Postgres `text[]`).
- Timestamps come back as strings (type parsers set in `db.ts`), matching the old PostgREST shape.
- Public read queries live in `src/lib/db/queries.ts` (function names still carry the historical `getSupabase*` prefix).
- Schema changes: add a numbered SQL file under `supabase/migrations/` (folder name kept for history).

## Folder structure
```
src/
  app/                    # Next.js App Router pages and API routes
    api/
      leads/route.ts      # Lead submission handler (saves to DB)
      crm/leads/          # In-house CRM lead feed + ack
      revalidate/route.ts # Sanity ISR webhook
      cron/auto-blog/     # Automated blog trigger (host crontab, CRON_SECRET)
    studio/[[...tool]]/   # Sanity Studio
    thank-you/            # Post-submission confirmation
    not-found.tsx         # Custom 404
    globals.css           # Design tokens + base styles
    layout.tsx            # Root layout with fonts and metadata
    page.tsx              # Home page (placeholder → full build in Phase 4)
  components/
    ui/                   # Primitive components (Button, Input, etc.)
    layout/               # Header, Footer, WhatsAppFAB
    property/             # PropertyCard, PropertyGrid, PropertyDetailDrawer
    discovery/            # GuidedDiscovery multi-step flow
  lib/
    env.ts                # Env var validation
    utils.ts              # cn, formatPrice, buildWhatsAppUrl, renderListGuard
    rate-limit.ts         # In-memory rate limiter (single app container)
    sanity/
      client.ts           # Sanity client + draft client
      queries.ts          # All GROQ queries
      image.ts            # imageUrlFor + sanityImageProps helpers
    db.ts                 # pg pool + query helpers (server-only)
    db/
      queries.ts          # Cached public read queries
    media.ts              # MEDIA_BASE + media URLs
    validations/
      lead.ts             # Zod schemas for all 5 form types
  sanity/
    schemas/              # Sanity schema definitions
    schemaTypes/index.ts  # Schema registry
  types/
    index.ts              # All shared TypeScript types
supabase/
  migrations/               # Numbered SQL migrations (run with psql)
deploy/
  sql/post_restore.sql      # One-time cleanup after restoring the Supabase dump
```

## Commands
```bash
npm run dev      # Development server
npm run build    # Production build
npm run lint     # ESLint
npx tsc --noEmit # Type check only
```

## Sanity Studio
Access at `/studio` in development and production. Singletons (homePage, aboutPage, contactPage, siteSettings) cannot be deleted or duplicated — enforced in `sanity.config.ts`.

## Design tokens (never hardcode these)
| Token | Tailwind class | Hex |
|---|---|---|
| Lux Black | `bg-lux-black` | `#0B0B0B` |
| Soft Black | `bg-soft-black` | `#151515` |
| White | `text-white` | `#FFFFFF` |
| Ivory | `bg-ivory` | `#F7F3EA` |
| Champagne Gold | `text-champagne-gold` | `#C8A45D` |
| Antique Gold | `text-antique-gold` | `#9B7A36` |
| Muted Gold | `border-muted-gold` | `#D8C28A` |

Gold discipline: gold occupies ≤ ~5% of any viewport. Use only for hairlines, labels, active underlines, icon strokes, and outline buttons — never large fills.
