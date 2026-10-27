# PIKORUA Realty: SEO + AEO Master Plan

> **Drafted:** 26 October 2026 · **Owner:** you (solo, full-time) · **Implementation partner:** Claude Code
> **Status:** plan only. Nothing in this document has been implemented yet.
> **Site:** https://www.pikorua.in (Next.js app in Docker on the Hostinger VPS, deployed from branch `vps-migration`)
>
> **Status update, 27 October 2026 [Measured]:** Still plan-only — no code from Part 4 has shipped yet. Today's session was triage/decisions only, no implementation:
> - **Deferred by your own choice (not blocked, not forgotten), no date set:** 4.1–4.9 code clean-up (sitemap/URL dedup, schema clean-up, RERA number, ContentGuard removal, combo-page fixes), 4.15 uptime monitoring, and 4.15 backups. See the "What to do next" note after Part 7.1 and the updated 4.15 section below.
> - **Resolved:** the 24 Oct firewall outage's root cause is now known — a coworker changed `ufw` by mistake. You've addressed it with him directly. No process fix (e.g. restricting who can touch `ufw`) has been decided yet; see Part 9.
> - **Re-attempted, still blocked:** the backlink profile (VibeSEO's tool still errors on `pikorua.in`) — see 3.4.
> - **In progress:** a Core Web Vitals/Lighthouse recheck. Google's PageSpeed API (no key) is still quota-exhausted; a local run via a freshly installed headless Chromium (Playwright) failed with `NO_FCP: The page did not paint any content` — not yet debugged. The 8/10 speed numbers in 3.1/3.2/4.12 are still yesterday's (26 Oct) lab numbers, unrefreshed.

---

<!-- Table of contents -->
**Contents:** [0. How to use](#part-0-how-to-use-this-document) · [1. Goal](#part-1-the-goal-defined-honestly) · [2. Primer](#part-2-primer-words-youll-see-everywhere) · [3. Current state](#part-3-current-state-of-everything-snapshot-26-oct-2026) · [4. Workstreams](#part-4-workstreams-the-improvements) · [5. Safety](#part-5-the-safety-system-built-in-week-1-before-any-seo-change) · [6. Measurement](#part-6-the-measurement-system-built-in-week-1) · [7. Timeline](#part-7-timeline-full-time-solo-as-fast-as-is-safe) · [8. Decisions](#part-8-decisions-only-you-or-your-boss-can-make) · [9. Risks](#part-9-risk-register) · [10. Additions](#part-10-what-i-added-beyond-your-request-and-why) · [Appendices](#appendix-a-core-30-query-set-baseline-26-oct-2026-google-approximation-via-firecrawl)

**Workstreams:** 4.1 Sitemaps · 4.2 `/p/` combo pages · 4.3 Duplicates · 4.4 Schema · 4.5 Homepage & ContentGuard · 4.6 Trust & RERA · 4.7 Content · 4.8 Local/GBP · 4.9 Brand & domains · 4.10 Off-site authority · 4.11 AI visibility · 4.12 Speed · 4.13 Analytics & attribution · 4.14 Conversion (incl. phone country picker) · 4.15 Operations · 4.16 Paid search (optional)


## Part 0: How to use this document

### 0.1 What this document is
This is the single source of truth for growing PIKORUA's visibility in two places:
1. **Search engines.** Google and Bing, where an HNI or NRI types a question and gets a list of links.
2. **AI assistants.** ChatGPT, Gemini, Perplexity, Google AI Overviews and AI Mode, and Copilot, where the person gets a written answer that may or may not name PIKORUA.

The goal is to turn that visibility into **NRI and HNI leads** for property in **Ahmedabad, GIFT City and Gandhinagar** (primary), with a small, separate track for **Dubai, Mumbai and Gurugram** (secondary).

### 0.1b Reading order
1. **Parts 0–3** (now): the goal, the vocabulary, and where we stand today.
2. **Part 5 (Safety system)** and **Part 6 (Measurement system)** next. Both are built in **Week 1, before any SEO change**: we can't prove a change worked without measurement, and we must be able to undo any change that hurts.
3. **Part 4 (Workstreams)**, one at a time, in the order of the timeline in **Part 7**.
4. **Parts 8–10**: decisions only you or your boss can make, the risk list, and what I added beyond your request (with reasons).
5. **Appendices**: query lists, the AI prompt panel, protected URLs, the evidence log and the sources.

### 0.2 How every improvement is written
Every workstream in Part 4 follows the same template, so you always know what to expect:

| Block | What it tells you |
|---|---|
| **Learn first** | What the thing is, how it works, why it matters for PIKORUA, and what happens if we skip it. Read this before doing anything. |
| **Current state** | Score out of 10, positives, negatives, and the measured evidence |
| **What we'll do** | The exact steps |
| **Before → After** | What the change is meant to buy you, and how we will prove it |
| **Implement safely** | How we change things without breaking what already works |
| **Did it work?** | Which number, in which tool, after how long |
| **If it underperforms** | How to find out why, and what to adjust |
| **If it hurts** | Warning signs, what to check, and how to roll back |

### 0.3 Evidence labels (so you always know how sure we are)
You asked for facts, not guesses. Some things are facts, but **future results can never be facts**. No one can measure next month's ranking today. So every claim carries a label:

| Label | Meaning | Example |
|---|---|---|
| **[Measured]** | I measured it on the live site or in the code on 26 Oct 2026, unless another date is given. It can be re-checked. | "29 sitemap URLs return 404" |
| **[Official]** | Stated in Google, Bing, OpenAI or another platform's own documentation. Links are in Appendix F. | "Google says only include URLs you want in search results in a sitemap" |
| **[Study]** | Third-party industry research. It shows a pattern (correlation), not a guarantee. | Ahrefs' study of brand mentions vs AI visibility |
| **[Target]** | A goal we set, which we then measure against. Not a prediction. | "0 errors in the Page indexing report" |
| **[Judgement]** | My professional opinion, with the reasoning stated, used where no fact exists | "Fix broken pages before writing new content" |
| **[Unverified]** | Something I could not check, and why | Backlink counts: the tool was broken |

**Rule for the whole project:** a "Before" number must be **[Measured]**. An "After" number is a **[Target]** until we measure it.

### 0.4 How we'll work together on each item
1. I explain the item. The "Learn first" block here is the short version; before we implement, I expand it for you in chat.
2. You ask questions until it's clear.
3. You say "go".
4. I make the change in small steps, test it on your Mac, and run the automatic checker.
5. You deploy, with copy-paste commands from me.
6. We run the post-deploy check, log the change in the change log (Part 5), and set a date to judge the result.

Nothing changes on the live site without your explicit "go".

---

## Part 1: The goal, defined honestly

### 1.1 What you asked for
"Whenever anyone (HNI, NRI, anyone) searches anything about real estate, property buying or investing, this website should always rank on top in all cases. If someone asks an LLM, PIKORUA should always pop up on top."

### 1.2 What is and isn't achievable (and why)
| Part of the goal | Achievable? | Why (facts) |
|---|---|---|
| #1 for **every** real-estate search, for everyone | **No** | Broad searches such as "property in Ahmedabad", "penthouse for sale in Ahmedabad" and "luxury villas in Ahmedabad" are held by portals and developers: 99acres, MagicBricks, Housing.com, Adani Realty [Measured]. They list thousands of properties; PIKORUA's sitemap lists 21 property pages [Measured]. Google ranks the result it thinks best serves the searcher, and for "show me penthouses for sale" that is a big inventory list. |
| AI assistants **always** naming PIKORUA first | **No** | AI answers vary from run to run, by user, and by model version. No company can lock an answer. |
| **Owning the niche:** luxury + HNI + NRI searches for Ahmedabad / GIFT City / Gandhinagar, plus every search that names PIKORUA | **Yes, realistic** | You already rank **#1** for "best luxury property consultant in Ahmedabad for NRI" and for a US-searched NRI query, **#3** for "NRI property investment Ahmedabad" and "best area to buy luxury flat in Ahmedabad", and **#4** for "luxury real estate consultant Ahmedabad" [Measured]. The base exists. |
| Being **one of the names** AI assistants mention for these niche questions | **Yes, with off-site work** | Google says AI Overviews and AI Mode have **no special technical requirements** beyond normal SEO [Official]. Industry research finds that brand mentions on other websites, and YouTube, correlate most with being named by AI [Study]. Both are earnable. |

### 1.3 The goal we will actually chase (measurable)
1. **Win the money searches.** Top 3 in Google for the "Core 30" query list (Appendix A): luxury, HNI and NRI searches for our region, plus the NRI country searches done from the US, UK, UAE, Canada, Singapore and Australia. [Target]
2. **Own the brand.** #1 for "pikorua" alone, not just "pikorua realty", with a clean first page: website, Google Business Profile, LinkedIn, YouTube, and directory listings with matching details. [Target]
3. **Get named by AI.** PIKORUA mentioned in a growing share of answers to the "AI Prompt Panel" (Appendix B), measured monthly in ChatGPT, Gemini, Perplexity and Google AI Mode. [Target]
4. **Turn it into business.** More qualified NRI/HNI leads with a known source (organic Google, AI assistants, Maps, direct), measured in the lead database and analytics. [Target]

### 1.4 How long this takes (official expectations)
- Google's own guidance on hiring an SEO says it typically takes **four months to a year** to implement improvements and see potential benefit [Official].
- Fixes to crawling and indexing show up in Search Console reports as Google recrawls, usually over **days to weeks** [Official: Google says changes are reflected as pages are recrawled; timing varies].
- Google Business Profile changes and new reviews show up much faster, typically within days.
- **What this means for your boss:** SEO is the slow, compounding channel. If the business needs leads **this month**, paid search or ads should run in parallel (section 4.16). That is a business decision, not an SEO one.

---

## Part 2 (Primer): Words you'll see everywhere

Read once now; come back whenever a word is unclear.

| Term | Plain-English meaning |
|---|---|
| **SEO** (Search Engine Optimisation) | Making the website and the brand easy for Google and Bing to find, understand and trust, so they show it higher |
| **AEO / GEO** (Answer / Generative Engine Optimisation) | The same idea for AI assistants: being the business they mention and cite in written answers |
| **SERP** | Search Engine Results Page: the page of results you see after searching |
| **Crawl / crawler / bot** | Google's program (Googlebot) visits pages by following links and sitemaps. Each AI company has its own bots (GPTBot, OAI-SearchBot, PerplexityBot, ClaudeBot). |
| **Index / indexed** | After crawling, Google stores the page in its database (the index). Only indexed pages can rank. |
| **Rank / position** | Where a page appears for a search (#1 = top) |
| **Sitemap** | A file listing the URLs we want search engines to index. Ours: `/sitemap.xml` and `/sitemap/index.xml`. |
| **robots.txt** | A file telling bots which areas they may not crawl |
| **noindex** | A tag on a page saying "don't put this page in the index" |
| **Canonical** | A tag saying "this is the main version of this page". It helps when similar pages exist. |
| **301 redirect** | A permanent forward from an old URL to a new one. Google transfers the old URL's ranking signals to the new one. |
| **404** | "Page not found." Fine for pages that never existed; bad when we tell Google to crawl them. |
| **Structured data / schema** | Hidden, machine-readable labels in the page code (JSON-LD) that say "this is a business, this is its address, this is a FAQ…" |
| **E-E-A-T** | Experience, Expertise, Authoritativeness, Trust: how Google's guidelines describe what makes content credible. Especially important for money decisions like property. |
| **YMYL** | "Your Money or Your Life": topics such as finance and property, where Google applies stricter quality expectations |
| **Backlink** | A link from another website to ours. Links from relevant, trusted sites act like votes of confidence. |
| **Referring domain** | A unique website linking to us. 100 links from one site count as 1 referring domain. |
| **Brand mention** | Another website writing "PIKORUA Realty", with or without a link |
| **NAP** | Name, Address, Phone: the business details that should be identical everywhere online |
| **GBP** (Google Business Profile) | The business listing in Google Maps and the local "map pack" |
| **Local pack / map pack** | The 3 businesses Google shows with a map for local searches |
| **GSC** (Google Search Console) | Google's free tool that shows how Google sees the site: rankings, clicks, indexing errors |
| **BWT** (Bing Webmaster Tools) | Bing's version of GSC |
| **GA4 / GTM** | Google Analytics 4 measures visitors and leads. Google Tag Manager is the container that loads GA4 and other tags without code changes. |
| **Core Web Vitals (CWV)** | Google's speed and smoothness metrics: LCP (loading), INP (responsiveness), CLS (visual stability) |
| **CrUX** | Chrome User Experience Report: real speed data from real Chrome users. It only exists once a site has enough traffic. |
| **ISR / revalidation** | Our site pre-builds pages and caches them. "Revalidation" tells it to rebuild a page after content changes. |
| **Programmatic pages** | Pages generated automatically from templates and data. Ours are the `/p/` "combo" pages. |
| **Doorway pages** | Google spam-policy term: many similar pages made to rank for slight query variations, which funnel users to the same place [Official]. |
| **Deploy** | Putting a new version of the code on the live server (our `deploy/deploy.sh`) |
| **Rollback / revert** | Going back to a previous working version |
| **Commit** | One saved, labelled change in git (the version history of the code) |
| **Feature flag** | An on/off switch for a feature, so it can be enabled or disabled without changing code |
| **CTR** | Click-through rate: of the people who saw our result, the % who clicked |
| **Impressions** | How many times our result was shown in search |
| **Key event / conversion** | An action we care about, here a lead submission |

---

## Part 3: Current state of everything (snapshot, 26 Oct 2026)

### 3.1 Scorecard
| # | Area | Score /10 | One-line reason | Workstream |
|---|---|---|---|---|
| 1 | Speed / Core Web Vitals | **8** | Lab: mobile Performance 90, desktop 93. No real-user data exists yet because traffic is too low. | 4.12 |
| 2 | AI crawler access | **7** | Every major AI bot gets a full 200 response; robots.txt allows them | 4.11 |
| 3 | Rankings today | **6** | #1–#5 on NRI and consultant searches; absent from product searches and from the brand-only search | All |
| 4 | Technical foundation | **6** | HTTPS, HSTS, server-rendered HTML, Lighthouse SEO 100; but 29 broken sitemap URLs and sitemap errors | 4.1 |
| 5 | Content and trust (E-E-A-T) | **4** | Strong NRI guides; but templated location pages, misleading combo pages, no RERA number shown, unsupported claims | 4.5–4.7 |
| 6 | Structured data | **4** | Broad coverage, but self-serving reviews, 205 padded "knowsAbout" phrases, wrong aliases, retired features | 4.4 |
| 7 | Local SEO | **3** | 53 Justdial reviews at 4.9, but 5 different addresses online, a duplicate listing, and a Google profile you can't access | 4.8 |
| 8 | Indexing and site structure | **2** | 19,564 noindex URLs in the sitemap, 436 misleading indexable combo pages, duplicate URL families | 4.2, 4.3 |
| 9 | Brand and entity strength | **2** | Not in the top 20 for "pikorua" alone; satellite domains and a public prototype split the brand | 4.9 |
| 10 | Off-site authority | **2** | Absent from all 7 checked "best consultant" lists; YouTube channel has 24 subscribers | 4.10 |
| 11 | Measurement / analytics | **1** | **No analytics is running on the live site**; no Search Console access; leads don't record their traffic source | 4.13, Part 6 |
| 12 | AI answer visibility | **not measured** | No AI API access in this environment; the proxy evidence (listicles) points to low visibility | 4.11 |

**Overall: about 4.4 / 10.** Strong: speed, AI crawler access, NRI pages. Weak: structure, trust, brand, off-site authority, measurement.

### 3.2 Positives (keep and protect these)
- **Pages that already rank. Never break these** (protected list in Appendix C):
  - `/luxury-property-consultant-ahmedabad`: **#1** for "best luxury property consultant in Ahmedabad for NRI"
  - `/nri-property-from-usa`: **#1** for "buy luxury apartment in Ahmedabad from USA NRI" (searched from the US)
  - `/nri-property-investment-ahmedabad`: **#3**
  - `/nri/dubai`: **#3** (searched from the UAE)
  - `/luxury-apartments-ahmedabad`: **#3** and **#5**
  - Homepage: **#4** for "luxury real estate consultant Ahmedabad"; **#1** for "pikorua realty" [Measured]
- **Speed:** mobile LCP 2.6 s, CLS 0.002, TBT 0 ms; desktop LCP 0.7 s [Measured, PageSpeed lab].
- **Lighthouse:** SEO 100, Accessibility 97, Best Practices 96 [Measured].
- **Server-rendered HTML:** bots see the full content without running JavaScript [Measured].
- **All AI bots allowed and served** (GPTBot, OAI-SearchBot, PerplexityBot, ClaudeBot, Google-Extended, Bingbot) [Measured].
- **Justdial:** 53 reviews at 4.9 on the Bodakdev listing [Measured].
- **A solid lead pipeline:** forms → database in one transaction → CRM feed. It must not be touched carelessly.
- **Real NRI country guides** (USA, UK, UAE, Canada, Singapore, Australia) that rank abroad [Measured].

### 3.3 Negatives (each fixed in a workstream)
| Problem [all Measured] | Fix in |
|---|---|
| **Analytics not running:** GTM, GA4 and Clarity are coded, but no IDs are set in production (live HTML only has a dns-prefetch) | 4.13 |
| **Leads don't record where they came from:** only UTM tags are stored. Organic Google visitors have no UTM tags, so SEO leads can't be identified. | 4.13 |
| **No Search Console access for you.** The Google verification meta tag holds a file name instead of a token (`layout.tsx` line 99). An HTML verification file is live, so **someone already owns a Search Console property** with history. | 6.2 |
| 29 sitemap URLs return 404 | 4.1 |
| 19 blog posts exist, but **0 blog URLs are in any sitemap** | 4.1 |
| `sitemap.xml` lists 11 sitemap files as if they were pages | 4.1 |
| 20,000 `/p/` combo URLs in sitemaps, of which **19,564 are noindex** | 4.2 |
| 436 indexable combo pages. The budget filter does nothing, so "Under ₹1 Cr" pages show ₹3.5 Cr+ homes, and loose location matching shows the wrong area. | 4.2 |
| Combo pages read a hardcoded file of 21 properties, not the database | 4.2 |
| 152 combo URLs for retail / warehouse / commercial plots, which conflict with the residential-first rule. (Correction to my earlier message: 216 is the total commercial count, and 64 of those are office pages, which the rules allow.) | 4.2 |
| Duplicate URL families competing for the same searches: property types, locations, NRI country pages | 4.3 |
| Structured data: self-serving 5.0 rating; `knowsAbout` with 205 entries; 34 misspelling aliases including "pakora" and "pikorua.com" (a domain owned by a third party); retired SearchAction; meta keywords | 4.4 |
| Homepage H1 "Trust what most luxury buyers have trusted." has no search terms; 655 words | 4.5 |
| ContentGuard blocks copy, select, right-click, print, Cmd+A/S/P and PrintScreen for every visitor | 4.5 |
| No RERA registration number shown anywhere (`BUSINESS_RERA_REGISTRATION = null`) | 4.6 |
| Templated location copy: "X is a relevant Ahmedabad luxury residential corridor…" on every location page | 4.7 |
| 5 different addresses online; a duplicate Justdial listing with 0 reviews; "PIKORUA Realty" vs "Pikorua Properties" | 4.8 |
| Brand search "pikorua" returns no pikorua.in result in the top 20 | 4.9 |
| Satellite and duplicate brand sites: millionmindstechcity.in (registered to "PIKORUA"), pikoruarealty.com, and the public Lovable prototype claiming "since 2009" | 4.9 |
| Absent from 7 of 7 checked "best consultant" articles | 4.10 |
| No uptime monitoring. The 24 Oct outage (firewall change, ~35 min) was found by accident. **Root cause now known [Measured, 27 Oct 2026]:** a coworker changed `ufw` by mistake; you've addressed it with him directly. Monitoring itself is still not set up — deferred by your own choice on 27 Oct 2026, no date set. | 4.15 |
| Live server has an Nginx change that isn't committed to git; `CLAUDE.md` still says PM2, but the site now runs in Docker | 4.15 |

### 3.4 What I could NOT verify (and how we'll get it)
| Unknown | Why unknown | How we get it |
|---|---|---|
| Backlink profile | The SEO tool (VibeSEO) errored on every call. **Re-attempted 27 Oct 2026 for `pikorua.in`: same error** ("Tool get_backlink_profile has an output schema but did not return structured content"). Still [Unverified]. | Ahrefs Webmaster Tools (free once the site is verified), section 6.6, or wait for VibeSEO to be fixed, or you supply an export/screenshot from Ahrefs/SEMrush/Ubersuggest if you have access to one |
| Real AI answers | No AI API keys here; Perplexity requires login | Monthly manual AI Prompt Panel (Appendix B) and/or Finseo |
| Google Business Profile rating, reviews, address | Google Maps blocked automated reading | You claim access (6.4) and read it directly |
| Search Console history (clicks, queries, indexed pages) | No access | Get added to the existing property (6.2) |
| Real traffic and lead sources | Analytics off; leads lack a source | 4.13 |

---
## Part 4: Workstreams (the improvements)

> Each workstream uses the template from section 0.2. "If it hurts" points to the general rollback runbook in **Part 5.6**; only workstream-specific details are repeated here.

---

### 4.1 Site health: broken URLs and sitemaps

**Learn first**
- **What it is.** A sitemap is a list we hand to Google and Bing saying "these are the pages we want in search results". Ours has three problems: (1) it lists pages that return 404, (2) it leaves out pages we do want found (blog posts), and (3) it lists other sitemap files as if they were pages.
- **How it works.** Google reads the sitemap, schedules those URLs for crawling, and reports problems in Search Console ("Submitted URL not found (404)", "Submitted URL marked 'noindex'"). Google says a sitemap should include the URLs you want to appear in search results, meaning canonical, indexable URLs [Official]. Sitemaps are a *hint*, not a command: Google may ignore URLs it judges low-value.
- **Why it matters for PIKORUA.** An accurate sitemap helps Google find our best pages, the blog posts included, quickly. A sitemap full of errors and noindex URLs makes the Search Console reports so noisy that we can't spot real problems, and it sends Google conflicting messages. Being honest about scale: Google's crawl-budget documentation says crawl budget mainly matters for very large sites (about 1M+ pages) or 10k+ page sites whose content changes daily [Official]. So the benefit here is **clean signals and measurability, not "more crawl"**. [Judgement]
- **If we skip it.** The 19 blog posts depend on internal links alone to be discovered. Search Console stays cluttered with 29 404s and about 19,564 "submitted but noindex" warnings, which hides real issues. Every later improvement becomes harder to measure.

**Current state: 6/10 for this area** [all Measured]
- ✅ Positives: sitemaps exist and load fast; robots.txt points to both; 206 of 235 non-combo sitemap URLs return 200, are indexable, and point their canonical at themselves.
- ❌ Negatives:
  - 29 sitemap URLs return 404: 28 under `/ahmedabad/...` plus `/nri/global/invest-in-ahmedabad-real-estate` (full list in Appendix D).
  - **Root cause 1:** `src/app/ahmedabad/[type]/page.tsx` line 76 rebuilds each page's ID as `ahmedabad-${segment}`. Long-tail pages have IDs that don't match their URL. For example, the page with ID `ahmedabad-best-areas-to-invest` lives at `/ahmedabad/best-areas-to-invest-in-real-estate`, so the lookup fails and returns 404.
  - **Root cause 2:** location-and-type URLs such as `/ahmedabad/thaltej/luxury-flats` are never generated, because `dynamicParams = false` and the `[type]/[filter]` route only builds filter pages.
  - 0 of the 19 blog posts linked from `/blog` appear in any sitemap.
  - `sitemap.xml` lists 11 sitemap files (`/sitemap/index.xml`, `/sitemap/p-0.xml`…) as `<url>` entries.

**What we'll do**
1. Record a "before" snapshot: a script saves every sitemap URL with its status, robots tag and canonical (we did this once already; it becomes repeatable).
2. Add every published blog post to the sitemap, with its real last-modified date.
3. Stop listing sitemap files as page URLs in `sitemap.xml`. They already belong in `/sitemap/index.xml` and robots.txt.
4. For the 29 broken URLs, decide each one in workstream 4.3: either **build** it (if it covers a unique topic that no existing page covers) or **drop it from the sitemap** (if it duplicates an existing page). Recommended default: drop from the sitemap now (zero risk, since nothing ranks on a 404), and rebuild the few unique informational ones later as proper pages.
5. Fix the ID lookup so pages defined in the data files either work or are not listed. The sitemap must be generated from the **same list** that the routes can actually render, so this bug class can't come back.
6. Add a permanent check to the automatic checker (Part 5.3): **every sitemap URL must return 200, be indexable, and point its canonical at itself**. The deploy is blocked otherwise.

**Before → After**
| Metric | Before [Measured] | After [Target] | Where we verify |
|---|---|---|---|
| Sitemap URLs returning 404 | 29 | 0 | Checker + GSC Page indexing report |
| Blog posts in the sitemap | 0 of 19 | 19 of 19 (all published posts) | Checker |
| Non-page entries in `sitemap.xml` | 11 | 0 | Checker |
| GSC "Submitted URL not found (404)" | unknown (no access) | 0 within ~4 weeks of resubmitting | GSC |

What it buys you: a clean, trustworthy sitemap; faster discovery of blog posts; readable Search Console reports. [Judgement] On its own it is unlikely to move rankings much. It is groundwork that makes the bigger fixes measurable.

**Implement safely**
- Only sitemap generation and the `ahmedabad` route lookup change. No page content, lead forms or admin code is touched.
- The "before/after URL diff" script prints every URL that **leaves** the sitemap. We read that list together; no protected URL (Appendix C) may appear on it.
- Test locally with a production build (`npm run build && npm start`) plus the checker, then deploy.

**Did it work?** Run the checker right after deploy (immediate). Then GSC → Indexing → Sitemaps: "Success", with no "couldn't fetch". GSC → Pages: the 404 count falls over 2–4 weeks as Google recrawls.

**If it underperforms.** If GSC still shows 404s after 4 weeks, use URL Inspection on a few of them. If they show "URL is unknown to Google" or a crawl date older than the fix, Google simply hasn't recrawled yet; click "Request indexing" on the important ones. If new 404s appear, the checker will name them.

**If it hurts.** Very unlikely: removing a URL from the sitemap doesn't de-index it. If a protected URL accidentally left the sitemap, revert the commit (Part 5.6) and re-add it.

---

### 4.2 Programmatic `/p/` combo pages (the biggest structural risk)

**Learn first**
- **What it is.** "Programmatic SEO" means generating many pages from a template and a data grid. Our grid: 50 locations × 8 types × 4 BHK × 5 budgets × 4 intents. That produced **20,000 URLs** under `/p/`, such as `/p/thaltej/luxury-flats/4-bhk/under-1-cr/for-investment`.
- **How it works.** Each combo page fills a template with that combination and lists the "matching" properties. If nothing matches, it marks itself noindex.
- **Why it matters for PIKORUA.**
  - Google's spam policies define **doorway abuse**: sites or pages created to rank for specific, similar queries that lead users to essentially the same destination [Official].
  - They also define **scaled content abuse**: many pages generated primarily to manipulate rankings rather than to help users [Official, added March 2024].
  - Google says its core ranking systems work mainly at page level but also use some site-wide signals [Official]. In plain words, a large mass of low-value pages can weigh on how the whole site is judged.
  - For a luxury brand there is also a **trust problem**. A buyer who lands on "5 BHK Villas in Drive-in Road Under ₹1 Cr" and sees a ₹14.50 Cr bungalow in Thaltej loses confidence immediately.
- **If we skip it.** We keep 436 indexable pages that misstate prices and locations, 20,000 URLs of sitemap noise, and an open exposure to Google's spam policies (manual actions or algorithmic demotion). That exposure exists whether or not it has been triggered yet. [Official policy + Judgement on likelihood]

**Current state: 2/10** [all Measured]
- ✅ Positives: noindex is applied when nothing matches, so 97.8% of combos are kept out of the index. Some `/p/` pages are indexed and may get impressions (e.g. `/p/iscon-ambli-road`, `/p/vastrapur`). **We must check them in GSC before touching them.**
- ❌ Negatives:
  - 20,000 combo URLs in sitemaps: **19,564 noindex, 436 indexable**.
  - **The budget filter is a no-op.** `src/app/p/[...combo]/page.tsx` line 103 returns `true` for any budget, so each budget band gets exactly 80 indexable pages. 80 indexable "Under ₹1 Cr" pages list multi-crore homes; for example, "4 BHK Luxury Flats in Thaltej Under ₹1 Cr" lists a ₹3.5–5.5 Cr property in Shilaj.
  - **Loose location matching** (line 74) splits slugs into words, so "drive-**in**-**road**" matches unrelated listings.
  - Matching reads `STATIC_PROPERTIES`, a hardcoded file of 21 properties, **not the database**. Properties added in `/admin` never appear on combo pages.
  - The dimensions include `retail-space` (54 URLs), `commercial-plots` (49) and `warehouse` (49). These conflict with the residential-first rule in `CLAUDE.md`. `office-space` (64) is allowed under the office/showroom add-on.
  - 26 of the top 100 `site:pikorua.in` results are `/p/` pages, so Google has indexed some of them.

**What we'll do (data first, in stages)**
1. **Stage 0: get data (needs GSC, Part 6).** Export 16 months of page-level clicks and impressions for every `/p/` URL. Sort into:
   - **A:** has clicks, or meaningful impressions (threshold agreed once we see the data)
   - **B:** indexed but no traffic
   - **C:** noindex or never indexed
2. **Stage 1: stop the bleeding (fully reversible).**
   - Fix the budget filter. A property whose price is missing or unparseable never matches a budget.
   - Switch to exact location matching through an explicit alias map.
   - Match against **database** properties.
   - Remove the retail, warehouse and commercial-plot dimensions from the sitemap.
   - Remove all `/p/` URLs from the sitemap except group A.
   - Result: no misleading page stays indexable, because a page that no longer matches anything turns noindex.
3. **Stage 2: consolidate (after 2–4 weeks of watching).** Each group-A page gets a decision:
   - keep it as a curated page (real inventory, at least 3 matching properties, unique useful content), or
   - 301-redirect it to its closest canonical page (e.g. `/p/vastrapur` → `/locations/vastrapur`).

   Group B: noindex now; 301 or remove later. Group C: stop generating them (return 404/410 for un-curated combos), in batches.
4. **Stage 3: decide the long-term role of `/p/`.** Recommended [Judgement]: a **small curated set** (e.g. location hubs with real inventory) instead of an unlimited grid. 21 listings cannot honestly fill 20,000 pages.
5. Update internal links (`combo-linker`) so the site never links to removed or noindexed combos.

**Before → After**
| Metric | Before [Measured] | After [Target] |
|---|---|---|
| `/p/` URLs in sitemaps | 20,000 | Group A only (expected to be small; decided by data) |
| Indexable combo pages | 436 | Only pages with ≥3 real matching DB properties |
| Pages showing prices outside their stated budget | 80 "Under ₹1 Cr" pages plus every other band | 0 (checker verifies) |
| Combo pages using DB inventory | No | Yes |
| Non-allowed commercial dimensions | 152 URLs | 0 |

What it buys you: removes the biggest policy and trust risk on the site; pages that are left show honest information; Google's view of site quality is no longer diluted by thousands of thin templates [Official policies; ranking impact = Judgement]. Honest caveat: if some `/p/` pages currently bring traffic, removing them **could** lose that traffic unless we redirect correctly. That is exactly why Stage 0 comes first.

**Implement safely**
- Every stage ships behind a **feature flag** (Part 5.4), e.g. `combo_strict_matching`, `combo_sitemap_curated`. Flags can be switched off in `/admin` instantly.
- Stage 1 is fully reversible: sitemap entries and noindex tags can be restored.
- Stage 2 redirects are **less reversible**. Browsers and Google cache 301s, so we do them in **batches of about 20 URLs** and watch each batch for 2 weeks.
- We never redirect a URL that sits on the protected list without a separate discussion.
- The checker gains a rule: "an indexable combo page must list ≥3 properties, and every listed property must match the page's location, type, BHK and budget".

**Did it work?**
- Week 0–2: the checker passes; GSC "Submitted URL marked noindex" starts falling.
- Week 2–8: GSC Pages report shows the noindex/excluded counts dropping. Group-A pages keep, or pass on, their clicks: compare each old URL's clicks against its redirect target's in GSC.
- Month 2–6: watch sitewide impressions and clicks for non-combo pages. [Judgement] A gradual improvement is plausible but not guaranteed; we report what the data shows.

**If it underperforms** (no visible change after 3 months): check whether Google still indexes the removed combos (GSC → Pages → "Indexed"). Use URL Inspection on samples. If they're still indexed, the noindex or redirect may not be served. The checker verifies that.

**If it hurts:**
- Signal: a group-A URL's clicks drop and the redirect target doesn't gain them within 3–4 weeks.
- Diagnose: is the target page relevant to that query? Use GSC → filter by the old URL → Queries.
- Fix: choose a better target, or restore the page as a curated keeper.
- Emergency: turn off the flag (restores old behaviour without a deploy), or revert the commit (Part 5.6).

---

### 4.3 Duplicate URL families (pages competing with each other)

**Learn first**
- **What it is.** When several of our pages target the same search, for example `/penthouses-ahmedabad` and `/ahmedabad/penthouses`, they compete. SEOs call this **keyword cannibalisation**.
- **How it works.**
  - Google groups duplicate or very similar pages and picks **one** to show, the canonical. It may not pick the one we want, and it may switch over time.
  - A 301 redirect, or `rel=canonical`, tells Google which one we prefer and consolidates signals (links, history) into it [Official: Google "consolidate duplicate URLs"].
  - Google recommends keeping redirects in place for a long time; for site moves it says at least 1 year [Official].
- **Why it matters for PIKORUA.** We have limited authority (few backlinks and mentions). Splitting it across 2–4 URLs per topic makes each one weaker. One strong page per topic beats three weak ones. [Judgement, standard practice]
- **If we skip it.** Rankings can flip between our own duplicates, which looks like volatility. Links and engagement stay split. Every content update has to be made 2–4 times, and the copies drift apart.

**Current state: 3/10** [all Measured]

The families found so far (complete list in Appendix D after the inventory step):

| Topic | Competing URLs (all indexable, each canonical to itself) |
|---|---|
| Penthouses | `/penthouses-ahmedabad`, `/ahmedabad/penthouses` |
| Luxury apartments / flats | `/luxury-apartments-ahmedabad` (ranks #3 and #5), `/ahmedabad/luxury-flats` |
| Location (e.g. Vastrapur) | `/locations/vastrapur`, `/p/vastrapur` (+ the 404 `/ahmedabad/vastrapur/...` family) |
| Consultant / real estate | `/luxury-real-estate-ahmedabad`, `/real-estate-consultant-ahmedabad`, `/luxury-property-consultant-ahmedabad` (#1), homepage (#4) |
| NRI from USA | `/nri-property-from-usa` (#1 US), `/nri/usa`, `/nri/usa/property-investment-ahmedabad`, `/nri/usa/luxury-flats-ahmedabad` |
| NRI from UAE / Dubai | `/nri-property-from-uae`, `/nri-property-from-dubai`, `/nri/dubai` (#3 UAE), `/nri/dubai/property-investment-ahmedabad`, `/nri/dubai/luxury-flats-ahmedabad` |
| NRI UK / Canada / Singapore / Australia | the same pattern: `/nri-property-from-X` + `/nri/X` + `/nri/X/...` |

**What we'll do**
1. **Build a URL inventory** (a spreadsheet; I generate it). For every indexable URL record: topic, main query, GSC clicks/impressions/position, current rank from our tracker, internal links pointing to it, word count.
2. **Group by search intent.** Two URLs belong together if a searcher would be equally happy with either.
3. **Pick one winner per group, using data.** The default winner is whichever already ranks or gets clicks. The **protected URLs always win their group** (e.g. `/nri-property-from-usa` beats `/nri/usa`), even if their URL pattern looks "less tidy". We don't sacrifice working rankings for neat URLs.
4. **Merge** the best unique content from the losers into the winner.
5. **301 the losers** to the winner, add the redirects to `next.config.ts` (29 redirects exist today), update every internal link and the sitemap.
6. **Batch order:** first, groups where no URL has traffic (zero risk); then groups with small traffic; last, groups that include a protected URL. Two weeks of watching between batches.
7. The decided structure is written into `CLAUDE.md`, so nobody (human or AI) recreates the duplicates.

**Before → After**
| Metric | Before | After [Target] |
|---|---|---|
| Indexable URLs per topic | 2–5 [Measured] | 1 |
| Protected URL rankings | as measured (Appendix C) | same or better |
| Internal links pointing at redirected URLs | many | 0 (checker verifies) |

What it buys you: stronger single pages; one place to improve content; stable rankings. [Judgement] The ranking gain per topic varies and is measured, not promised.

**Implement safely.** Redirects go in one place (`next.config.ts`); each batch is one commit; the checker verifies every redirect returns a single 301 hop to a 200 page, with no chains or loops.

**Did it work?** For each merged group, after 2–6 weeks, the winner's impressions in GSC are at least roughly the sum of the group's before, and its position is the same or better.

**If it underperforms.** The winner gained impressions but not position: the content may not match the intent well enough, so improve it (4.7). The losers are still indexed after 6 weeks: check that the 301 is served (checker) and use URL Inspection.

**If it hurts** (the winner's position drops for a query the loser used to rank for): the loser probably served a different intent. Revert that one redirect, keep both pages, and make them clearly different (different target queries and content).

---

### 4.4 Structured data (schema) clean-up

**Learn first**
- **What it is.** Code labels (JSON-LD) in each page that tell machines "this is a real-estate business called PIKORUA Realty, at this address, founded by this person". Search engines and AI systems use it to understand the business as an **entity**.
- **How it works.**
  - Google reads it for rich results (special result formats) and for understanding.
  - Google's guidelines say markup must represent the visible content of the page, and spammy or misleading markup can lead to a manual action [Official].
- **Specific facts that apply to us:**
  - Google stopped showing review stars for **self-serving reviews**, meaning reviews a business publishes about itself on its own LocalBusiness/Organization markup, in September 2019 [Official].
  - **FAQ rich results** have been limited to well-known government and health websites since August 2023 [Official].
  - The **sitelinks search box** (`SearchAction`) was retired in November 2024 [Official].
  - Google has ignored the **meta keywords** tag since at least 2009 [Official].
  - Google's site-name documentation describes `alternateName` for genuine alternate names such as acronyms, not misspellings [Official].
- **Why it matters for PIKORUA.** Clean, consistent entity data helps search engines and AI systems understand who we are and connect the website to our Google profile, LinkedIn and YouTube. The current markup also carries a policy risk: a 205-phrase `knowsAbout` list including "Best luxury property consultant Ahmedabad" is keyword stuffing inside markup.
- **If we skip it.** Continued risk of a structured-data manual action. The entity stays muddled (it claims "pakora" and "pikorua.com", a domain someone else owns, as our names). We carry 34.8 KB of extra code on every page.

**Current state: 4/10** [all Measured]
- ✅ Positives: a proper `@graph` with WebSite, RealEstateAgent/LocalBusiness, founder Person, sameAs links, areaServed, and ItemLists.
- ❌ Negatives (homepage):
  - JSON-LD is 34,772 bytes.
  - `aggregateRating` 5.0 (6 reviews) plus 2 `review` entries: self-serving.
  - `knowsAbout`: 205 entries.
  - `alternateName`: 34 entries, including "pakora", "pikorua.com", "pikora.com", "pikoraa.com".
  - `SearchAction` is present.
  - `<meta name="keywords">` is 345 characters.
  - `sameAs` links carry tracking parameters (`?igsh=…`, `?si=…`, `mibextid=…`) and a Google Maps **reviews** link instead of the place link.
  - The address doesn't match the directories (see 4.8).
  - The same aliases are repeated in `llms.txt` and `facts.json`.

**What we'll do**
1. Drop: `aggregateRating`/`review` from the business markup, `SearchAction`, `meta keywords`, misspelling aliases (keep only real names such as "PIKORUA", "Pikorua Realty", "PIKORUA Realty"), and `knowsAbout` padding (keep ≤15 genuine expertise topics).
2. Clean `sameAs`: canonical profile URLs without tracking parameters; the Google Business Profile **place** URL.
3. Single source: all business facts (name, address, phone, RERA, founding year, areas served) come from `src/lib/entity-profile.ts` and feed the schema, `llms.txt` and `facts.json`, so the three always match.
4. Keep FAQPage markup **only** where the same Q&As are visible on the page. It won't produce rich results, but it is valid and can help understanding.
5. Validate every page type with Google's Rich Results Test and the Schema.org validator. Add a checker rule: JSON-LD parses, and no banned fields are present.

**Before → After**
| Metric | Before [Measured] | After [Target] |
|---|---|---|
| Homepage JSON-LD size | 34.8 KB | under ~10 KB |
| `knowsAbout` entries | 205 | ≤15 genuine |
| `alternateName` entries | 34 | 1–3 real names |
| Self-serving rating markup | present | removed |
| GSC structured-data errors and warnings | unknown | 0 |

What it buys you: removes a manual-action risk, gives a cleaner entity, and makes pages lighter. We lose nothing visible: self-serving stars can't show anyway [Official].

**Implement safely.** Markup only; no visible change. Test on every page template locally (home, property, location, NRI, blog), then deploy.

**Did it work?** Rich Results Test passes; GSC → Enhancements shows no errors after recrawl (2–4 weeks); the knowledge panel and brand result keep showing correct details.

**If it underperforms / hurts.** A rich result that worked before disappears (unlikely; none is eligible today): check GSC Enhancements and revert the specific removal.

---

### 4.5 Homepage and on-page basics (titles, H1, ContentGuard)

**Learn first**
- **What it is.**
  - The **title tag** is the blue headline in search results.
  - The **H1** is the main visible heading on the page.
  - **Meta descriptions** are the grey text under the title.
- **How it works.** Google uses titles and headings, along with all the content, to understand a page's topic. It shows the title, though it sometimes rewrites it, and the snippet in results. A clear, specific title earns more clicks (CTR).
- **ContentGuard** is a script that blocks copying, selecting, right-clicking, printing and several keyboard shortcuts for every visitor. Its own code comment admits it "is a deterrent layer, not DRM". Bots and AI crawlers read the HTML directly, so it doesn't stop scraping by them. [Measured from code]
- **Why it matters for PIKORUA.** NRI and HNI buyers copy addresses into WhatsApp, forward pages to family abroad, and print or save shortlists. Blocking that adds friction to the exact actions that lead to an enquiry. [Judgement] It also gets in the way of users who rely on text selection and assistive tools.
- **If we skip it.** The homepage keeps an H1 that tells Google and users nothing about what we do ("Trust what most luxury buyers have trusted."), and visitors stay blocked from normal behaviour.

**Current state: 5/10** [Measured]
- ✅ The title "Luxury Real Estate Consultants Ahmedabad" is good. The meta description names HNIs, NRIs, 4–5 BHK, penthouses, villas and plots. Lighthouse SEO is 100.
- ❌ The H1 has no topic words; 655 visible words; ContentGuard is active site-wide (`src/app/layout.tsx` line 419).

**What we'll do**
1. Rewrite the homepage H1 so it says what we do and for whom, keeping the luxury tone. Example: "Private luxury real estate advisory in Ahmedabad, for HNI and NRI families." The design and wording need your boss's approval; the H1 must stay **visible**. Hiding SEO text is a spam-policy issue.
2. Add a short, factual "what we do / where / for whom" section to the homepage. Facts only: corridors served, typical budget band, NRI process, RERA number (4.6).
3. **Remove ContentGuard.** If image protection is wanted, use watermarks on photos instead of blocking the page.
4. Audit titles and descriptions of the top 30 pages once GSC shows their impressions and CTR, then improve the low-CTR ones first.

**Before → After**
| Metric | Before | After [Target] |
|---|---|---|
| Homepage H1 contains the service and location | No [Measured] | Yes |
| Visitors can copy and print | No [Measured] | Yes |
| CTR of top-30 pages | unknown | improves vs the GSC baseline (measured per page) |

**Implement safely.** The visual design follows the token rules in `CLAUDE.md` (no hardcoded colours; gold ≤5%). Check the homepage on mobile and desktop locally, screenshot before and after, and make sure lead forms and the WhatsApp button still work (checker).

**Did it work?** Watch GSC for the homepage over 4–8 weeks: impressions and average position for "luxury real estate consultant Ahmedabad" and similar searches, plus CTR. Leads per week (Part 6).

**If it hurts** (homepage position drops by more than 3 places for 2+ weeks for core queries): compare old and new text. Revert the H1/copy commit; try a different wording later.

---

### 4.6 Trust signals: RERA, real people, honest claims (E-E-A-T)

**Learn first**
- **What it is.**
  - **E-E-A-T** (Experience, Expertise, Authoritativeness, Trust) is how Google's Search Quality Rater Guidelines describe credible content. Raters don't change rankings directly, but they evaluate whether Google's systems reward the right pages.
  - Property is a **YMYL** ("Your Money or Your Life") topic, so trust carries extra weight [Official: Google's guidance on creating helpful content and the rater guidelines].
  - Google suggests asking **"Who created this content, how, and why?"** and making the answers obvious, e.g. clear bylines and author background [Official].
- **RERA.** India's Real Estate (Regulation and Development) Act, 2016 requires real-estate agents to register with the state RERA authority before facilitating the sale of registered projects (Section 9) [Official: the Act]. Gujarat's authority is GujRERA. Whether the number *must* be displayed on a website or in adverts depends on the state rules; **confirm with your legal adviser**. Showing it is a strong trust signal either way. [Judgement]
- **Unsupported claims.** Phrases like "we define it", "City's Most Trusted", "Trusted by Elites, NRIs & Celebrities" and "fewer than 30 genuine 5 BHK units transact annually" carry no evidence. India's advertising self-regulator (ASCI) code expects claims to be substantiated [Official: ASCI Code; confirm specifics with legal]. Unsupported superlatives don't build trust with search engines or sceptical HNI buyers. [Judgement]
- **Why it matters for PIKORUA.** Someone deciding on a ₹5–15 Cr purchase from abroad checks credentials first. A verified registration number, a real founder profile and real case studies answer "can I trust them?". Missing ones raise doubt.
- **If we skip it.** Trust stays the weakest link. AI assistants and journalists have no verifiable facts to cite. We also carry legal and advertising-standards exposure on unsubstantiated claims.

**Current state: 3/10** [Measured]
- ✅ Founder named (Jitendra Pareek) with a Person entity; the testimonials page exists; the site states project-level RERA checks.
- ❌ Problems:
  - `BUSINESS_RERA_REGISTRATION = null`, and "RERA" appears nowhere on the homepage.
  - No author bylines or credentials on the guides.
  - Superlatives are used without evidence.
  - Founding claims are inconsistent: the Lovable prototype says "since 2009", while pikorua.in was registered in 2023 and the main Justdial listing ID dates from 2023.

**What we'll do** (most items need input from you or your boss)
1. Get the **GujRERA agent registration number** and certificate; show it in the footer, on the contact and about pages, and in the schema. You supply the number. [Decision 8.1]
2. Build a real **founder/team page**: experience, transactions handled (only what can be backed up), and LinkedIn. Then add bylines ("Written by… / Reviewed by…") on every guide.
3. Get **NRI tax/FEMA guides reviewed by a named chartered accountant or lawyer**, with their name and credential on the page. [Decision 8.2]
4. Replace superlatives with **verifiable facts** (years active, number of families advised, developers worked with), or remove them. Fix the founding year everywhere to one true value. [Decision 8.3]
5. Add 3–5 anonymised **client case studies** (NRI from the USA bought X in Y; the process; the timeline), with client consent.

**Before → After**
| Metric | Before | After [Target] |
|---|---|---|
| RERA number visible | No [Measured] | Yes, on every page footer |
| Guides with named author or reviewer | 0 [Judgement from samples] | 100% of guides |
| Unsupported superlatives | many [Measured samples] | 0 |
| Case studies | 0 | 3–5 |

What it buys you: higher conversion from cautious NRI/HNI visitors [Judgement; measured through the lead rate in Part 6]; facts that journalists and AI systems can cite; lower legal and advertising risk. Ranking impact is indirect and gradual [Judgement].

**Implement safely.** Content changes only. Every new claim must have a source we can produce if asked. Legal review of claims before publishing.

**Did it work?** Lead conversion rate (leads ÷ sessions) before vs after (needs 4.13 first); time on page for guides; whether new PR and listicle mentions quote our facts (4.10).

**If it hurts.** Very unlikely. If a page's position drops after a big rewrite, compare versions and restore the sections that were removed.

---
### 4.7 Content only PIKORUA can produce

**Learn first**
- **What it is.** Pages and articles built on knowledge only an on-the-ground luxury advisor has: real price ranges from deals we've seen, honest pros and cons of each corridor, the actual NRI buying process we run, and photos and videos we shot ourselves.
- **How it works.**
  - Google's guidance on helpful content asks whether a page offers original information, reporting, research or analysis, and substantial value compared with other pages in results [Official].
  - Google also says that using automation (including AI) to generate content **primarily to manipulate rankings** violates its spam policies [Official]. Volume alone isn't the goal.
  - AI assistants likewise prefer to quote specific, citable facts over generic text. [Judgement, consistent with how retrieval-based answers cite sources]
- **Why it matters for PIKORUA.** Portals win on inventory; we can't out-list 99acres. We **can** out-explain them: which tower on Sindhu Bhavan Road holds resale value, what an NRI from the US should expect step by step, and what ₹8 Cr actually buys in Shilaj vs Iscon-Ambli. That is the content HNI and NRI buyers, journalists and AI assistants look for.
- **If we skip it.** Our pages remain interchangeable with dozens of competitors' pages. Nothing on the site is worth linking to or quoting, so off-site work (4.10) and AI visibility (4.11) have nothing to point at.

**Current state: 4/10** [Measured unless noted]
- ✅ Positives:
  - 19 blog posts, NRI country guides that rank (#1 US, #3 UAE), compare pages (12), learn guides (12), invest guides (9), GIFT City pages (3), and a market-report page.
  - Location pages start with a "Short Answer" block, a good format for AI answers.
- ❌ Negatives:
  - Location pages are templated: the same sentence ("X is a relevant Ahmedabad luxury residential corridor for buyers comparing address quality, connectivity, privacy, and long-term resale depth") appears on every page checked, and pages share 14–18% of their 8-word phrases.
  - No original data is published (the market-report page's data sources are still to be reviewed).
  - "GIFT City residential property investment" is not in the top 20; Gandhinagar has no dedicated corridor pages.
  - Unsupported statistics appear on templated pages.

**What we'll do** (full-time pace: about 2 high-quality pieces per week, never mass-generated)
1. **Rewrite the top 8 corridor pages first** (Iscon-Ambli, Sindhu Bhavan Road, Thaltej, Bodakdev, Shilaj, Vaishno Devi, Science City, SG Highway). Each one gets:
   - real price bands per sq.ft. from our own deals
   - named projects we work with
   - our own photos
   - commute times to SG Highway, the airport and GIFT City
   - schools and clubs
   - honest pros and cons
   - an FAQ
   - the author and the review date

   Keep each page's URL and core topic, so rankings are protected.
2. **Quarterly "Ahmedabad Luxury Price Report"** built from PIKORUA's own (anonymised) deal data plus public sources such as GujRERA project registrations. This becomes our PR asset (4.10) and our most citable page for AI (4.11).
3. **NRI hub, one strong guide per country** after consolidation (4.3), reviewed by a named CA or lawyer (4.6). It covers the process, documents, payments, TDS and repatriation, with every legal or tax figure checked by the reviewer, not written from memory.
4. **GIFT City and Gandhinagar (primary market, currently weak):** a residential GIFT City guide, plus Gandhinagar corridor pages (e.g. Kudasan, Raysan, Sargasan) **only where we have real inventory or insight**.
5. **Secondary markets (Dubai, Mumbai, Gurugram):** one honest "select mandates" page each, only if real deals exist. Two audiences must not be confused:
   - "NRIs **living in** Dubai buying in Ahmedabad": core business
   - "buying property **in** Dubai": secondary

   No location-template pages for these cities. That would recreate the doorway problem (4.2).
6. **Video:** a tour or explainer for each key property and corridor, uploaded to YouTube and embedded on the matching page (feeds 4.10 and 4.11).
7. **Refresh, don't just add:** every quarter, update dates, prices and facts on the top 20 pages.

**Before → After**
| Metric | Before | After [Target] |
|---|---|---|
| Location pages with the templated sentence | all checked pages [Measured] | 0 among the top 8, then the rest |
| Original-data publications | 0 [Measured] | 1 per quarter |
| GIFT City / Gandhinagar queries in the top 20 | 0 of 1 checked [Measured] | top 10 for the GIFT City set in Appendix A |
| Guides with a named reviewer | 0 | all |

**Implement safely.** Rewrites of protected pages happen **section by section**, keeping the URL, title topic and H1 topic. We save the old version (git) and watch GSC for that URL for 3 weeks before rewriting the next protected page.

**Did it work?** Per rewritten page, after 4–8 weeks: impressions, average position and clicks in GSC; rank tracker for its target queries; links and mentions the report earns (4.10).

**If it underperforms.** The page gains impressions but not clicks, so improve the title and description. It doesn't gain impressions, so check that it is indexed (URL Inspection) and that it answers the query better than the current top 3 (compare side by side).

**If it hurts** (protected page drops more than 3 positions for 2+ weeks after a rewrite): restore the removed sections from git and re-apply changes more gradually.

---

### 4.8 Local SEO: Google Business Profile, consistent details, reviews

**Learn first**
- **What it is.** For searches like "real estate consultant near me" or "luxury property consultant Ambli", Google shows a **map pack** of three businesses from Google Business Profile (GBP).
- **How it works.**
  - Google says local results are based mainly on **relevance, distance and prominence**. Prominence includes review count and rating, and information about the business from across the web: links, articles, directories [Official].
  - Consistent **NAP** (Name, Address, Phone) across the web helps Google trust that all the listings describe one business.
  - Google's GBP guidelines require the business name to be the real-world name, with **no added keywords**. Violations can lead to suspension [Official].
  - Google's review policies prohibit fake or incentivised reviews and **review gating** (only asking happy customers) [Official].
- **Why it matters for PIKORUA.**
  - The map pack sits above the normal results for many local searches.
  - HNI buyers in Ahmedabad and NRI families checking a firm from abroad often look at reviews and the Maps listing first.
  - GBP also feeds AI assistants' local answers. [Judgement]
  - GBP improvements are among the **fastest** SEO wins: changes and new reviews appear within days, not months. [Official for review publishing; Judgement on speed of ranking effect]
- **If we skip it.** Five conflicting addresses keep confusing Google and buyers; the duplicate Justdial listing keeps splitting reviews; we can't see or manage our own Google reviews.

**Current state: 3/10** [Measured]
- ✅ Positives: a GBP exists (map ID `0x6b6c61a8983fbbe5`); Justdial Bodakdev listing has **53 reviews at 4.9**; magicpin shows 4.9 (12).
- ❌ Negatives:
  - **No GBP access** for you.
  - **5 different addresses online:** Iskon-Ambli Road 380058 (website); Marvel Society, Bodakdev (Justdial); Thaltej (2nd Justdial listing with 0 reviews, and brandestate); Ambli T-junction, SP Ring Road (Growfy); "Ambli" (magicpin).
  - **Keyword-stuffed names** on some listings ("PIKORUA Realty - Ahmedabad, Mumbai, Dubai - Best and Most Trusted Luxury Real Estate Consultancy Firm" on magicpin).
  - Name variants: "PIKORUA Realty" vs "Pikorua Properties" (founder's LinkedIn).
  - AmbitionBox: 1.0 from 1 employee review.

**What we'll do**
1. **Decide the one true NAP** (the real office address, one main phone, the exact name "PIKORUA Realty"). [Decision 8.4]
2. **Get GBP owner access** (Part 6.4), then optimise it:
   - correct primary category (chosen from Google's list, e.g. "Real estate consultant" or "Real estate agency")
   - service areas (Ahmedabad, Gandhinagar, GIFT City)
   - services, a factual description, real photos of the office, team and properties, and opening hours
   - website link tagged with UTM codes so we can count GBP leads (4.13)
   - a weekly GBP post
3. **Check the GBP name.** If it carries keywords like the magicpin listing, correct it to the real name. That removes a suspension risk.
4. **Reviews programme (no incentives, no gating):** after every completed deal or consultation, send the GBP review link (WhatsApp template provided). Reply to every review, good or bad, within 48 hours.
5. **Citation clean-up:** set the same NAP on Justdial (ask Justdial support to merge or remove the duplicate Thaltej listing), magicpin, Growfy, brandestate, LinkedIn, Facebook, Instagram and YouTube. Keep a spreadsheet of every listing.
6. **Add Bing Places** (it can import from GBP) and **Apple Business Connect** (Apple Maps and Siri). Both are free.

**Before → After**
| Metric | Before [Measured] | After [Target] |
|---|---|---|
| Distinct addresses online | 5 | 1 |
| Justdial listings | 2 | 1 |
| GBP access | none | owner |
| Google reviews | unknown | measured at access; then steady monthly growth |
| GBP calls, website clicks, directions | unknown | measured monthly in GBP Performance |

**Implement safely.**
- **Edit the GBP address only once, and only to the accurate value.** Google may require re-verification after some edits [Official], so do it on a day you can respond to Google quickly.
- Never add keywords to the business name.
- Save screenshots of every listing before editing (proof and rollback reference).

**Did it work?**
- GBP Performance: searches, calls and website clicks month over month.
- Count of UTM-tagged GBP leads.
- A manual map-pack check for 5 local queries. Map rankings depend on where the searcher is, so always check from the same place.

**If it underperforms.** Few reviews means the ask process isn't happening, so track asks against reviews received. Low visibility means checking the category choice and the photo and post activity.

**If it hurts** (GBP suspended after an edit): don't create a new listing. Use Google's reinstatement form with proof (office photos, a utility bill, RERA certificate). This is why the name and address are fixed carefully, once.

---

### 4.9 Brand and entity (fixing "pikorua" search and the satellite sites)

**Learn first**
- **What it is.** Your **entity** is how search engines and AI systems understand "PIKORUA Realty" as one specific business. **Brand search** is people typing your name.
- **How it works.** When a name is ambiguous, Google shows its best guess at what most searchers mean. "Pikorua" is also a Māori symbol and the name of other companies: Pikorua Digital Health (Pune), pikorua.ai, pikorua.co.uk [Measured]. Consistent naming, a strong GBP, consistent profiles and growing branded searches help Google connect the name with us.
- **Why it matters for PIKORUA.** Many high-value leads come from people who heard the name from a friend, a developer or an Instagram reel, then search it. Today, someone typing just "pikorua" finds no pikorua.in result in the top 20. That person may never find us. [Measured]
- **If we skip it.** Word-of-mouth demand leaks away. Satellite and prototype sites keep competing with the real site and showing inconsistent claims ("since 2009").

**Current state: 2/10** [Measured]
- ✅ "pikorua realty" and "pikorua realty reviews" both return pikorua.in at **#1**, followed by LinkedIn, Justdial and Instagram.
- ❌ Problems:
  - "pikorua" alone: not in the top 20.
  - **ahmedabad-lux-hub.lovable.app**: a public, indexed prototype claiming "since 2009".
  - **pikoruarealty.com**: a thin one-page placeholder at the root domain. Your CRM, HRM and other apps use its **subdomains**, so the root and the subdomains must be handled separately.
  - **millionmindstechcity.in**: registrant organisation "PIKORUA", created 2026-05-20, 13+ indexed pages with a "PIKORUA Realty Research Desk" byline and a page titled "Contact PIKORUA Realty".
  - **pikorua.com**: registered via DropCatch in 2017 (a third party), yet listed as our alias in the schema.

**What we'll do**
1. **Use one name everywhere:** "PIKORUA Realty". Never "Pikorua Properties", and never the bare "Pikorua" in titles or profiles.
2. **Unpublish or make private the Lovable prototype.** It can be done through the Lovable project settings; I can help via the Lovable connector once you confirm the project.
3. **pikoruarealty.com:** 301-redirect **only the bare domain and `www`** to https://www.pikorua.in. **Do not touch** `crm.`, `hrm.`, `apps.`, `propsight.` or the `blast*` subdomains. DNS for this domain is on Cloudflare (it resolves to Cloudflare IPs), so the redirect is a Cloudflare rule scoped to those two hostnames. [Decision 8.5]
4. **millionmindstechcity.in** [Decision 8.6]. Options:
   - (a) Keep it as a separate commercial-project site, but stop presenting it as a PIKORUA brand site, and check the legal position on using a developer's project name as a domain.
   - (b) Move its useful content to pikorua.in and 301 the domain there.
5. Remove pikorua.com and every misspelling from the schema, `llms.txt` and `facts.json` (4.4).
6. **Grow branded search** through the channels that create it: YouTube, Instagram, PR, events, and the email signatures and WhatsApp messages the team sends. [Judgement]

**Before → After**
| Metric | Before [Measured] | After [Target] |
|---|---|---|
| "pikorua" search: pikorua.in position | not in top 20 | top 3 |
| Public prototype sites with PIKORUA branding | 1 | 0 |
| Thin brand domains competing with pikorua.in | 1 (pikoruarealty.com root) | 0 |
| Name variants in use | ≥2 | 1 |
| GSC impressions for queries containing "pikorua" | unknown | baseline at access, then growing |

**Implement safely.** The pikoruarealty.com redirect is the risky item, because your internal apps live on that domain. We write down every existing subdomain first, add a rule that matches **only** `pikoruarealty.com` and `www.pikoruarealty.com`, then test every subdomain still loads (CRM, HRM, apps) before and after.

**Did it work?** A monthly brand check of "pikorua", "pikorua realty", "pikorua ahmedabad" (Appendix A); GSC branded impressions; the Lovable URL drops out of results within weeks.

**If it hurts** (any internal app stops loading after the redirect): delete the Cloudflare rule immediately. It takes effect within minutes.

---

### 4.10 Off-site authority: getting mentioned and linked by others

**Learn first**
- **What it is.**
  - **Backlinks** are links from other sites to ours.
  - **Brand mentions** are other sites naming "PIKORUA Realty".
  - Both are evidence that others vouch for us.
- **How it works.**
  - Links help Google discover pages and are one of its ranking signals.
  - Google's spam policies prohibit buying or exchanging links that pass ranking credit. A paid placement must be marked `rel="sponsored"` or `nofollow` [Official].
  - For AI assistants, an Ahrefs study of 75,000 brands found that brand mentions across the web, and YouTube mentions, correlate most with being named in ChatGPT, AI Mode and AI Overviews [Study; not re-verified in this audit].
- **Why it matters for PIKORUA.**
  - For "best luxury real estate consultant in Ahmedabad", Google and AI assistants lean on pages that rank lists of consultants. **We are in 0 of the 7 such pages we could check** [Measured].
  - A Reddit thread ranks #2 for a US NRI query [Measured]. Communities matter.
- **If we skip it.** On-site work alone hits a ceiling. AI assistants keep naming the firms that appear in those lists, not us.

**Current state: 2/10** [Measured where stated]
- ✅ Profiles exist on LinkedIn, Facebook, Instagram, YouTube, Justdial, magicpin, Internshala and job portals; 16 developer relationships are listed on the site.
- ❌ Absent from 7 of 7 checked listicles (onlynew.in ×2, resmanagement.in, aroundtownrealty.in, faliyu, savills.in, prelaunchoffers.com); YouTube has **24 subscribers**; no press coverage found; backlink profile not measured (tool failure).

**What we'll do** (weekly routine for one person; about 6–8 hrs/week)
1. **Listicle outreach:** a tracked list of the ~15 pages that rank for the Core 30 consultant queries. For each one, contact the owner with a short, fact-based pitch (RERA number, reviews, NRI specialism, a quotable data point from our report). Be realistic: several lists are written by **competitors about themselves** (e.g. aroundtownrealty.in), so target neutral publishers and directories (GoodFirms, onlynew.in's blog, local news) first. If a placement is paid, it must be `sponsored`/`nofollow`. It still counts as a mention. [Official policy + Judgement]
2. **Digital PR, quarterly:** pitch the price report (4.7) to Ahmedabad and Gujarat editions (Times of India Ahmedabad, Divya Bhaskar, Gujarat Samachar), national real-estate desks (ET Realty, Moneycontrol, Hindustan Times real estate), and Gulf/NRI outlets (Gulf News ranks for NRI property topics in the UAE [Measured]). Also respond to journalist-request platforms.
3. **YouTube:** 1–2 videos per week (property tours, corridor explainers, NRI process). Consistent channel name; every description links to the matching page with UTM tags.
4. **Communities:** answer genuine questions on r/ahmedabad, r/nri and Quora, always disclosing that you work at PIKORUA. Follow each community's self-promotion rules; breaking them gets accounts banned.
5. **Developer partners:** ask the 16 listed developers to list PIKORUA on their channel-partner or NRI pages, with a link.
6. **Associations and diaspora groups:** real-estate agent associations, chambers of commerce, and Gujarati/Indian community groups in the US, UK and UAE (talks, webinars, sponsorships).
7. **Track everything:** a free Google Alert for "PIKORUA Realty"; Ahrefs Webmaster Tools for links (6.6).

**Before → After**
| Metric | Before | After [Target] |
|---|---|---|
| Presence in ranking consultant listicles | 0 of 7 checked [Measured] | ≥5 of the tracked 15 |
| Referring domains | unknown | baseline from AWT, then monthly growth |
| Press mentions | none found | ≥1 per quarter |
| YouTube subscribers | 24 [Measured] | growth tracked monthly |

**Implement safely.** No paid "dofollow" links, link networks, or link exchanges [Official policy]. The satellite microsite must **not** be used to manufacture links to pikorua.in.

**Did it work?** Monthly: listicle tracker, AWT referring domains, mention count (Google Alerts), AI panel mention rate (4.11). Ranking effect on consultant queries, measured over 3–6 months.

**If it underperforms.** Low reply rate: improve the pitch (lead with data, not self-praise) and follow up once after 7 days. Links gained but no ranking change: check whether the linking pages are relevant and indexed. Give it 3+ months.

**If it hurts.** If a manual action for unnatural links ever appears in GSC (Security & Manual Actions): list the offending links, remove them where possible, disavow the rest, and file a reconsideration request. The rules above exist to prevent this.

---

### 4.11 AEO: visibility in AI assistants

**Learn first**
- **What it is.** Getting named, and ideally linked, in answers from ChatGPT, Gemini, Perplexity, Copilot and Google's AI Overviews and AI Mode.
- **How it works.** AI answers come from two sources:
  - what the model learned in training (fixed, updated rarely)
  - **live retrieval**: the assistant searches the web and summarises what it finds

  For live retrieval:
  - Google's AI features use Google's index. Google states **there are no additional requirements** to appear in AI Overviews or AI Mode, and normal SEO best practice applies [Official].
  - OpenAI says sites must allow **OAI-SearchBot** in robots.txt to appear in ChatGPT search answers [Official]. ChatGPT search also uses third-party search providers [Official].
  - Bing powers Copilot, so **Bing Webmaster Tools and IndexNow** (a protocol for telling Bing about changed pages instantly [Official: Bing]) matter too.
  - **llms.txt** is a proposed convention; Google has publicly said it doesn't use it [Official statement]. We keep ours (it's cheap) but invest nothing more in it. [Judgement]
- **Why it matters for PIKORUA.** NRIs increasingly ask an AI "who should I use to buy a flat in Ahmedabad from the US?" If we're not in the pages those systems read (our site, the listicles, Reddit, news), we're not in the answer.
- **If we skip it.** AI answers keep naming competitors that appear in third-party lists, and that becomes the default recommendation for a growing group of buyers.

**Current state: crawler access 7/10, answer visibility not measured** [Measured]
- ✅ All AI bots get 200 responses; robots.txt allows OAI-SearchBot, GPTBot, PerplexityBot, ClaudeBot and Google-Extended; content is server-rendered; "Short Answer" blocks exist.
- ❌ Problems:
  - Off-site presence is close to zero (4.10).
  - `llms.txt` (64 KB), `llms-full.txt` (262 KB) and `facts.json` (578 KB) repeat the misspelling aliases.
  - Bing Webmaster Tools isn't set up (no access).
  - The IndexNow cron was removed during the VPS migration.
  - Direct AI answers are unmeasured.

**What we'll do**
1. **Measure first:** run the **AI Prompt Panel** (Appendix B) monthly, by hand, in incognito, in ChatGPT (search on), Gemini, Perplexity, Copilot and Google AI Mode. Log whether PIKORUA is mentioned, its position, and which URLs were cited. Optionally automate with a Finseo project (account already connected) or an API key for the council tool.
2. **Bing:** verify in BWT (import from GSC), submit sitemaps, and add a small **IndexNow** ping when content is published.
3. **Answer-ready pages:** every key page opens with a direct, specific 2–3 sentence answer, then a facts table (prices, process, timelines), with the date and author. Location "Short Answers" get rewritten so they are specific (4.7).
4. **Entity consistency:** same facts everywhere (4.4, 4.8, 4.9).
5. **Off-site mentions** (4.10). By the study above, this is the biggest lever.
6. Keep the AI files accurate and smaller (remove aliases and padding).

**Before → After**
| Metric | Before | After [Target] |
|---|---|---|
| AI Prompt Panel mention rate | not measured (baseline in month 1) | rising month over month |
| Our pages cited as sources in AI answers | not measured | rising |
| BWT verified and sitemaps submitted | No | Yes |
| AI referral sessions (GA4: chatgpt.com, perplexity.ai, gemini, copilot) | not measurable (no analytics) | tracked monthly |

**Implement safely.** No risky code changes; AI files are regenerated from the same entity source.

**Did it work?** Monthly panel results and GA4 AI-referral sessions. Expect slow movement; it follows off-site mentions.

**If it underperforms.** Look at **which sources** the AI cited for each prompt: those are exactly the pages to get onto (feeds 4.10).

---

### 4.12 Speed (Core Web Vitals)

**Learn first**
- **What it is.** Google's Core Web Vitals measure loading (LCP, "good" ≤ 2.5 s), responsiveness (INP, "good" ≤ 200 ms) and visual stability (CLS, "good" ≤ 0.1) [Official].
- **How it works.** They form part of Google's page-experience signals. They come from **real Chrome users** (CrUX), which we don't have yet because traffic is too low [Measured].
- **Why it matters for PIKORUA.** NRIs on mobile networks abroad. A fast site helps conversion, and it's a tie-breaker in rankings, not a main driver. [Judgement consistent with Google's statements that relevance matters more]
- **If we skip it.** Little SEO harm today: we're already fast. It's a low priority.

**Current state: 8/10** [Measured, PageSpeed lab]: mobile 90 (LCP 2.6 s, CLS 0.002, TBT 0 ms, Speed Index 6.5 s); desktop 93 (LCP 0.7 s). Opportunities: render-blocking requests (~1,560 ms potential saving), image delivery (90–276 KB), and the hero video uses `preload="auto"`.

**What we'll do (later, low priority):** defer non-critical CSS and JS, compress or resize images, set the hero video to load after the first paint on mobile, and send real-user vitals to GA4 (`WebVitalsReporter` already exists) once GA4 is on.

**Before → After:** mobile LCP 2.6 s → ≤2.5 s [Target]; Speed Index 6.5 s → lower [Target]. Measured with PageSpeed, and with CrUX once traffic allows.

**If it hurts:** visual regressions are caught by before/after screenshots; revert the commit.

**Status, 27 Oct 2026 [Measured]:** A recheck was attempted today, in progress, not yet complete. Google's PageSpeed Insights API (no API key, shared public quota) returned HTTP 429 quota-exceeded, same as yesterday. As a workaround, headless Chromium was installed locally via Playwright (`npx playwright install chromium --with-deps`, succeeded), and the Lighthouse CLI was run against `https://pikorua.in` — it failed with `NO_FCP: The page did not paint any content. Please ensure you keep the browser window in the foreground during the load and try again.`, a headless-rendering snag that hasn't been debugged yet. The 90/93 mobile/desktop scores quoted above and in 3.1/3.2 are still **yesterday's (26 Oct) numbers**, not refreshed today. Two ways to unblock this: (1) get a free Google PageSpeed Insights API key from `console.cloud.google.com` and hand it over, or (2) let the local-Lighthouse debugging continue (no input needed from you).

---

### 4.13 Analytics and lead attribution (we are flying blind today)

**Learn first**
- **What it is.**
  - **Google Analytics 4 (GA4)** counts visitors, where they came from (Google, ChatGPT, Instagram…) and what they did (e.g. submitted a lead).
  - **Google Tag Manager (GTM)** is the container that loads GA4 and other tags.
  - **Attribution** means knowing which channel produced each lead.
- **How it works.** The site's code already contains GTM, GA4 and Clarity components and sends a `generate_lead` event when a form is submitted (`src/lib/analytics.ts` line 33). They only switch on when their IDs are set as environment variables (`NEXT_PUBLIC_GTM_ID` etc.). `NEXT_PUBLIC_*` values are baked in when the site is built, so setting one needs a redeploy.
- **Why it matters for PIKORUA.** Your boss wants NRI/HNI business from this work. Without analytics and attribution, **we can't prove any SEO or AEO result produced a single lead**, or tell which pages and channels to invest in.
- **If we skip it.** Every other workstream becomes "trust me". We can't detect harm early (Part 5), and we can't report results.

**Current state: 1/10** [Measured]
- **No analytics tags render on the live site:** the homepage HTML has only a `dns-prefetch` to Google Tag Manager, not the GTM script.
- Leads store `utm` only (`src/lib/validations/lead.ts`). Organic Google, Maps and AI visitors normally carry no UTM tags, so their leads arrive with no source.
- ✅ The lead pipeline and `generate_lead` event code already exist.

**What we'll do**
1. Create the GTM container and GA4 property (Part 6.5), set `NEXT_PUBLIC_GTM_ID` in `.env.production` on the VPS, and redeploy. Mark `generate_lead` as a **key event** in GA4.
2. **Capture each lead's source in our own database:**
   - The page records `document.referrer` and the first landing page when a visitor arrives, and keeps them for the session.
   - On submit, both are sent with the form and stored in **new, optional** columns (a numbered migration under `supabase/migrations/`, e.g. `014_lead_source.sql`).
   - This needs no cookie banner change beyond what analytics already requires (check your privacy policy text with legal).
3. Tag every link we control with UTM codes: GBP website button, Instagram/YouTube/LinkedIn bios, WhatsApp broadcasts, PR links.
4. Optional: Microsoft Clarity (free session recordings and heatmaps; the component exists) to see where NRI visitors get stuck. Mention it in the privacy policy.
5. A simple **monthly report** for your boss: leads by source (organic, AI, Maps, social, direct), by page, and by country.

**Before → After**
| Metric | Before [Measured] | After [Target] |
|---|---|---|
| Analytics running | No | Yes (GA4 via GTM) |
| Leads with a known source | only UTM-tagged ones | ≥90% have referrer and landing page |
| Monthly report of leads by channel | none | yes |

**Implement safely, with the CRM feed protected.**
- Database change: **add** nullable columns only; no column is renamed or removed (Part 5.5).
- `/api/leads` keeps accepting old payloads without the new fields.
- The CRM endpoint (`/api/crm/leads`) **response stays unchanged** until we confirm the CRM tolerates extra fields.
- Test every one of the 6 forms locally (lead row + `lead_events` row + `is_hot` trigger) before deploy, and again on live with one test lead marked TEST.

**Did it work?** GA4 Realtime shows visits within minutes of the deploy. A test lead appears in GA4 as `generate_lead`, and in the DB with referrer and landing page filled in.

**If it hurts** (any form error, missing lead or CRM sync issue): **immediate rollback** (Part 5.6). Leads are the business.

---

### 4.14 Conversion: turning NRI/HNI visitors into enquiries

**Learn first**
- **What it is.** Conversion rate optimisation (CRO) means making it easier for the right visitor to enquire.
- **How it works.** Measure where visitors drop off (GA4 funnels, Clarity recordings), fix the friction, then measure again.
- **Why it matters for PIKORUA.** Doubling traffic and doubling the conversion rate have the same effect on leads, and conversion fixes can be much faster.
- **If we skip it.** SEO gains leak away through friction (time zones, trust doubts, unclear next steps).

**Current state: unknown (no data).**
- ✅ International numbers are accepted if the visitor types the "+code" themselves (shape check only; see 4.14a); a preferred callback time field exists; there's a WhatsApp button, a thank-you redirect, and a popup ("Maya") at 50% scroll.
- ❌ No conversion data exists to judge any of it.

#### 4.14a Country picker and real validation for phone numbers (your request, 26 Oct 2026; can start before the analytics data arrives)

**Learn first**
- **What it is.** A searchable country dropdown next to the phone field. The visitor types "Ger…" or scrolls an A–Z list, picks Germany, and the dialling code (+49) and flag fill in. They then type only their local number. The number is checked against **that country's real numbering rules**, not just its length.
- **How it works.**
  - Every country publishes a numbering plan: valid lengths, valid prefixes, mobile vs landline ranges.
  - Google maintains an open-source library of these rules (libphonenumber). A widely used JavaScript version, `libphonenumber-js`, can validate a number for any country and format it in the international standard **E.164** (e.g. `+4915123456789`).
  - The same check runs in the browser (instant feedback) and on the server (security), through our shared Zod schema in `src/lib/validations/lead.ts`, following the `CLAUDE.md` rule of one schema for client and server.
- **Current state** [Measured, `src/lib/validations/lead.ts` line 6]:
  - The rule `^(\+[1-9]\d{7,14}|[6-9]\d{9})$` accepts a 10-digit Indian mobile, or "+" followed by 8–15 digits.
  - It's a **shape check only**. Invalid numbers with the right length pass (e.g. a made-up +1 555 number), while some genuinely valid short international numbers are rejected.
  - There is no country picker; visitors must know to type their own "+code".
  - Phone fields appear in `LeadCapturePopup`, `QuickEnquiryForm`, `DiscoveryForm` and `PropertyEnquiryForm`.
- **Why it matters for PIKORUA.**
  - NRIs live in dozens of countries, not just the US, UK and UAE.
  - A visitor who types their number without "+code" today gets an error, and may give up.
  - A fake or mistyped number means a lead your team can never call back.
  - The picker cuts both kinds of loss, and stores numbers in one consistent format the CRM and WhatsApp can dial. [Judgement on the effect size; measured through form errors and lead quality]
- **If we skip it.** NRIs from less common countries keep hitting validation errors, and invalid numbers keep reaching the CRM.

**What we'll do**
1. Add `libphonenumber-js`. Build one shared `PhoneInput` component:
   - a searchable, alphabetical country list with flag and dialling code
   - default: India
   - a pre-selection guess from the visitor's browser region, which they can always change
2. Validation: "valid number for the selected country" (`isValidPhoneNumber`), in the shared Zod schema, on both client and server. Clear error text, e.g. "This doesn't look like a valid number for United Kingdom".
3. Store the number in **E.164 format** plus the **country code** (e.g. `GB`), so you can see at a glance which country a lead is from. That is also useful for NRI reporting (4.13).
4. Use the component in all four forms. Keep the hidden honeypot and rate limit unchanged.

**Implement safely (the CRM is the risk)**
- Today Indian numbers are stored as **10 digits without +91**. Switching them to `+91…` could break how the CRM matches or dedupes phone numbers.
- So we **add** two new optional columns (`phone_e164`, `phone_country`) in a numbered migration, and **keep filling the existing `phone` column in its current format** for Indian numbers.
- The CRM feed stays unchanged until the CRM owner confirms the new format is fine.
- The server still accepts the old payload shape during the switch-over (browsers with cached old pages).
- Test all four forms with numbers from India, the US, the UK, the UAE, Canada, Singapore, Australia, Germany, Kenya and New Zealand, plus deliberately invalid ones.
- The checker gains these phone cases.
- The library adds some JavaScript to pages with forms; we check that PageSpeed doesn't regress (4.12) and load the full rules only on form interaction if needed.

**Before → After**
| Metric | Before | After [Target] |
|---|---|---|
| Countries supported with real validation | none (shape check only) [Measured] | all countries in the library's metadata |
| Visitor needs to know their "+code" | yes [Measured] | no (picked from the list) |
| Leads stored with their country | no | yes (`phone_country`) |
| Phone validation errors shown per form view | not measured | tracked in GA4 (new event) and reduced |

**Did it work?** Fewer phone-validation errors per form view (a GA4 event we add); share of leads from non-India countries; no drop in total form submissions in the 4 weeks after launch vs the 4 weeks before.

**If it hurts** (submissions drop, or the CRM shows phone problems): roll back the component behind its feature flag (`phone_country_picker`); the old field returns instantly.

#### 4.14b General conversion improvements
**What we'll do (after 4+ weeks of analytics data):**
1. Find the top landing pages for NRI visitors (GA4 by country) and their enquiry rate.
2. Review Clarity recordings of NRI sessions.
3. Fix the biggest friction first. Typical candidates: a time-zone-aware callback choice, a "video tour on request" call to action on property pages, the RERA number and reviews next to forms, and WhatsApp click tracking.
4. Measure lead response time (a business process, not code). Fast replies matter most to buyers abroad.

Honest note: our traffic is too low for statistically valid A/B tests [Judgement], so we use careful before/after comparisons over 4-week windows.

**Before → After:** conversion rate, baseline (month 1) → improvement, measured per page [Target].

**If it hurts** (conversion rate drops after a change): revert that change (each one is its own commit or flag).

---

### 4.15 Operations housekeeping (keeping the site up and the repo honest)

**Learn first**
- **What it is.** Uptime monitoring, backups, and keeping the code repository in step with what is actually live.
- **Why it matters for PIKORUA.**
  - The 24 Oct outage (a firewall change, about 35 minutes) was only discovered by chance [Measured, recorded in `docs/VPS_MIGRATION_PLAN.md`].
  - Repeated or long downtime makes Google retry and, if it persists, can drop pages. Every minute down also loses enquiries. [Judgement]
  - The live Nginx configuration has changes that aren't committed [Measured]. If the server had to be rebuilt from git, those changes would be lost.
- **If we skip it.** The next outage could last hours unnoticed; a server failure could lose configuration or data.

**What we'll do**
1. **UptimeRobot (free):** check `/` and one API health route every 5 minutes; alert you by email and on your phone.
2. **Commit the live Nginx change** (`deploy/nginx/pikorua.in.conf`) and the outage note in `docs/VPS_MIGRATION_PLAN.md`.
3. **Update `CLAUDE.md`:** hosting is Docker Compose via `deploy/deploy.sh`, not PM2.
4. **Verify backups:** the migration plan specifies nightly `pg_dump` and a media tar with offsite copies (Phase 9). Check that they actually exist and **test one restore**.
5. **Post-deploy checklist:** the checker, plus `ufw status` showing 80/443 allowed, plus the certificate renewal dry-run monthly.

**Before → After:** uptime alerts none → within 5 min [Target]; uncommitted live config 1 file → 0; restore tested no → yes.

**Status, 27 Oct 2026 [Measured]:** Not started. Both uptime monitoring and backups were discussed in depth today (what each is, how to set it up, cost, and payoff) and **you chose to defer both intentionally** — this is a priority call, not something blocked or forgotten. No monitor is signed up, no `/api/health` route exists, no cron or off-VPS backup target is configured. The root cause of the 24 Oct outage is now known (coworker's `ufw` mistake, addressed directly with him) — see 3.3 — but that doesn't substitute for monitoring: a different kind of failure would still go unnoticed today. Setting up either one needs either (a) VPS SSH access handed to Claude Code, or (b) you running a short set of copy-paste commands I provide, or (c) signing up for a free external monitor (UptimeRobot/Better Stack) yourself with my guidance. Backups specifically: nightly `pg_dump` of the Postgres DB + sync of `MEDIA_DIR` to off-VPS object storage (Backblaze B2 or Hetzner Storage Box), estimated **$1–3/month**, buys the ability to restore the whole site's data and photos within minutes-to-hours instead of losing them permanently if the VPS disk fails, the host has an incident, or someone runs a destructive command.

---

### 4.16 (Optional, a business decision) Paid search in parallel

**Learn first.** Google Ads and Meta ads put us at the top **immediately**, for as long as we pay. Google states that advertising does **not** affect organic rankings [Official]. Paid search also shows which keywords actually convert, which tells SEO where to focus.

**Why mention it.** Your boss wants results as fast as possible, and Google itself says SEO takes 4–12 months [Official]. Paid campaigns aimed at NRI audiences abroad (US, UK, UAE, Canada, Singapore, Australia) and high-intent searches like "NRI property consultant Ahmedabad" can bring leads while SEO matures.

**If we skip it.** No harm to SEO; you just wait longer for lead volume.

**Decision 8.7:** budget and whether to run it. If yes, it gets its own plan. It is not part of the SEO workstreams.

---
## Part 5: The safety system (built in Week 1, before any SEO change)

### 5.1 Learn first: why safety comes before everything
- **What it is.** A set of habits and tools that (1) stop a bad change from reaching the live site, (2) spot harm fast if one slips through, and (3) undo it in minutes.
- **Why it matters for PIKORUA.**
  - The website is your lead machine. A broken form silently loses enquiries worth crores.
  - SEO damage is **slow to repair**. Reverting code takes minutes, but Google only sees the fix when it recrawls, which can take days or weeks. [Judgement, based on how recrawling works]
  - The VPS is **shared** with your CRM, HRM and other apps, so careless server commands can break things beyond the website [Measured: `docs/VPS_MIGRATION_PLAN.md`].
- **If we skip it.** One bad deploy can lose leads for days before anyone notices, and rankings that took months to earn can take weeks to recover.

You chose **all six layers** instead of a staging server. Here they are:

| Layer | What it does | When it acts |
|---|---|---|
| 1. Test on your Mac | Runs the real production build of the site on your computer, against a copy of the database | Before every deploy |
| 2. Automatic checker | One command that checks pages, sitemaps, SEO tags, schema and forms, and fails loudly if anything broke | Before and right after every deploy |
| 3. GitHub checks | Runs the same checks automatically on every push (free) | Every push |
| 4. On/off switches (feature flags) in `/admin` | Risky changes ship switched off; you switch them on, and off again if they hurt, with no deploy | Rollout and emergencies |
| 5. Small batches | Change ~10–20 URLs at a time, watch 2 weeks, then continue | All SEO changes that touch URLs |
| 6. One-command rollback | Every change is its own commit; undo = `git revert` + the normal deploy | Emergencies |

### 5.2 The protected list (things that must never break)
**Business functions:**
- All 6 lead forms: discovery, enquiry, callback, consultation, contact, popup
- `POST /api/leads`: rate limit → honeypot → validation → one DB transaction (`leads` + detail rows + `lead_events`), plus the `set_is_hot` trigger
- The `/thank-you` redirect
- The CRM feed: `GET /api/crm/leads` and `POST /api/crm/leads/ack` (bearer key; blocked publicly in Nginx)
- `/admin`: login, edits, image uploads to `/media`
- Sanity: `/studio` and the `/api/revalidate` webhook
- The WhatsApp button
- `robots.txt` and the sitemaps
- The Google verification file `public/google91c2c9a5f53b75d8.html`. It proves ownership for an existing Search Console account; **never delete it**.

**URLs that rank today:** Appendix C.

**Project rules from `CLAUDE.md`:**
- residential-first (only office/showroom as commercial)
- five main nav pages only
- `renderListGuard` for lists
- design tokens only
- `$1` SQL parameters
- numbered migrations

**Server rules from `docs/VPS_MIGRATION_PLAN.md`:**
- only `pikorua-website`-scoped Docker commands
- Nginx `reload`, never `restart`
- **never touch `ufw` without keeping ports 80 and 443 open**: that caused the 24 Oct outage

### 5.3 Layers 1–3: testing before anything goes live
**Learn first: the automatic checker.** A script (I'll write it as `scripts/site-guard.ts`, run with `npm run guard`) that visits the site like Googlebot and a customer would, and checks a list of rules. It runs against your Mac (`http://localhost:3000`) before a deploy and against the live site after.

**What it checks:**
1. Every protected URL returns 200 and is indexable, with the canonical pointing at itself.
2. Every sitemap URL returns 200, is indexable, and points its canonical at itself (catches 404s like today's 29).
3. Redirects: exactly one 301 hop to a 200 page; no chains or loops.
4. robots.txt still allows the search and AI bots and still blocks `/admin`, `/api`, `/studio`.
5. JSON-LD parses on each page type; banned fields are absent (self-serving `aggregateRating`, `SearchAction`, misspelling aliases).
6. Combo rule: an indexable `/p/` page lists ≥3 properties, each matching its location, type, BHK and budget.
7. **Lead forms (on your Mac only):** submits each of the 6 forms to the local database and confirms the `leads` row, the `lead_events` row, and the `is_hot` result.
8. **Lead endpoint (on live):** sends an *invalid* payload and expects a 400. This proves the route is alive without creating a fake lead in your CRM.
9. The CRM feed returns 401 without the key (still protected).
10. Key pages render their H1, the WhatsApp button and the form.

**Testing on your Mac (Layer 1).** You'll run the database with Docker Desktop and load a copy of the live database (from the nightly backup), then `npm run build && npm start`. I'll teach each step the first time; afterwards it's one command.

**GitHub checks (Layer 3).** A GitHub Actions workflow (free tier) runs typecheck, lint, `npm run check` and the checker's code-level rules on every push. A red ✗ on GitHub means "don't deploy this".

### 5.4 Layer 4: on/off switches (feature flags)
- **What it is.** A small `site_flags` table (new migration) plus a page in `/admin` with toggles. Code reads a flag and behaves the old way when it's off.
- **Why a database flag and not a setting file?** Settings like `NEXT_PUBLIC_*` are baked in at build time, so changing them needs a redeploy. A database flag changes instantly.
- **One detail:** pages are cached (ISR, up to 24 h). Flipping a flag in `/admin` also triggers revalidation of the affected pages, so the change appears within minutes, not a day.
- **Which changes get a flag:** anything that changes what Google sees across many URLs, such as combo matching, sitemap contents, the noindex rules and redirect batches. Small text edits don't need one.

### 5.5 Database safety rules (so code rollbacks never need data rollbacks)
1. **Additive only:** new tables or nullable columns. Never rename or drop in the same release; remove old things later, once nothing uses them.
2. Code must work with **both** the old and the new database shape. Then reverting code is always safe.
3. **Back up before any migration:** a `pg_dump` of the website DB only (exact command in the runbook), plus a check that the file isn't empty.
4. Never edit or delete existing lead rows during SEO work.

### 5.6 Rollback runbook (from fastest to slowest)
| Type | When | How | Time |
|---|---|---|---|
| **A. Flip the flag off** | The change is behind a flag | `/admin` → Flags → off (auto-revalidates) | ~1 min |
| **B. Revert the code** | Any deployed change | On your Mac: `git revert <commit>` → `git push`. On the VPS: `cd /opt/pikorua-website && ./deploy/deploy.sh`. Then `npm run guard -- --live` | ~10–15 min (the build takes a few minutes) |
| **C. Return to the last good release** | Several changes are tangled | Every good deploy is tagged (e.g. `release-2026-11-05`). Revert all commits after that tag in one revert commit, then deploy as in B | ~15–20 min |
| **D. Database restore** | Only if data is damaged (rare) | **First export any leads created since the backup**, then restore the pre-migration dump, then re-insert those leads | ~30–60 min, with Claude guiding |
| **E. Non-code changes** | GBP, directories, Cloudflare redirect | Use the before-screenshots or notes saved in the change log to restore the old values. Delete the Cloudflare rule for the redirect | minutes to days (GBP re-review) |

**After any rollback (SEO side):**
1. Run the checker on live.
2. In GSC → URL Inspection, "Request indexing" for the affected key URLs, so Google sees the restored version sooner.
3. Remember that 301 redirects are cached by browsers and by Google. That's why redirect changes go in small batches (Layer 5).

### 5.7 Harm detection: what we watch and when we act
| Signal | Where | Threshold that triggers action [Judgement: chosen thresholds] | Action |
|---|---|---|---|
| Site down / 5xx | UptimeRobot alert | Any alert | Check the site; if the cause is a recent deploy → rollback B |
| Checker fails after a deploy | `npm run guard -- --live` | Any failure on the protected list | Rollback A or B immediately |
| Lead form errors / lead count | Admin leads list, DB | 0 leads on a working day when the 4-week average is ≥1/day, or a form error report | Test the forms right away; rollback if the cause is a deploy |
| Clicks (sitewide) | GSC Performance, last 7 days vs previous 7 days, and 28 vs 28 | Down >20% on 28-vs-28 with no known seasonal reason | Diagnose (5.8) |
| Protected URL position | GSC (filter by page + query) and rank check | Worse by >3 positions for 2 weeks in a row | Diagnose; revert that page's change if it's the cause |
| Indexing errors | GSC Pages report | New error type, or a sudden rise | Diagnose (5.8) |
| Manual action | GSC → Security & Manual Actions | Any | Stop related work; fix per Google's notice; file a reconsideration request |

**Before blaming our change, rule out Google.** Check the **Google Search Status Dashboard** for announced core or spam updates on those dates [Official]. If an update rolled out at the same time, compare our changed pages against unchanged ones. If both dropped similarly, it's probably the update, not us.

### 5.8 Diagnosis framework: "why isn't it working / why is it hurting?"
Walk down this ladder and stop at the first "no":

| Step | Question | Tool | Common causes → fixes |
|---|---|---|---|
| 1 | Is the site up and returning 200? | UptimeRobot, checker | Server, firewall or deploy error → rollback or fix |
| 2 | Can Google crawl the page? | GSC URL Inspection ("Crawl allowed?", "Page fetch") | robots.txt block, 5xx → fix rule or server |
| 3 | Is it indexed? | URL Inspection; Pages report reason | noindex, canonical to another URL, "Crawled – currently not indexed" (quality), duplicate → fix tags or improve content |
| 4 | Does it rank, and for what? | GSC Performance → page → Queries | Wrong intent, weak content, cannibalisation → 4.3 / 4.7 |
| 5 | Do people click? | GSC CTR by query | Weak title or snippet → rewrite title and description |
| 6 | Do visitors enquire? | GA4 key events, Clarity | Friction, trust → 4.14, 4.6 |
| 7 | Do leads become business? | CRM | Lead quality or response speed (a business process) |

"Partly worked" usually means we fixed one step but the bottleneck moved to the next. The ladder shows where.

### 5.9 Post-mortem template (after any change that hurt or failed)
```
Change: <what> (commit/flag, date)
Hypothesis: <what we expected and why>
What happened: <metrics before/after, with dates>
Root cause: <which ladder step failed (5.8), and why>
Was rollback needed? <type A–E, time to recover>
What we'll do differently: <rule added to checker/plan>
```

### 5.10 The change log (`docs/SEO_CHANGELOG.md`, created in Week 1)
Every change gets one row, so we can always link a metric movement to its cause:

| Date | Change | Commit / flag | URLs affected | Hypothesis | Metric to watch | Check at (2w / 6w / 12w) | Result | Decision |
|---|---|---|---|---|---|---|---|---|

---

## Part 6: The measurement system (built in Week 1)

### 6.1 Learn first: baselines
- **What it is.** A **baseline** is the "before" number, recorded *before* a change.
- **Why it matters for PIKORUA.** Without it, no improvement can be proven to your boss or to us. Today we have almost none: no analytics, no Search Console access, no lead sources [Measured].
- **If we skip it.** Every result becomes an opinion.

### 6.2 Google Search Console (most important tool)
- **What it is.** Google's free report on your site: searches you appear for, clicks, positions, indexing errors, manual actions.
- **Key fact:** a Google verification file (`/google91c2c9a5f53b75d8.html`) is live [Measured]. **Someone already owns a Search Console property for this site**, probably the previous developers. Search Console keeps up to **16 months** of performance data [Official], so getting into that property gives us history immediately.

**Steps (do both):**
1. **Get added to the existing property.** Ask your boss or the previous developers who owns Search Console for pikorua.in. The owner goes to Search Console → Settings → Users and permissions → Add user → your work Google account → permission **Owner**.
2. **Create your own Domain property**, which covers http/https, www and non-www. Your domain's DNS is at **GoDaddy** (name servers `ns65/ns66.domaincontrol.com`) [Measured].
   - Search Console → Add property → **Domain** → `pikorua.in` → copy the TXT record.
   - GoDaddy → My Products → pikorua.in → DNS → Add record → Type **TXT**, Name **@**, Value: paste it → Save.
   - Back in Search Console → Verify. DNS changes can take a while to spread; if it fails, retry later.
3. In the new property: Sitemaps → submit `sitemap.xml` and `sitemap/index.xml`.
4. Code clean-up (with Claude): the meta verification tag in `src/app/layout.tsx` (line 99) holds a **file name** instead of a token, so it does nothing. Replace it with a real token, or remove it, since DNS verification covers it. **Keep the HTML file.**

### 6.3 Bing Webmaster Tools
bing.com/webmasters → sign in → **Import from Google Search Console** (fastest; brings in the verified sites and sitemaps). Why: Bing powers Copilot, and ChatGPT search uses third-party search providers [Official]. Also check Bing's own indexing report.

### 6.4 Google Business Profile access
1. Ask your boss who manages the Maps listing. The listing exists; the reviews link in the site resolves to map ID `0x6b6c61a8983fbbe5` [Measured].
2. If someone in the company owns it: they go to the profile → **Business Profile settings → People and access → Add** you as **Owner** or **Manager**.
3. If nobody knows: search for the business on google.com/business, choose "Request access", and follow Google's flow. The current owner is notified and asked to respond. Keep your RERA certificate and office proof ready.

### 6.5 Google Analytics 4 + Google Tag Manager
1. analytics.google.com → create a GA4 property "PIKORUA Realty" (time zone India, currency INR) → a **Web data stream** for `https://www.pikorua.in` → note the Measurement ID (`G-…`).
2. tagmanager.google.com → create a container (Web) → note the ID (`GTM-…`) → add a **Google Tag** with your `G-…` ID, triggered on all pages → add a **GA4 event** tag for the `generate_lead` event that the site already pushes → Publish.
3. With Claude: set `NEXT_PUBLIC_GTM_ID=GTM-…` in `.env.production` on the VPS (unquoted) → run `./deploy/deploy.sh`.
4. GA4 → Admin → Events → mark `generate_lead` as a **key event**.
5. Check: GA4 Realtime shows your own visit. Submit one clearly labelled TEST lead and confirm it appears, then delete it in `/admin` before the CRM syncs it, or tell the CRM user to ignore it.

### 6.6 Other free tools
| Tool | Why | Setup |
|---|---|---|
| **Ahrefs Webmaster Tools** (free) | Backlinks, referring domains, a site audit; it fills our biggest unknown | Sign up → verify via GSC import |
| **UptimeRobot** (free) | Downtime alerts within 5 min | Add HTTP monitors for `https://www.pikorua.in/` and one API route |
| **Google Alerts** (free) | Email when "PIKORUA Realty" is mentioned online | google.com/alerts |
| **Finseo** (account already connected) | Automated AI-answer tracking | Create a project for pikorua.in with the AI Prompt Panel (Appendix B) |
| **Microsoft Clarity** (free, optional) | Session recordings and heatmaps | Set `NEXT_PUBLIC_MICROSOFT_CLARITY_PROJECT_ID`; mention it in the privacy policy |
| **Rank tracker** (paid, optional) | Daily positions for the Core 30 by country | Decision 8.10; GSC plus monthly manual checks are the free fallback |

### 6.7 What we measure (the KPI tree)
**The number that matters (North Star):** qualified NRI/HNI leads per month from organic search, AI assistants and Google Maps. Source: our DB (4.13) plus GA4.

**Leading indicators** (they move first and predict the North Star):
| Indicator | Tool | Frequency |
|---|---|---|
| Impressions and clicks (all pages; branded vs non-branded) | GSC | Weekly |
| Positions for the Core 30 (Appendix A), India and NRI countries | GSC + rank checks | Weekly / monthly |
| Indexing health (errors, valid pages, sitemap status) | GSC, BWT | Weekly |
| GBP searches, calls, website clicks, reviews | GBP Performance | Monthly |
| Referring domains, mentions, listicle presence | AWT, Google Alerts, tracker | Monthly |
| AI Prompt Panel mention rate and citations | Manual / Finseo | Monthly |
| AI referral sessions (chatgpt.com, perplexity.ai, gemini, copilot) | GA4 | Monthly |
| Conversion rate (leads ÷ sessions) per landing page | GA4 + DB | Monthly |
| Uptime | UptimeRobot | Continuous |

### 6.8 Baseline capture (Weeks 1–2, before SEO changes go live)
Record and date: GSC 16-month export (queries, pages, countries, devices); Core 30 positions; AI Panel run #1; GBP stats and reviews; AWT referring domains; GA4 from day 1; leads per week for the last 3 months from the DB (count only); the checker's full report. Everything goes into `docs/seo-baseline/2026-11.md`.

### 6.9 Routine (full-time, solo)
| When | Time | What |
|---|---|---|
| Daily | 10 min | Uptime OK? Leads arriving? Any GSC email alerts? |
| After each deploy | 10 min | `npm run guard -- --live`; add a change-log row |
| Weekly (Monday) | 1–2 h | GSC clicks/impressions/indexing; protected URL positions; changes due for their 2-week check |
| Monthly | half a day | Core 30 rank check; AI Panel; GBP; AWT; leads by source; **one-page report for your boss** |
| Quarterly | 1–2 days | Re-audit (repeat the measurements in Appendix E) and re-plan |

### 6.10 How we judge whether a change worked
1. **Wait the right amount of time:** technical fixes 2–6 weeks (recrawl); content 4–12 weeks; authority 3–6 months; GBP 2–6 weeks. [Judgement, consistent with Google's statement of 4–12 months for SEO overall]
2. **Compare like with like:** 28 days vs the previous 28 days, and year over year once we have history. Note festivals and seasonality.
3. **Compare changed vs unchanged pages** over the same dates. This separates our effect from Google updates and seasonality.
4. **Verdict per change in the change log:**
   - **Worked:** the target metric hit its target.
   - **Partly worked:** it moved but fell short. Run the ladder (5.8) to find the new bottleneck, adjust, and re-check in 4 weeks.
   - **No effect:** confirm Google has recrawled (URL Inspection). If it has, the hypothesis was wrong: write it down, try the next idea, and keep the change only if it is harmless and fixes a real issue.
   - **Hurt:** follow 5.7 → 5.8 → rollback (5.6) → post-mortem (5.9).

---
## Part 7: Timeline (full-time, solo, as fast as is safe)

**Principles:**
1. Measurement and safety first (you can't prove or protect anything without them).
2. Zero-risk fixes next.
3. Then the risky structural changes, in batches.
4. Content, local and off-site work run **continuously in parallel**, because they take longest to pay off.

### 7.1 Week by week (first 8 weeks)
| Week | Build and fix (with Claude) | Run yourself (non-code) |
|---|---|---|
| **1** | Checker v1 (`npm run guard`), feature-flag table + `/admin` toggles, `docs/SEO_CHANGELOG.md`; commit the live Nginx change; update `CLAUDE.md`; GA4/GTM live (6.5); release tags | GSC: request access to the existing property + create the Domain property (6.2); BWT import; ask who owns GBP (6.4); UptimeRobot; Google Alerts; AWT sign-up; unpublish the Lovable prototype |
| **2** | 4.1 sitemap fixes (blog posts in, non-pages out, 404s out); 4.4 schema clean-up; fix the GSC meta tag | **Baseline capture** (6.8); AI Prompt Panel run #1; decide the official NAP (8.4); start the listicle tracker (15 targets) |
| **3** | 4.2 Stage 0 (export `/p/` data from GSC) + Stage 1 behind flags (budget/location fixes, DB inventory, curated sitemap); 4.13 lead-source capture (additive migration) | GBP optimisation (once access arrives); reviews programme starts; Justdial duplicate merge request |
| **4** | 4.14a phone country picker (behind a flag); 4.5 homepage H1 + ContentGuard removal; RERA number on site (when supplied, 8.1) | Directory NAP clean-up; first outreach emails; first YouTube video |
| **5–6** | 4.3 URL inventory + duplicate consolidation, **batch 1** (groups with no traffic); Bing IndexNow ping | Corridor rewrite #1–#2 (4.7); collect deal data for the Q1 price report; communities (Reddit/Quora) |
| **7–8** | 4.3 batch 2; 4.2 Stage 2 redirects, batch 1; pikoruarealty.com root redirect (if 8.5 = yes) | Corridor rewrites #3–#4; CA/lawyer reviewer engaged (8.2); founder page and bylines (4.6) |

### 7.1b What to do next, as of 27 Oct 2026 [Measured]
This supersedes the Week-1 start date above for the items it covers — none of Week 1's code tasks have begun yet, and three of them now have an explicit decision attached:
1. **Nothing in Part 4 is currently blocking anyone.** Phase 1 code clean-up, uptime monitoring (4.15), and backups (4.15) are all **explicitly deferred by your own choice** — not forgotten, not stuck — with no start date set yet. When you're ready to resume any of them, say so and Week 1 of the timeline above picks up as written.
2. **The only item actively in progress:** finishing today's Core Web Vitals/Lighthouse recheck (4.12) — either by debugging the local headless-Chrome `NO_FCP` failure, or by you supplying a free PageSpeed API key. No decision needed from you unless you want to supply the key.
3. **Still blocked, no action possible from this side:** the backlink profile (4.10, 3.4) — VibeSEO's tool keeps erroring on `pikorua.in`. Unblocks only when that tool is fixed, or you hand over an export/screenshot from another tool (Ahrefs/SEMrush/Ubersuggest).
4. **Resolved today, no further action needed on it:** the 24 Oct firewall outage's root cause (3.3, Part 9) — a coworker's mistaken `ufw` change, already addressed by you directly.

### 7.2 Months 3–12
| Months | Focus |
|---|---|
| **3–4** | Remaining redirect and consolidation batches (protected groups last); **Q1 Ahmedabad Luxury Price Report** published and pitched to press; CA-reviewed NRI country guides; GIFT City and Gandhinagar pages; CRO fixes from 4–8 weeks of data (4.14b); speed fixes (4.12) |
| **5–6** | **6-month review against the baseline** (full re-audit, Appendix E repeated); double down on what moved, cut what didn't; corridor rewrites #5–#8; continuous outreach, video and reviews |
| **7–9** | Q2 price report + PR; case studies (4.6); secondary-market "select mandates" pages if justified (4.7); expand curated pages that perform |
| **10–12** | Q3 report; refresh the top 20 pages; year-end report: leads by channel vs baseline; plan year 2 |

### 7.3 What your boss can expect, and when (honest)
| When | What becomes visible | Evidence |
|---|---|---|
| End of week 2 | Dashboards live; a real baseline: traffic, leads by source, rankings, AI panel | GA4, GSC, baseline doc |
| Weeks 3–8 | Indexing clean-up in GSC (404s → 0, noindex noise falling); GBP activity and new reviews | GSC Pages report, GBP Performance |
| Months 3–6 | Ranking and click changes on the Core 30; first leads attributed to organic, Maps and AI | GSC, rank checks, lead-source data |
| Months 6–12 | Compounding effect of content and off-site mentions; AI panel mention rate | Monthly reports |

Google says SEO typically takes **four months to a year** to show benefit [Official]. Anything promised faster than that, beyond GBP and the technical clean-up, would be speculation.

### 7.4 A typical full-time week (about 40 h)
| Activity | Hours |
|---|---|
| Implementation with Claude (code, tests, deploys) | 12–15 |
| Content (rewrites, guides, report) | 8–10 |
| Outreach, PR, listicles | 6–8 |
| GBP, reviews, directories, communities | 3–4 |
| Video (shoot, edit, upload) | 3–4 |
| Measurement and reporting | 2–3 |

---

## Part 8: Decisions only you or your boss can make
| # | Decision | Why it's needed | Blocks |
|---|---|---|---|
| 8.1 | Provide the **GujRERA agent registration number** and certificate | Trust signal; legal compliance | 4.6, 4.4 |
| 8.2 | Engage a named **CA or lawyer** to review the NRI tax/legal guides | YMYL trust; accuracy of tax and FEMA facts | 4.6, 4.7 |
| 8.3 | Confirm the true **founding year** and which **claims** can be proven | Removes contradictions ("since 2009" vs 2023 records) and unsupported superlatives | 4.6 |
| 8.4 | The single official **NAP** (name, office address, main phone) | Local SEO consistency | 4.8 |
| 8.5 | Redirect the **pikoruarealty.com** root and `www` to pikorua.in (subdomains untouched)? | A thin brand site competes with the main one | 4.9 |
| 8.6 | The future of **millionmindstechcity.in** (keep separate vs merge into pikorua.in), plus a legal check on using a developer's project name as a domain | Brand split; possible trademark exposure | 4.9 |
| 8.7 | **Paid search/ads** in parallel, and the budget | Faster leads while SEO matures | 4.16 |
| 8.8 | The long-term role of the `/p/` pages (after Stage 0 data) | Biggest structural change | 4.2 |
| 8.9 | Who owns the existing **Search Console** and **Google Business Profile** | Access to history and reviews | 6.2, 6.4 |
| 8.10 | Pay for a **rank tracker**? | Daily positions by country vs manual monthly checks | 6.6 |
| 8.11 | **Privacy policy** update for analytics and Clarity (legal review) | Compliance when adding tracking | 4.13 |

---

## Part 9: Risk register
| Risk | Likelihood / impact [Judgement] | Mitigation |
|---|---|---|
| A redirect or consolidation loses a protected ranking | Medium / High | Protected URLs always win their group; small batches; flags; 2-week watch; revert the single redirect |
| A Google core update lands during our changes and muddies results | Medium / Medium | Check the Google Search Status Dashboard; compare changed vs unchanged pages (6.10) |
| A lead form or the CRM feed breaks | Low / Very high | Protected list, form tests on the Mac, live endpoint check, additive DB changes, immediate rollback |
| The GBP is suspended after edits | Low / High | One accurate edit; no keywords in the name; proof documents ready |
| A server command affects other apps on the shared VPS | Low / Very high | Only scoped `pikorua-website` commands; follow the migration plan's golden rules; never `ufw` without 80/443. **Update, 27 Oct 2026 [Measured]:** the 24 Oct instance of this risk is closed — root cause was a coworker's mistaken `ufw` change, addressed by you directly with him. No process change (e.g. restricting who can run `ufw` on the shared VPS) has been decided; the underlying risk of a repeat by someone else remains open until uptime monitoring (4.15) is in place, which you've chosen to defer. |
| No off-VPS backup of the database or media exists yet | Medium / Very high | Nightly `pg_dump` + `MEDIA_DIR` sync to off-VPS object storage (Backblaze B2 / Hetzner Storage Box), ~$1–3/month (4.15, 6.6). **Status, 27 Oct 2026:** discussed in full (why/how/cost/payoff) and **knowingly deferred by your own choice** — an accepted open risk for now, not an oversight. |
| The pikoruarealty.com redirect breaks internal apps | Low / High | Rule limited to the root and `www`; test every subdomain before and after; delete the rule if anything breaks |
| Outreach seen as spam / paid links break Google policy | Medium / Medium | Personal, fact-based pitches; paid = `sponsored`/`nofollow`; no link schemes |
| Legal exposure from claims or domain names | Medium / Medium | Legal review of claims (ASCI) and of the microsite domain (8.6) |
| Solo bandwidth / single point of failure | High / Medium | This document, the change log and the runbooks make the work hand-over-able; priorities are ordered by impact |
| AI answers stay volatile despite the work | High / Low–Medium | Measure trends monthly, not single answers; focus on mentions that also help Google |
| A tool outage limits measurement (e.g. VibeSEO, rate limits) | Medium / Low | Free official tools (GSC, BWT, GA4, AWT) are the primary sources |

---

## Part 10: What I added beyond your request (and why)
| Added | What it is | Why we need it | What happens without it |
|---|---|---|---|
| **Analytics and lead attribution** (4.13) | GA4/GTM switched on; each lead records its source | Measured: no analytics runs today, and leads only carry UTM tags | No way to prove any result or see which channel brings NRI leads |
| **Search Console access fix** (6.2) | Join the existing property; fix the broken verification tag | Measured: the meta tag holds a file name; a verification file proves someone else owns the property | We start from zero history and miss errors |
| **Operations housekeeping** (4.15) | Uptime alerts, committing live config, verified backups | Measured: the 24 Oct outage was found by chance; live Nginx config is uncommitted | Long unnoticed outages; config lost on rebuild |
| **Phone country picker** (4.14a) | Searchable country list + real per-country validation | Your request. Measured: today's rule is a shape check only | Lost or uncallable NRI leads |
| **Conversion work** (4.14b) | Removing friction for NRI/HNI visitors | Leads, not traffic, are the goal | SEO gains leak away |
| **Paid search option** (4.16) | Ads in parallel | Your boss wants speed; Google says SEO takes 4–12 months | Slower lead growth (a business choice) |
| **Brand and domain clean-up** (4.9) | Prototype, root domain, microsite decisions | Measured: brand-only search fails; competing PIKORUA-branded sites | Word-of-mouth demand leaks to other results |
| **Legal and compliance checks** (4.6, 8.x) | RERA, advertising claims, privacy, domain naming | YMYL industry; regulated profession | Legal exposure; trust damage |
| **Evidence labels, glossary, change log, post-mortems** | How we work | You're learning, and you asked for facts | Decisions based on opinion; repeated mistakes |
| **Secondary-market guardrails** (4.7) | Honest pages for Dubai/Mumbai/Gurugram only with real deals | You confirmed they're a small part of the business | Recreating the doorway-page problem in new cities |

---

## Appendix A: Core 30 query set (baseline 26 Oct 2026, Google approximation via Firecrawl)

**Group 1: consultant and brand (searched from India)**
| Query | Baseline |
|---|---|
| luxury real estate consultant Ahmedabad | #4 (homepage) |
| best luxury property consultant in Ahmedabad for NRI | #1 (`/luxury-property-consultant-ahmedabad`) |
| real estate consultant Ahmedabad | to measure |
| luxury property consultant Ahmedabad | to measure |
| pikorua | not in top 20 |
| pikorua realty | #1 |
| pikorua realty reviews | #1 |

**Group 2: NRI (search from the country named, where applicable)**
| Query | Baseline |
|---|---|
| NRI property investment Ahmedabad (India) | #3 |
| buy luxury apartment in Ahmedabad from USA NRI (US) | #1 (`/nri-property-from-usa`) |
| Ahmedabad property investment for NRI in UAE Dubai (UAE) | #3 (`/nri/dubai`) |
| NRI property consultant Ahmedabad | to measure (`/nri-property-consultant-ahmedabad` ranked #12 for "best luxury property consultant in Ahmedabad for NRI") |
| buy property in Ahmedabad from UK (UK) | to measure |
| buy property in Ahmedabad from Canada (Canada) | to measure |
| Ahmedabad property for NRI Singapore (Singapore) | to measure |
| Ahmedabad property for NRI Australia (Australia) | to measure |
| how can NRI buy property in Ahmedabad | to measure |

**Group 3: product and location**
| Query | Baseline |
|---|---|
| luxury flats in Ahmedabad | #5 (`/luxury-apartments-ahmedabad`) |
| penthouse for sale in Ahmedabad | not in top 20 |
| luxury villas in Ahmedabad | not in top 20 |
| 4 BHK luxury flats Ahmedabad | to measure |
| 5 BHK flats Ahmedabad | to measure |
| luxury flats Iscon Ambli Road | to measure |
| luxury flats Sindhu Bhavan Road | to measure |
| luxury property Thaltej | to measure |
| luxury bungalows Shilaj | to measure |

**Group 4: GIFT City and Gandhinagar**
| Query | Baseline |
|---|---|
| GIFT City residential property investment | not in top 20 |
| flats in GIFT City | to measure |
| luxury property Gandhinagar | to measure |

**Group 5: informational**
| Query | Baseline |
|---|---|
| best area to buy luxury flat in Ahmedabad | #3 (`/luxury-apartments-ahmedabad`) |
| Ahmedabad luxury property prices 2026 | to measure |

"To measure" entries are filled in during baseline week (6.8).

## Appendix B: AI Prompt Panel (run monthly, incognito, same wording every time)
Assistants: ChatGPT (search on), Gemini, Perplexity, Microsoft Copilot, Google AI Mode.
1. Who are the best luxury real estate consultants in Ahmedabad?
2. I'm an NRI living in the USA. Who can help me buy a luxury apartment in Ahmedabad?
3. Which real estate advisor in Ahmedabad is good for NRIs living in Dubai?
4. Recommend a trustworthy property consultant for HNI buyers in Ahmedabad.
5. Who should I contact to buy a penthouse in Ahmedabad?
6. Which are the best areas in Ahmedabad for a luxury 4–5 BHK apartment?
7. Sindhu Bhavan Road vs Iscon-Ambli Road: which is better for a luxury home?
8. How can an NRI buy property in Ahmedabad without travelling to India?
9. Is GIFT City a good place to buy a residential property, and who can advise me?
10. Best property consultant for luxury homes in Gandhinagar?
11. What is PIKORUA Realty? Is it trustworthy?
12. Reviews of PIKORUA Realty Ahmedabad.
13. Luxury villa or bungalow in Shilaj: who are the advisors?
14. What does a ₹10 crore budget buy in Ahmedabad's luxury market?
15. Which consultants help NRIs from the UK buy property in Ahmedabad?
16. Ahmedabad luxury real estate market trends 2026.
17. How do I verify a property's GujRERA registration in Ahmedabad?
18. Best real estate consultant in Ahmedabad for NRIs from Canada or Australia.
19. Who manages property in Ahmedabad for NRIs?
20. Top luxury residential projects in Ahmedabad and who sells them.

**Log for each prompt × assistant:**

| Date | Assistant | Prompt # | PIKORUA mentioned? | Position among firms | Our URL cited? | Other sources cited |
|---|---|---|---|---|---|---|

The "other sources cited" column is the **target list for 4.10**.

## Appendix C: Protected URLs (never break or redirect without discussion)
| URL | Why protected [Measured 26 Oct 2026] |
|---|---|
| `/` | #4 for "luxury real estate consultant Ahmedabad"; #1 for "pikorua realty" |
| `/luxury-property-consultant-ahmedabad` | #1 for "best luxury property consultant in Ahmedabad for NRI" |
| `/nri-property-from-usa` | #1 for the US-searched NRI query |
| `/nri-property-from-uk` | #15 for the US-searched NRI query (to protect pending UK data) |
| `/nri-property-investment-ahmedabad` | #3 for "NRI property investment Ahmedabad" |
| `/nri/dubai` | #3 for the UAE-searched NRI query |
| `/luxury-apartments-ahmedabad` | #3 and #5 for luxury flat queries |
| `/nri-property-consultant-ahmedabad` | #12; part of the NRI cluster |
| `/properties`, `/properties/*` (21) | Inventory pages |
| `/blog/*` (19) | Content; to be added to the sitemap |
| `/contact`, `/thank-you`, `/about`, `/testimonials` | Main nav and conversion path |

This list is updated after the GSC baseline: every URL with meaningful clicks gets added.

## Appendix D: Detailed findings lists
**D.1 The 29 sitemap URLs returning 404** [Measured]
- `/ahmedabad/3-bhk-vs-4-bhk-flats`
- `/ahmedabad/ambli/luxury-flats`
- `/ahmedabad/ambli/penthouses`
- `/ahmedabad/best-areas-to-invest-in-real-estate`
- `/ahmedabad/bodakdev/luxury-flats`
- `/ahmedabad/bodakdev/penthouses`
- `/ahmedabad/is-it-good-time-to-buy-property`
- `/ahmedabad/iscon-ambli/luxury-flats`
- `/ahmedabad/iscon-ambli/penthouses`
- `/ahmedabad/luxury-properties-near-sg-highway`
- `/ahmedabad/luxury-vs-premium-properties`
- `/ahmedabad/prahladnagar/luxury-flats`
- `/ahmedabad/prahladnagar/penthouses`
- `/ahmedabad/premium-homes-for-nri-buyers`
- `/ahmedabad/ready-to-move-properties`
- `/ahmedabad/satellite/3-bhk-flats`
- `/ahmedabad/satellite/luxury-flats`
- `/ahmedabad/science-city/3-bhk-flats`
- `/ahmedabad/science-city/luxury-flats`
- `/ahmedabad/sg-highway/investment-properties`
- `/ahmedabad/sg-highway/luxury-flats`
- `/ahmedabad/shela/luxury-flats`
- `/ahmedabad/shela/villas`
- `/ahmedabad/sindhubhavan-road/luxury-flats`
- `/ahmedabad/sindhubhavan-road/penthouses`
- `/ahmedabad/thaltej/4-bhk-flats`
- `/ahmedabad/thaltej/luxury-flats`
- `/ahmedabad/top-builders-luxury-projects`
- `/nri/global/invest-in-ahmedabad-real-estate`

**D.2 Duplicate families found so far:** see the table in 4.3. The complete inventory is produced in Weeks 5–6.

**D.3 Combo URL counts by type** [Measured, sitemaps p-0 to p-7]

| Type | URLs | Allowed? |
|---|---|---|
| luxury-flats | 5,136 | yes |
| penthouses | 4,969 | yes |
| villas | 4,969 | yes |
| duplex | 4,660 | yes |
| office-space | 64 | allowed (office add-on) |
| retail-space | 54 | **not allowed** |
| commercial-plots | 49 | **not allowed** |
| warehouse | 49 | **not allowed** |

Indexable: 436 (80 per budget band + 36 without a budget). Noindex: 19,564.

## Appendix E: Evidence log (re-run quarterly to compare)
| Measurement (26 Oct 2026 unless noted) | Value | Method |
|---|---|---|
| Uptime check | 6/6 requests 200 in 0.14–0.19 s | curl |
| Outage | 24 Oct 2026 ~12:40–13:15 UTC, firewall (ufw) without 80/443 | `docs/VPS_MIGRATION_PLAN.md` (uncommitted note) |
| Sitemap URLs | 20,216 in child sitemaps + 32 entries in `sitemap.xml` (21 pages + 11 sitemap files) | Downloaded and counted |
| Combo indexability | 436 indexable / 19,564 noindex (80-URL sample: 78 noindex) | Site's own matching code run over all URLs + live sample |
| Non-combo sitemap URLs | 235: 206 OK, 29 returning 404 | Crawled each |
| Blog URLs in sitemaps | 0 (19 posts linked from `/blog`) | Sitemaps + `/blog` page |
| Homepage HTML | 264,641 B (44,203 B gzip); JSON-LD 34,772 B; 655 visible words | curl + parse |
| Schema | `knowsAbout` 205; `alternateName` 34; `aggregateRating` 5.0/6; SearchAction present; meta keywords 345 chars | Parsed JSON-LD |
| PageSpeed mobile | Perf 90, A11y 97, BP 96, SEO 100; FCP 1.7 s, LCP 2.6 s, TBT 0 ms, CLS 0.002, SI 6.5 s | pagespeed.web.dev (Lighthouse 13.5) |
| PageSpeed desktop | Perf 93; FCP 0.4 s, LCP 0.7 s, TBT 10 ms, CLS 0, SI 2.7 s | same |
| CrUX field data | "Insufficient real-world data" | PageSpeed |
| AI bot access | 200 for Googlebot, Bingbot, OAI-SearchBot, GPTBot, PerplexityBot, ClaudeBot | curl with each user agent |
| AI files | `llms.txt` 64,076 B; `llms-full.txt` 261,537 B; `facts.json` 578,019 B | curl |
| Analytics | No GTM/GA4/Clarity script in live HTML (dns-prefetch only) | Homepage HTML |
| GSC verification | Meta tag content = file name; `/google91c2c9a5f53b75d8.html` returns 200 | Code + curl |
| Location page similarity | 14–18% shared 8-word phrases; identical templated sentence | 6 pages compared |
| Listicle presence | 0 of 7 readable pages (4 more blocked automated access) | curl + text search |
| Brand domains | pikoruarealty.com (GoDaddy 2025-04-03, Cloudflare); pikorua.com (DropCatch 2017); millionmindstechcity.in (registrant org PIKORUA, 2026-05-20); pikorua.in (GoDaddy 2023-10-21, DNS on GoDaddy) | whois, dig |
| Rankings | See Appendix A | Firecrawl web search, location-specific |
| Not measured | Backlinks (tool errors), AI answers (no API access), GBP data (blocked), GSC history (no access) | — |

## Appendix F: Official sources referenced
- Google spam policies (doorway abuse, scaled content abuse, link spam, keyword stuffing): https://developers.google.com/search/docs/essentials/spam-policies
- Build and submit a sitemap: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Crawl budget (which sites it applies to): https://developers.google.com/search/docs/crawling-indexing/large-site-managing-crawl-budget
- Consolidate duplicate URLs: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Redirects and site moves (keep redirects ≥1 year): https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes
- Structured data general guidelines: https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- Review snippets / self-serving reviews (2019): https://developers.google.com/search/blog/2019/09/making-review-rich-results-more-helpful
- FAQ rich result changes (2023): https://developers.google.com/search/blog/2023/08/howto-faq-changes
- Sitelinks search box retirement (2024): https://developers.google.com/search/blog/2024/10/sitelinks-search-box
- Meta keywords not used (2009): https://developers.google.com/search/blog/2009/09/google-does-not-use-keywords-meta-tag
- Site names / alternateName: https://developers.google.com/search/docs/appearance/site-names
- Creating helpful, reliable, people-first content (E-E-A-T, Who/How/Why): https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- AI features and your website: https://developers.google.com/search/docs/appearance/ai-features
- Do you need an SEO? (4 months to a year): https://developers.google.com/search/docs/fundamentals/do-i-need-seo
- Core Web Vitals thresholds: https://web.dev/articles/vitals
- Google Search Status Dashboard: https://status.search.google.com
- Local ranking (relevance, distance, prominence): https://support.google.com/business/answer/7091
- Google Business Profile guidelines: https://support.google.com/business/answer/3038177
- OpenAI crawlers (OAI-SearchBot): https://platform.openai.com/docs/bots
- Bing IndexNow: https://www.bing.com/indexnow
- RERA Act 2016 (Section 9, agent registration): https://www.indiacode.nic.in (search "Real Estate (Regulation and Development) Act, 2016")
- GujRERA: https://gujrera.gujarat.gov.in
- ASCI Code: https://www.ascionline.in

**Note:** these links were correct at the time of writing; re-check them before quoting them to anyone, since documentation pages sometimes move. Study-level claims (e.g. Ahrefs' AI-visibility correlations) are labelled **[Study]** and were not re-verified in this audit.
