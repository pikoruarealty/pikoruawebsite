# PIKORUA Realty: SEO Growth Strategy (keyword expansion, page architecture, authority)

> **Written:** 29 October 2026 · **Companion files:** [`keyword-master.csv`](keyword-master.csv) (147 keyword clusters, ~600 phrase variants), [`page-map.csv`](page-map.csv) (keyword-to-page map, 92 destinations), [`BLOG_AUTOMATION_REPORT.md`](BLOG_AUTOMATION_REPORT.md)
> **Relationship to [`../SEO_AEO_MASTER_PLAN.md`](../SEO_AEO_MASTER_PLAN.md):** the master plan (26–27 Oct) holds the measured live-site audit, the safety system and the measurement plan. This document adds what management asked for on top: the keyword master database, the keyword-to-page map, the NRI / investor / commercial / HNI / lifestyle architecture, the backlink plan, and the code changes made on 29 Oct. Where the two overlap, the master plan's measurements stand and this document points to them.

Evidence labels follow the master plan (§0.3): **[Repo]** verified in this repository, **[Measured]** measured on the live site or a local production build, **[Official]** platform documentation, **[Unverified]** needs external access, **[Judgement]** reasoned opinion.

---

## 1. Summary

1. **The site already has a large SEO surface:** 166 renderable landing/hub pages plus 19 published blog posts and 21 property pages [Repo]. The problem is not missing pages; it is **too many overlapping pages, a misleading programmatic layer, and almost no off-site authority** [master plan §3.1].
2. **Fixed on 29 Oct (code, not yet deployed):** sitemaps went from ~20,235 URLs (19,564 of them noindex [master plan, Measured]) to **661 URLs that all return 200, are indexable and self-canonical** [Measured on a local production build]. Blog posts are in a sitemap for the first time. All 11 broken internal link targets found by a full crawl are fixed. Details in §9.
3. **Realistic goal:** own the *luxury + NRI + HNI + Ahmedabad* niche and the brand, not every property search. Portals (99acres, MagicBricks, Housing.com) and developers hold listing-intent head terms [master plan §1.2, Measured]. PIKORUA can win advisory, NRI-process and locality-research queries, where expertise beats inventory size.
4. **NRI is the top priority and the strongest existing asset:** pages already rank #1–#3 in the US and UAE [master plan §3.2, Measured]. The plan is to **consolidate the five overlapping NRI "how to buy" pages and the country duplicates**, then add three genuinely new pages (Non-Resident Gujarati, FEMA eligibility, capital-gains on sale), each expert-reviewed.
5. **Luxury lifestyle** (cars, hotels, dining, jewellery, collectibles) is pursued as a **small editorial series tied to neighbourhoods**, plus paid audience targeting, not as keyword landing pages. Car-price or hotel-booking searches have intent PIKORUA cannot satisfy honestly; pages built for them would be thin and could hurt the site [Official: Google spam policies on scaled content and doorways].
6. **No search-volume, difficulty or CPC figures are given anywhere.** No reliable keyword data source was available. Every row in the CSV is marked `unverified` with the tool needed (§10).

---

## 2. Audit findings

### 2.1 Verified in the repository and on a local production build (29 Oct 2026)

