# PIKORUA Realty — Project Architecture

## Stack
- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4 — tokens defined in `src/app/globals.css` via `@theme`, never hardcode hex values
- **CMS**: Sanity v3 — Studio at `/studio`, schemas in `src/sanity/schemas/`
- **Database**: PostgreSQL on the VPS, accessed with `pg` via `src/lib/db.ts` — leads + transactional data, properties, blogs, testimonials, FAQs and page singletons (`pages` table), managed via the custom `/admin` panel (`src/app/admin/actions.ts`).
- **Media**: uploads written to `MEDIA_DIR` on disk and served by Nginx under `/media` (`MEDIA_BASE` in `src/lib/media.ts`).
- **Hosting**: Hostinger VPS (shared with other apps) — Next.js under PM2 (single fork-mode process) behind Nginx. See `docs/VPS_MIGRATION_PLAN.md`.
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

The in-house CRM (same VPS) pulls leads over localhost: `GET /api/crm/leads?unsynced=true` then `POST /api/crm/leads/ack { ids }` to set `crm_synced`. Both require `Authorization: Bearer <CRM_API_KEY>`; `/api/crm/` is blocked publicly in Nginx.

### ISR revalidation
Sanity publishes content → POST to `/api/revalidate?secret=<SANITY_WEBHOOK_SECRET>` → `revalidateTag()` for the relevant data type. Queries in `src/lib/sanity/queries.ts` use `{ next: { tags: [...] } }` to opt into this.

### Sanity queries
All in `src/lib/sanity/queries.ts`. Always filter `isPublished == true`. Never fetch unpublished documents on the public site.

### Images
Always use `next/image` with explicit `width` + `height` to avoid CLS. Use `sanityImageProps()` from `src/lib/sanity/image.ts` to get `src`, `blurDataURL`, and `placeholder="blur"`.

### Environment variables
- Public vars (`NEXT_PUBLIC_*`): accessed via `env` export from `src/lib/env.ts`
- Server-only vars: accessed via `getServerEnv()` from `src/lib/env.ts` — only call inside Route Handlers, Server Actions, or Server Components
- `DATABASE_URL` and `CRM_API_KEY` are server-only. The database listens on localhost only; there is no public DB access.

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
    rate-limit.ts         # In-memory rate limiter (single PM2 process)
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
