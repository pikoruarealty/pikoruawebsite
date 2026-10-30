# Automated Blogging: Audit, Root Cause and Reactivation

> **Written:** 29 October 2026 · **Code:** `src/lib/ai/blogPipeline.ts`, `src/lib/ai/blogQuality.ts`, `src/lib/ai/blogAutomation.ts`, `src/app/api/cron/auto-blog/route.ts`, migration `supabase/migrations/014_blog_automation_runs.sql`
> **Evidence:** git history; the `blogs` table from the 24 Oct 2026 database dump (content tables only, restored into a throwaway local Postgres); a local production build run end-to-end against a mock AI endpoint.

---

## 1. Which systems exist

The management brief named the systems from a voice recording and the names did not survive transcription. These are **every blog-producing system in the repository**. I have not guessed which name maps to which.

| # | System | Author / origin | What it is | Status today |
|---|---|---|---|---|
| **S1** | **Automated news-to-blog pipeline** | Akshat (`aksh14055`), commit `8f2d044`, 8 Jul 2026: *"add automated blog drafting with admin approval pipeline"* | Vercel cron (Mon/Wed/Fri 04:00 UTC) → Google News RSS → scrape article → OpenRouter (Gemini 2.5 Flash) → saves a **pending-review draft** → emails an "Approve & Publish" link | **Dead since the VPS move** (route deleted 21 Oct). Reactivated on 29 Oct with a quality gate (this report) |
| S2 | Manual admin editor (+ DOCX import, AI SEO autofill, admin "AI News Drafter") | Akshat | `/admin` blog editor writing to the DB `blogs` table; DOCX via `mammoth`; optional AI-generated title/description/FAQs; the AI News Drafter fills the editor from a headline for a person to edit | **Working** for manual posts (16 live). The AI helpers silently do nothing: `OPENROUTER_API_KEY` is empty in `.env.production` |
| S3 | Static posts in code | `src/lib/data/blog.ts` | 9 hand-written posts, used as a fallback when the DB has none or a slug isn't in the DB | Working as fallback. Not shown on `/blog` while DB posts exist |
| S4 | Sanity `post` schema | `src/sanity/schemas/post.ts` | A CMS document type | **Dormant**: no GROQ query reads it, and `NEXT_PUBLIC_SANITY_PROJECT_ID` is empty in production |

**"Maya"** in this codebase is the AI voice call agent (`CallAgentPopup`, `src/lib/data/callAgent.ts`), not a blog system. It was hidden behind `NEXT_PUBLIC_MAYA_ENABLED` (off by default) in `091c9e0`. **It was not touched**: it stays intact and recoverable by setting that variable to `true` and rebuilding.

**S1 is "the automated blogging system Akshat implemented."** It is the only unattended one, and the only one with an approval gate.

---

## 2. What S1 actually produced (evidence from the database)