| Area | Finding | Status |
|---|---|---|
| Sitemaps | `/sitemap.xml` listed sitemap files as page URLs; 20,000 `/p/` combo URLs submitted; 29 geo hrefs that 404; **0 blog posts**; properties from a hardcoded list only | **Fixed** (§9) |
| Combo pages `/p/...` | Budget filter is a no-op; location matching splits slugs so "road" matches every "... Road" listing; retail/warehouse/commercial-plot combos conflict with `CLAUDE.md`; intent pages duplicate their parent | **Fix built behind a flag** (`SEO_COMBO_STRICT_MATCHING`, off by default), §9 |
| Broken internal links | 11 targets returned 404 (29 dead data pages reachable via "related" lists, invalid `/p/...ready-to-move` links in content hubs, old links inside published AI posts) | **Fixed** |
| robots.txt | Correct: public pages allowed, `/admin/ /api/ /studio/` disallowed, AI search bots allowed, both sitemaps declared | OK |
| Canonicals | Every sitemap URL self-canonical (crawl of 661 URLs) | OK |
| Noindex | Only `/admin`, `/studio`, `/thank-you`, and combos with no matches. No unintended noindex found | OK |
| Rendering | Server-rendered HTML; content visible without JavaScript | OK (master plan, Measured) |
| Blog schema | `BlogPosting.wordCount` was 0 for every DB-stored post (counted only the legacy `content[]` field) | **Fixed** |
| Duplicate URL families | 4 BHK ×3, 5 BHK ×2, penthouses ×6, villas ×2, bungalows ×2, umbrella "luxury homes" ×5, investment ×6, NRI how-to ×5, NRI country pages ×2–4 each, market outlook ×3 | **Open**: needs GSC data to pick winners (master plan §4.3). Each family is flagged in `page-map.csv` |
| Structured data | Self-serving rating, 205-entry `knowsAbout`, misspelling aliases, retired SearchAction | Open (master plan §4.4) |
| Google Indexing API | Admin actions call it for blog URLs. Google limits this API to JobPosting and BroadcastEvent pages [Official] | Open: recommend removing from blog flows (no-op today, key not set). The new pipeline does not use it |
| Analytics | GA4, GTM and Clarity IDs are empty in `.env.production` [Repo] | Open (master plan §4.13) |
| Search Console | HTML verification file exists in `public/`; the meta-tag value in `layout.tsx` holds a file name, not a token [master plan] | Open: access needed (§10) |
| IndexNow | Key file exists in `public/`, but `INDEX_NOW_KEY` is empty in `.env.production`, so submissions no-op | Open: set the variable to the key file's name |
| Blog fallback | A static post whose DB row is set Inactive still renders from the code fallback (`src/lib/data/blog.ts`) | Open (low impact; noted in the blog report) |

### 2.2 Needs external access (not claimed)
Rankings, impressions, clicks, indexed-page counts, backlinks/referring domains, Core Web Vitals field data, Google Business Profile data, AI-assistant mentions. See §10 for the access each one needs. The master plan's 26 Oct measurements (Firecrawl SERP approximation, PageSpeed lab runs) are the latest available baseline.

---

## 3. Keyword master database: how to read it

`keyword-master.csv` columns: family, cluster, primary keyword, variations (semicolon-separated), intent, audience, geography, funnel stage, destination page, page status (`exists` / `exists (blog post)` / `proposed`), content type, priority, search volume, difficulty, CPC, metrics status, recommended action, notes.

- **Priority:** P1 = protect or strengthen now, P2 = next 3 months, P3 = later or opportunistic, P4 = don't pursue organically.
- **Metrics:** all `unverified`. Validate with Google Ads Keyword Planner (needs an Ads account; ranges only without spend) and with GSC impressions once access exists. **Do not add numbers from memory or AI tools.**
- **Destinations were checked by script against the route registry**, so every `exists` page is real and renders.
- **Typos and slang** stay out of visible copy (existing rule in [`../keyword-tracker.md`](../keyword-tracker.md)).

| Family | Rows | Main destination(s) |
|---|---|---|
| A. Luxury real estate Ahmedabad | 21 | `/luxury-real-estate-ahmedabad`, `/luxury-property-consultant-ahmedabad` (protected), `/properties`, market report |
| B. Residential property types | 21 | `/luxury-4bhk-ahmedabad`, `/luxury-5bhk-ahmedabad`, `/penthouses-ahmedabad`, `/luxury-bungalows-ahmedabad`, `/luxury-villas-ahmedabad`, `/luxury-apartments-ahmedabad` (protected) |
| C. Localities | 35 | One page per locality: `/locations/sindhu-bhavan`, `/locations/rajpath-club`, `/locations/thaltej`, `/locations/shela`, `/locations/vaishno-devi` + nearby micro-markets |
| D. Luxury lifestyle | 10 | Editorial series (blog category `luxury-living`, added 29 Oct) + existing "homes near" pages (clubs, mall, schools, hospital) |
| E. NRI / Non-Resident Gujarati | 32 | `/nri-property-investment-ahmedabad` hub (protected), country pages, process/tax/repatriation guides, 3 proposed pages |
| F. Investors | 12 | `/investment-property-ahmedabad`, compare pages, 2 proposed (residential vs commercial, yield calculator) |
| G. Commercial (office + showroom only) | 7 | `/commercial-property-ahmedabad`, GIFT City |
| H. HNI / UHNI | 9 | `/private-client-advisory` hub and its service pages |

---

## 4. Keyword-to-page rules (cannibalisation prevention)

1. **One page per search intent.** Configuration, budget and intent variants of a format (e.g. "4 BHK in Thaltej", "Thaltej flats for investment") are **sections and filters on the locality or format page**, never new URLs. This is the line between helpful structure and doorway pages [Official: Google spam policies].
2. **Protected pages win their group** (master plan Appendix C): `/luxury-property-consultant-ahmedabad`, `/nri-property-from-usa`, `/nri-property-investment-ahmedabad`, `/nri/dubai`, `/luxury-apartments-ahmedabad`, the homepage. Only additive edits.
3. **Consolidate with data, not by URL tidiness.** For each duplicate family in `page-map.csv`, pull 16 months of GSC page data, keep the URL with the clicks, merge the best content into it, and 301 the rest, in batches of about 20 with two weeks between batches (master plan §4.3).
4. **Homepage = brand + "luxury real estate consultant" head term; consultant page = consultant intent; umbrella page = "luxury property/real estate Ahmedabad".** Don't repeat the same H1/title pattern across them.
5. **Blog posts must not target a landing page's primary keyword.** Blog = news, analysis, guides that link *to* the landing page. The automated pipeline enforces topic de-duplication against every existing post (§9, blog report).
6. **New page test:** a new URL is created only if (a) no existing page serves the intent, (b) the content can be genuinely distinct (data, language, process, tool), and (c) someone can maintain it. Six proposals pass this test (§5.2, §6); everything else maps to an existing page.

---

## 5. NRI and Non-Resident Gujarati architecture (highest priority)

### 5.1 Target structure
```
/nri-property-investment-ahmedabad    ← hub (protected): why Ahmedabad, process overview, currency converter, links to everything below
├── /nri-property-consultant-ahmedabad     conversion page: book a video consultation (time-zone aware)
├── /nri-buying-property-in-ahmedabad      "buying from abroad" journey      ← merge /learn/how-to-buy-property-as-nri-ahmedabad,
├── /nri-home-buying-process-india         legal steps + documents              /invest/nri-property-investment-guide-ahmedabad here
├── Regulation & money (expert-reviewed, dated)
│   ├── NEW /nri/nri-property-eligibility-fema    who may buy what (FEMA NDI Rules 2019)
│   ├── /nre-vs-nro-property-payment ; /tds-on-property-purchase-by-nri
│   ├── NEW /nri/capital-gains-tax-nri-property-sale
│   ├── /repatriation-of-property-sale-proceeds-nri ; /power-of-attorney-for-nri-property-purchase ; /nri-home-loans-india
├── Services: /property-management-for-nris ; /nri-property-inspection-service ; /virtual-property-tours-ahmedabad ; /selling-inherited-property-for-nris
├── Countries (ONE page each — consolidate per master plan §4.3): USA (protected), UK, UAE/Dubai (/nri/dubai protected), Canada, Singapore, Australia, /nri/global
└── NEW /nri/non-resident-gujarati-property-ahmedabad   English + Gujarati
```

### 5.2 The three proposed NRI pages
| Page | Why it is distinct | Accuracy requirement |
|---|---|---|
| Non-Resident Gujarati (NRG) page | Language (a Gujarati version), and the family questions NRGs actually have: a home for parents, ancestral property, returning-home plans, East African and UK Gujarati communities | Validate demand in GSC; build only if a Gujarati speaker writes or reviews it |
| FEMA eligibility | Answers "can an NRI/OCI buy X?" directly. RBI clarified (Dec 2021) that NRIs and OCIs need no prior RBI approval to acquire immovable property **except agricultural land, farmhouses and plantation property**, under the Foreign Exchange Management (Non-debt Instruments) Rules, 2019; inheritance is treated differently | Written from the Rules / current RBI Master Direction text, reviewed by a lawyer, "last reviewed" date shown. Secondary sources (law-firm blogs) disagree on edge cases such as gifts and onward transfer |
| Capital gains on sale | Seller's tax position is a different intent from the buyer-side TDS page | CA-reviewed; budget-sensitive, so review after every Union Budget; no rates without a cited, dated source |

**Rule for all NRI legal/tax content:** educational framing, a visible "general information, not legal or tax advice" line, sources linked (rbi.org.in, incometaxindia.gov.in, gujrera.gujarat.gov.in), a named reviewer, and a review date. The automated blog pipeline **holds** any draft touching FEMA, RBI, repatriation, TDS, capital gains, DTAA, NRE/NRO/FCNR, PoA, or stamp-duty/GST rates for a person to check (blog report §4).