| | Count |
|---|---|
| AI drafts created (10 Jul – 5 Oct 2026, ids `blog-auto-…`, `source = 'ai_auto'`) | **22** |
| Approved and live | **3** (10 Jul, 3 Aug, 14 Aug) |
| Still hidden with `pending_review = true` | **19** |
| …of which marked Active but still hidden (bug, §3) | 1 (`ahmedabad-luxury-real-estate-75-lakh-budget`) |
| Repeats of an earlier story (Million Minds Tech City ×3, Resset/South Bopal ×2, Venus "The Universe" ×2, CWG bid ×2) | 4–5 drafts |
| Drafts whose SEO title exceeded the 60-character limit the prompt asked for | 21 of 22 (59–80 characters) |
| Internal links pointing at URLs that now 301-redirect | most drafts (the prompt's link map was stale) |
| Internal links that 404 | `/shilaj-properties`, `/penthouses-duplexes-ahmedabad`, `/luxury-penthouses-ahmedabad` |

No approvals happened after 14 Aug. The cron kept producing drafts until 5 Oct.

**Correction to `docs/VPS_MIGRATION_PLAN.md` Phase 6:** it says `CRON_SECRET` "was never set on Vercel, so all 3 routes have been returning 401 and never ran". The database shows the auto-blog route **did** run on Vercel for three months: `blog-auto-` ids are only ever written by that route. Phase 6's decision to drop it rested on that premise.

---

## 3. Root cause: why it stopped and stayed stuck

It was not one blocker. In order:

1. **Approval gate by design.** Every draft was saved `is_active = false, pending_review = true` and "never publishes on its own" (commit message). Publication depended on a person clicking Approve.
2. **The approval prompt stopped reaching the admin.** The review email used the shared `sendNotificationEmail` default recipient. Until 13 Aug that was `ADMIN_EMAIL` (the `/admin` login address) when set. Commit `a9c4d09` (*"send lead notifications to dedicated inbox"*, 13 Aug) moved lead emails to a new `LEAD_NOTIFICATION_EMAIL` and, in the same change, made the default recipient `TEAM_NOTIFICATION_EMAIL`, falling back to `connect@pikorua.in`. **ADMIN_EMAIL was no longer used**, so review emails went to a different inbox from then on. Approvals stop the next day (last approval 14 Aug). *Inference: consistent with the dates. Which inbox received them, and whether anyone read it, is unverified (Vercel's env values aren't in the repo).*
3. **A bug made one approval attempt fail silently.** Editing a pending draft and saving it as Active set `is_active = true` but never cleared `pending_review`, and public queries require both. The 75-lakh draft is in exactly that state. **Fixed** (`createOrUpdateBlogPost` now clears the flag).
4. **The VPS migration removed it entirely** (21 Oct, `a6606aa`): the cron route and `vercel.json` were deleted as "unused", Brevo email was removed, and the VPS has no scheduler.
5. **No AI key on the VPS.** `OPENROUTER_API_KEY` is empty in `.env.production`, so even the manual AI drafter cannot generate.

Not a cause: authentication or permissions. Unverified: why Vercel runs stopped after 5 Oct (two weeks before the move). Possibly OpenRouter credits or the Vercel project state; Vercel logs would show it.

---

## 4. Evaluation of S1 (as found) and of the reactivated version

| Area | S1 as found (evidence) | Reactivated (29 Oct) |
|---|---|---|
| **Article quality** | Coherent, ~800–1,200 words, good structure. But figures (₹/sq.ft, % growth) were often model-supplied: the prompt told it to "use your own extensive knowledge" when scraping failed, which invites fabrication. Formulaic titles ("…: A Deep Dive into…") | Prompt now forbids figures not in the source article; the gate **holds** a draft with more than 2 figures that don't appear in the source text. Scraper prefers paragraph text over page chrome |
| **SEO coverage** | Titles over length; slug quality fine; one category (`market-report`) for everything; topics drift (a "₹75 lakh budget" post on a luxury site) | SEO title normalised to fit before " \| PIKORUA Realty"; model picks from 5 categories; **editorial pillars** (luxury residential, NRI, investor/commercial, infrastructure) with per-pillar relevance filters |
| **Content architecture** | Stale link map: most links were redirects, some 404 | Link map generated from canonical pages and **tested against the route registry**; every link the model writes is validated: legacy links rewritten, unknown ones unwrapped; minimum 2 valid internal links |
| **Automation** | One cron, one attempt, no retries | Up to 3 headlines per run; falls through to other pillars when one is exhausted; 120s AI timeout; JSON response mode |
| **Publication workflow** | Approval-only; email-dependent; reversible via admin | `BLOG_AUTOPUBLISH`: drafts that pass every check publish; flagged ones are **held with written reasons shown in /admin**. Still reversible (set Inactive) |
| **Technical quality** | Clean, shared module; no tests | Pure, tested gate (`npm run test:seo`, 19 tests) + backlog audit script |
| **Search visibility** | Blog posts were in **no** sitemap; Google Indexing API used for blog URLs, which Google limits to job/livestream pages | `/sitemap/blog.xml` + revalidation on publish; IndexNow only (set `INDEX_NOW_KEY`); correct `wordCount`; Organization author for unreviewed posts |
| **Duplicate protection** | Dedupe by Google News URL only, so the same story from another outlet was redrafted (4–5 repeats) | Topic de-duplication on title **and slug** tokens against every post and every past headline (repeats scored 0.80–1.00 vs ≤0.17 for different stories on the real backlog), verbatim-overlap check, rejected headlines remembered |
| **Reliability** | `console.error` only; no run history | `blog_automation_runs` table: status, reason, attempts, gate metrics, model, token usage; stale "running" rows expire after 15 min; one run at a time (unique index); a second trigger within 20h is a no-op |
| **Safety** | Raw model HTML rendered with `dangerouslySetInnerHTML`; human review was the only barrier. Publisher's `og:image` hot-linked as cover | **Allowlist HTML sanitiser** (no scripts, handlers, styles, iframes or external links from the model; source article text treated as data); own placeholder covers only; code-built source credit with `rel="nofollow noopener"` and a not-advice line |
| **Regulated topics** | No special handling | FEMA, RBI, repatriation, TDS, capital gains, DTAA, NRE/NRO/FCNR, PoA, stamp-duty/GST rates → **always held** for a person; "guaranteed/assured returns", "risk-free" → held |
| **Business relevance** | Mostly generic "Ahmedabad luxury market" angles | Pillar rotation weights residential and NRI ×2 each per cycle; lifestyle deliberately excluded from automation (feeds tested irrelevant) |
| **Operating cost** | Unknown (usage not stored) | Usage recorded per run. Estimate (verify current pricing on openrouter.ai): ~3–4k input + ~3k output tokens per draft on Gemini 2.5 Flash ≈ **about $0.01 per draft**, at most 3 drafts per run, 3 runs/week → **under $0.50/month**. Maintenance: reviewing held drafts, roughly 10 minutes a week |

**Recommendation:** make **S1 (reactivated) the primary automated workflow**, keep **S2 for human-written cornerstone content** (NRI legal guides, locality guides, lifestyle series), keep S3 only as the fallback, and leave **S4 (Sanity posts) unused**, or remove it in a later clean-up so nobody writes posts that never appear.

---

## 5. Comparable output samples (old drafts through the new gate)

`npm run audit:blog-backlog` (read-only) runs the new gate over the 22 historical drafts. Their source text wasn't stored, so the figure check is reported but excluded. Results:

| Decision | Count | Examples |
|---|---|---|
| Reject: duplicate topic | 4 | `…-venus-group-universe` (repeat of a manual post), `million-minds-…-sw7m`, `resset-group-south-bopal-…` (2 Sep), `ahmedabad-million-minds-…` (4 Sep) |
| Reject: malformed | 1 | `south-bopal-resset-…` (title 118 characters at audit time; the cap has since been raised to 130) |
| Hold: regulated topic (repatriation) | 3 | `ahmedabad-nri-luxury-real-estate-boom` (one of the 3 live posts), `…-marketing-narrative`, `…-aspiration` |
| Would publish (figure check aside) | 14 | e.g. `ahmedabad-luxury-real-estate-resilience-investors` |

Every old draft would also have had its SEO title shortened and its stale links rewritten.

**What to do with the 19 hidden drafts:** do not bulk-publish them. They are 3–16 weeks old, several are repeats, and their figures can't be checked against a source. Suggested: discard the 4 duplicates; a person reviews the regulated ones and any whose news is still current; delete the rest. This is a content decision for management. No draft was changed.

---

## 6. Verification (29 Oct 2026, local production build + throwaway DB)

| Check | Result |
|---|---|
| `npm run typecheck` | Pass |
| `npm run test:seo` (new) | **24/24 pass** (19 first pass + 5 second pass: combo claims, editorial queue), incl. a regression test showing default combo matching equals the old code for every combo |
| `npm run validate:ai` | Pass (22 answer blocks, 241 routes) |
| Lint | New/changed files clean. Repo errors unchanged at the pre-existing 179 (untouched code, mostly `admin/`); warnings 37 → 36 |
| `npm run build` | Pass (820 static pages) |
| Cron auth | No token → 401; wrong token → 401 |
| Clean draft, autopublish on | Published; script tag stripped; invented link removed; legacy link rewritten; own cover; Organization author; page 200, indexable, self-canonical; in `/sitemap/blog.xml` and on `/blog` |
| Second trigger within 20h | Skipped (no AI call) |
| Regulated draft | **Held** with reasons; public URL 404; not in sitemap; reasons stored in `review_notes` |
| AI endpoint down (503) | Run recorded `failed`, HTTP 500 to cron |
| Crashed run left "running" | Expired by the next run |
| Concurrent trigger | "Another run is in progress" |
| Duplicate stories | Rejected before publish |
| Full crawl of all sitemap URLs | 661 URLs, 0 non-200 / non-canonical / noindex |
| Internal link targets | 2,007 checked: 1,998 × 200, 9 × 308 (permanent redirects), **0 broken** |

Not verified: a real OpenRouter call (no key in this environment), real IndexNow submission (no key), behaviour on the VPS itself.

---

## 7. To switch it on (needs your authorisation; nothing here was deployed)

> **Order corrected 30 Oct 2026 (release review):** the website itself does not need migration 014 (only `/api/cron/auto-blog` reads `blog_automation_runs`; `review_notes` is optional), and 014 is additive, so apply it *before* deploying — then an app rollback never needs a DB rollback. `deploy/deploy.sh` runs `git pull --ff-only`, so it deploys only what is committed and pushed, not a local working tree. The full release and rollback checklist is in `docs/seo/RELEASE_REVIEW_2026-10-30.md`.

1. **Back up the DB, then apply the migrations** (both idempotent; re-run tested locally on PostgreSQL 17.11, single transaction, stop on error): `sudo docker exec -i pikorua-website-db psql -U pikorua_app -d pikorua -v ON_ERROR_STOP=1 -1 < supabase/migrations/014_blog_automation_runs.sql`, then the same with `015_blog_automation_pause.sql`. Without 015 every run fails closed (no post).
2. **Deploy** the reviewed, committed and pushed branch (`deploy/deploy.sh`). The website release does not need any of the steps below; they only switch on automation.
3. **Nginx (before setting `CRON_SECRET`):** add `location /api/cron/ { return 404; }` from `deploy/nginx/pikorua.in.conf` to the *live* site file by hand, then `sudo nginx -t && sudo systemctl reload nginx`. Do not copy the repo file over the live one: the live file has Certbot's TLS lines that the repo copy lacks (master plan §3.3). Until this is done, `/api/cron/` is reachable from the internet; with `CRON_SECRET` unset it answers 401 to everyone.
4. **`.env.production`** (then `docker compose --env-file .env.production up -d --force-recreate app` so the container picks up the new values; no rebuild is needed for these server-only variables):
   - `CRON_SECRET=$(openssl rand -hex 32)`
   - `OPENROUTER_API_KEY=…` (OpenRouter account with credit; this also re-enables the admin AI helpers)
   - `BLOG_AUTOPUBLISH=true` — **decided by management on 30 Oct 2026**: drafts that pass every check publish with no approval. Flagged drafts (regulated legal/tax/NRI topics, guarantee wording, figures not in the source) are still held in `/admin` with the reason; duplicates and broken drafts are always rejected. Admins take a post down with Inactive/Delete and pause posting from `/admin` → Blogs (migration 015).
   - `INDEX_NOW_KEY=dc8ee02b…733f` (the name of the key file already in `public/`)
5. **Verify the real AI integration before scheduling anything.** The dry run makes a real OpenRouter call and consumes normal API credit. It writes a `skipped` dry-run record to `blog_automation_runs`, but saves no blog post or draft; its logged headlines and brief are not treated as used on later runs:
   ```
   curl -s -X POST -H "Authorization: Bearer $(grep ^CRON_SECRET= /opt/pikorua-website/.env.production | cut -d= -f2-)" "http://127.0.0.1:3100/api/cron/auto-blog?dryRun=1"
   ```
   Expect `"status":"skipped"`, a `preview` with the real model name and token usage, and a reason starting "Dry run: would hold/publish". A `failed` status prints the OpenRouter error. Review the run record and preview before repeating; each attempt uses model credits.
6. **Host crontab** for the account that runs deploys (`crontab -e`; it must be able to read `.env.production`). Mon/Wed/Fri 04:00 UTC = 09:30 IST, the old Vercel schedule. Check the server clock with `timedatectl`:
   ```
   0 4 * * 1,3,5 curl -fsS -m 300 -X POST -H "Authorization: Bearer $(grep ^CRON_SECRET= /opt/pikorua-website/.env.production | cut -d= -f2-)" http://127.0.0.1:3100/api/cron/auto-blog >> $HOME/auto-blog.log 2>&1
   ```
7. **Monitor:** `curl -s -H "Authorization: Bearer …" http://127.0.0.1:3100/api/cron/auto-blog` lists recent runs, or query `blog_automation_runs`. Add the cron URL's failure (non-200) to the uptime monitor when that is set up.
8. **Review held drafts** in `/admin` → Blogs: the amber text under each title says why it was held. Approve, edit, or discard.
9. **Pause** from `/admin` → Blogs → Automated posting: "Pause 1 week", "Resume on <date>" (resumes 00:00 IST that day), "Pause indefinitely", "Resume now". A paused run, including `?force=1`, is logged as skipped; dry runs still work. The panel also lists the latest runs.

**Rollback:** pause from `/admin` (no server access needed), set `BLOG_AUTOPUBLISH=false` (drafts only), or remove the crontab line (nothing runs). A published post is taken down by setting it Inactive in `/admin`.

---

## 7b. Editorial queue (added 29 Oct, second pass)

News can't produce locality guides or NRI due-diligence guides, so two slots in every eight-run cycle are **evergreen**: the pipeline drafts the next unused brief from `src/lib/ai/blogTopicQueue.ts`. The other six are news (luxury residential ×2, NRI ×2, investor/commercial, infrastructure). Each kind falls back to the other when it has nothing fresh.

| Brief | Supports page | Held for review? |
|---|---|---|
| NRI due-diligence checklist | `/nri-home-buying-process-india` | Always (regulated) |
| Buying in Ahmedabad from abroad | `/nri-buying-property-in-ahmedabad` | Always (regulated) |
| Checking a GujRERA registration | `/learn/rera-gujarat-guide` | Only if the gate flags it |
| 4 BHK or 5 BHK for your family | `/luxury-4bhk-ahmedabad` | Only if flagged |
| Rajpath Rangoli Road guide | `/locations/rajpath-club` | Only if flagged |
| Vaishno Devi Circle guide | `/locations/vaishno-devi` | Only if flagged |
| Gross vs net rental yield | `/investment-property-ahmedabad` | Only if flagged |
| Office or showroom as an investment | `/commercial-property-ahmedabad` | Only if flagged |
| Living near Ahmedabad's private clubs (lifestyle) | `/locations/rajpath-club` | Always (lifestyle) |

A brief's verified facts (with sources) are the only grounding: the figure check compares against those facts alone, so any other figure triggers a hold. The pipeline appends a link to the supported page if the model didn't include one, plus the brief's source credits. Each brief is used once (`source_url = brief:<id>`). Add briefs only with facts a person has checked.

## 8. Remaining risks and open questions

- **Factual accuracy is checked heuristically, not proven.** The figure check catches numbers absent from the source but not a wrong *claim* without numbers. Spot-check published posts weekly during the first month.
- **News quality varies by pillar.** If a pillar keeps producing rejects (see `blog_automation_runs`), tune its query/filter in `NEWS_PILLARS`.
- **The source article could be paywalled or blocked.** The draft then has no grounding text, every figure counts as unsupported, and it is held. That is intended.
- **Copyright:** posts are original analyses with a credited source and no copied images. Don't loosen the "never a scraped image" rule.
- **Byline:** unreviewed posts are credited to "PIKORUA Editorial Desk (AI-assisted market briefing)". Posts a person approves can carry a person's name. Management should confirm this transparency choice.
- **Google Indexing API** calls remain in `admin/actions.ts` (no-op without a key). Recommend removing them, since Google limits that API to job-posting and livestream pages.
- **Open decision:** whether management will ever authorize `BLOG_AUTOPUBLISH=true`. It stays false until the real integration, generated-content quality, duplication controls, error handling and publication safeguards are verified and management explicitly authorizes publication.