### 5.3 Countries
Keep one page per country already built. **Do not add new country pages** (e.g. Kenya, New Zealand) until GSC shows impressions from that country and the page can be genuinely localised (remittance routes, time zone, local tax signposting). Until then, cover them on `/nri/global`.

---

## 6. Investor, commercial and HNI architecture

- **Investors:** `/investment-property-ahmedabad` is the canonical investor page; six overlapping "investment / high ROI / rental income" pages should be consolidated into it after GSC review. Two proposed additions with genuine new value: `/compare/residential-vs-commercial-property-ahmedabad` and an **interactive rental-yield and holding-cost calculator** (user inputs only, no "expected return" defaults). The calculator is also the best candidate for earning links. All investor content: risks, liquidity, vacancy, costs and holding period are discussed; **no guaranteed ROI, no invented appreciation history**.
- **Commercial:** strictly **office + showroom** (`CLAUDE.md` constraint). "High-street retail" queries map to the showroom section; no retail or warehouse pages. Whether PIKORUA advises on *leasing* (not only sale) is **unverified from the repo**. Confirm before targeting "office for rent" queries.
- **HNI/UHNI:** the `/private-client-advisory` hub and its 12 service pages already cover the cluster. Work: tighten copy around process and confidentiality, remove any unverifiable exclusivity or credential claims (master plan §4.6), and link it from the consultant and NRI hubs.

---

## 7. Luxury lifestyle and brand awareness

**What management wants:** affluent people who search for luxury cars, hotels, dining, designer brands, jewellery or collectibles should meet PIKORUA.

**Assessment [Judgement, reasons given]:**
- Searches like "Mercedes-Benz S-Class price in Ahmedabad" or "BMW X7 on-road price" have **car-purchase intent**. Dealers and OEMs satisfy it; a property advisory cannot. Ranking pages for them would require copying third-party specs, would be thin, and would risk Google's scaled-content policy. Expected property enquiries from such pages: near zero.
- The **ethical and effective** way to reach that audience is **paid audience targeting**: Google Ads custom segments built from people who search luxury-car, five-star-hotel and fine-jewellery terms, and Meta/Instagram interest targeting, pointing to the NRI and private-client pages. This reaches exactly the "affluent but not searching for property" person, without pretending to be a car dealer. It needs budget, which is a management decision.
- Organic lifestyle content works where **lifestyle and home choice genuinely meet**. Planned as a **"Luxury Living in Ahmedabad" editorial series** (new blog category `luxury-living`, added 29 Oct):
  - *Where to stay while house-hunting in western Ahmedabad* (hotels, for visiting NRIs)
  - *Sindhu Bhavan Road after dark: a resident's dining guide* (links `/locations/sindhu-bhavan`)
  - *Golf-course living around Ahmedabad* (links the villas page)
  - *Homes near Rajpath and Karnavati clubs* (existing location pages)
  - *Designing a home for an art or watch collection* (display, security, climate control)
  - *International schools and the neighbourhoods around them* (links the schools guide)
  - Rules: original reporting and photos, no copied reviews or menus, no implied partnerships, disclose any sponsorship.
- **Lifestyle is not automated.** Testing on 29 Oct showed Google News lifestyle feeds for Ahmedabad returning almost nothing usable (a theft story, a fragrance launch). These pieces need a person.
- **Partnerships with real referral value (offline + online):** luxury car dealerships' owner events, five-star hotels' concierge desks for NRI visitors, private banks' and wealth managers' client events, golf clubs. These produce mentions, co-hosted content and links. They need outreach and the partner's approval.

Relationship of each lifestyle cluster to visibility, audience and enquiries: see the `notes` / `recommended_action` columns of family D in the CSV.

---

## 8. Backlinks and digital PR (ethical)

**Current state:** backlink profile **unverified** (the SEO tool errored; master plan §3.4). PIKORUA is absent from all 7 checked "best consultant" listicles [master plan, Measured]. **No backlink is claimed here.**

**Never:** buying links, private blog networks, automated link placement, link exchanges at scale, fake directories or satellite sites (the master plan also recommends retiring existing satellite/duplicate brand sites, §4.9).

| Opportunity | What to do | Can start now? |
|---|---|---|
| **Quarterly Ahmedabad Luxury Market Report** (`/ahmedabad-luxury-property-market-report`) | Make it the flagship linkable asset: dated, sourced data (registry/GujRERA/own anonymised transactions), charts, a methodology note. Pitch the findings to journalists | Yes (content); outreach needs time |
| Local business press | Ahmedabad Mirror, Times of India Ahmedabad, DNA, Divya Bhaskar/Gujarat Samachar property pages: expert commentary on market news (the same news the blog pipeline tracks) | Outreach needed |
| Real-estate trade press | ET Realty, Hindustan Times Real Estate, Moneycontrol, Prop News Time: quotes and contributed analysis | Outreach needed |
| NRI and diaspora media | Gujarati diaspora publications and community organisations in the US, UK and East Africa; NRI-focused finance columns | Outreach needed |
| Journalist request platforms | Respond to expert-quote requests on real estate and NRI topics | Yes |
| "Best consultant" listicles | Ask for inclusion with verifiable facts (RERA number once shown, years active, client reviews on third-party sites) | After RERA/trust fixes (master plan §4.6) |
| Citations | Google Business Profile, Justdial (consolidate the duplicate listing), Sulekha, IndiaMART-type B2B directories only if relevant, LinkedIn company page. **Identical NAP everywhere** (5 different addresses exist today, master plan §4.8) | Yes, needs GBP access |
| Partners | Developers whose projects PIKORUA genuinely advises on (partner pages often list channel partners), private banks, relocation firms, the lifestyle partners in §7 | Needs partner approval |
| Original tools | Rental-yield calculator, NRI process checklist PDF | After build |

Track every earned link in a simple sheet (date, URL, anchor, status verified by visiting the page).

---

## 9. Code changes made on 29 Oct 2026 (repository; not deployed)

| Change | Files | Effect [Measured on local production build] |
|---|---|---|
| Single route registry for data-defined pages | `src/lib/data/public-routes.ts` | Identifies the 29 hrefs that 404; used by sitemaps, related-page links and blog link validation |
| Sitemaps only list renderable, indexable URLs | `src/app/xml-sitemap/[id]/route.ts`, `src/app/sitemap.ts`, `src/lib/data/combo-seeder.ts` | 661 URLs (was ~20,235); 0 errors on full crawl |
| New `/sitemap/blog.xml` with real `lastmod` | same | All 19 published posts submitted (was 0) |
| Property sitemap from DB + static fallback | same | Admin-added properties included; a redirected old slug excluded |
| Combo matching moved to one module, with a strict mode behind `SEO_COMBO_STRICT_MATCHING` | `src/lib/data/combo-matching.ts`, `src/app/p/[...combo]/page.tsx` | Default (off) is byte-for-byte the old behaviour (regression test over every combo). On: real budget/BHK filters, exact locations, intent pages and disallowed commercial types noindexed; 21 genuine combo pages remain indexable |
| Related-page lists skip non-rendering pages; hub listing links validated | `src/lib/data/geo.ts`, `src/components/seo/ContentHubTemplate.tsx` | Broken internal link targets 11 → 0 |
| 3 redirects for old links inside published AI posts | `next.config.ts` | `/shilaj-properties`, `/penthouses-duplexes-ahmedabad`, `/luxury-penthouses-ahmedabad` |
| Blog schema fixes | `src/app/blog/[slug]/page.tsx` | Correct `wordCount`; Organization author for unreviewed automated posts |
| Automated blog pipeline reactivated with a quality gate | see [`BLOG_AUTOMATION_REPORT.md`](BLOG_AUTOMATION_REPORT.md) | |
| **Second pass (29 Oct):** site-wide schema clean-up | `src/app/layout.tsx` | Removed retired `SearchAction`, self-serving `aggregateRating`/`review`, and misspelling `alternateName`s (misspellings kept in `llms.txt`/`facts.json`). Live baseline: on 205–206 of 246 URLs |
| Homepage and market-report FAQs made visible; markup limited to what's shown | `src/app/page.tsx`, `src/app/ahmedabad-luxury-property-market-report/page.tsx` | Homepage marked up 20 hidden FAQs; now 6 visible ones (wording unchanged; price-quoting answers dropped until sourced) |
| 7 truncated titles shortened (non-protected pages) | `ahmedabad-seo-pages.ts`, `geo.ts`, `content-hubs.ts` | Titles were 70–87 characters |
| Rajpath Rangoli Road answer + description; Non-Resident Gujarati FAQ on the NRI hub | `src/lib/data/geo.ts` | Verified facts only; no prices |
| Templated "historically delivered 7–12%" return claims removed from combo pages | `combo-content-engine.ts`, `seo-dimensions.ts` | Regression test added. 74 other unsourced return claims listed for review in [`content-claims-review.csv`](content-claims-review.csv) |
| Crawl checker + live baseline | `scripts/seo-crawl-check.ts` (`npm run check:seo-crawl`), [`baseline-live-2026-10-29.csv`](baseline-live-2026-10-29.csv) | Live: 246 URLs, 29 × 404, 0 blog URLs, 2 pages with hidden FAQ markup. Local build: 660 URLs, 0 errors |
| Editorial queue + dry run for the blog pipeline | `src/lib/ai/blogTopicQueue.ts`, `blogPipeline.ts` | See blog report §7, §7b |

**Before enabling strict combo matching:** export `/p/` page data from GSC (master plan §4.2 Stage 0), then set `SEO_COMBO_STRICT_MATCHING=true` and rebuild. Removing URLs from the sitemap does not de-index them; strict mode does noindex the misleading ones, and it is reversible by unsetting the variable.

---

## 10. Measurement and external access needed

| Need | Tool | Who |
|---|---|---|
| Rankings, impressions, clicks, indexing, sitemap status | Google Search Console: get added as Owner/Full user on the existing verified property (an HTML verification file is live, so a property exists), then resubmit `/sitemap.xml` and `/sitemap/index.xml` | Whoever owns the existing GSC property |
| Bing indexing + IndexNow | Bing Webmaster Tools (import from GSC); set `INDEX_NOW_KEY` to the name of the key file already in `public/` | You |
| Keyword volume, CPC ranges | Google Ads Keyword Planner (exact volumes need an active campaign) | You / management |
| Backlinks, referring domains | Ahrefs Webmaster Tools (free after verifying the site) or Bing WMT backlinks | You |
| Traffic and lead source | Set GA4/GTM IDs (empty today) and store a lead's referrer/landing page (master plan §4.13) | You |
| Local | Google Business Profile access (master plan §6.4) | Owner of the GBP listing |
| AI-assistant visibility | Monthly manual prompt panel (master plan Appendix B) | You |

**What "done" will mean (targets, not predictions):** GSC sitemap status "Success" with no 404/noindex warnings within ~4 weeks of deploy; one indexable page per duplicate family; NRI hub and country pages holding or improving their measured positions; a published market report and at least one earned editorial mention per quarter. No ranking, traffic or enquiry improvement is claimed until GSC/GA4 show it.

---

## 11. Roadmap

| Phase | Work | Depends on |
|---|---|---|
| **Now (code ready)** | Deploy the 29 Oct changes; apply migration 014; resubmit sitemaps in GSC/BWT; set `INDEX_NOW_KEY` | Your "go"; GSC access for resubmission |
| **Quick technical fixes (weeks 1–3)** | Strict combo matching after GSC export; schema clean-up (master plan §4.4); remove Google Indexing API calls from blog flows; GA4/GTM IDs; show RERA number | GSC data; RERA number from management |
| **High-intent pages (weeks 2–8)** | Consolidate duplicate families in batches (`page-map.csv`); deepen the 5 priority locality pages with dated price bands, connectivity, schools; add "Rajpath Rangoli Road" naming to the Rajpath page | GSC data per family |
| **NRI architecture (weeks 3–10)** | Merge NRI how-to duplicates; build the FEMA-eligibility page (lawyer review) and the NRG page (Gujarati reviewer); capital-gains page (CA review); NRI consultation booking with time-zone support | Reviewers named |
| **Investor & commercial (months 2–3)** | Yield calculator; residential vs commercial comparison; confirm the leasing scope; showroom/office sections with verified inventory | Inventory data |
| **Automated blog (on deploy)** | Run with `BLOG_AUTOPUBLISH=false` for 2 weeks (drafts + reasons in /admin), then switch on | Management approval to switch on |
| **Lifestyle editorial (months 2–6)** | 1–2 human-written Luxury Living pieces a month; pilot paid audience targeting | Writer; ad budget |
| **Digital PR (ongoing from month 1)** | Quarterly market report + journalist outreach; citations/NAP clean-up; listicle inclusion | GBP access, report data |
| **Measure (monthly)** | GSC by page family, NRI country segments, lead sources, AI prompt panel | Analytics live |
