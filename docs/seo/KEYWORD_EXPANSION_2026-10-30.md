# PIKORUA Realty: Keyword expansion and SEO opportunity map (30 Oct 2026)

For management and whoever builds the next SEO pages. It extends the existing work in `keyword-master.csv`, `page-map.csv` and `SEO_GROWTH_STRATEGY.md`; it does not replace them.

**What changed today**
- `keyword-master.csv`: **147 → 283 keyword clusters** (+136, each tagged `[added 2026-10-30]`), across all 8 families. NRI is now the largest family (71 clusters).
- `page-map.csv`: 12 proposed pages, 2 major page upgrades and 2 product decisions added.
- Nothing has been published or deployed by this work.

**Search volume, difficulty and CPC are "unverified" for every row.** No keyword tool or Search Console data was available, and none has been invented. Validating them is step 1 of the plan (§7).

---

## 1. How fast can results come? (honest answer)

SEO cannot be switched on like ads. Realistic timelines for a site of PIKORUA's size:

| What | Typical time |
|---|---|
| A new or changed page is crawled and indexed | Days to 2 weeks (faster after a Search Console request or IndexNow) |
| Long-tail and question searches (e.g. "1 crore in pounds", "can OCI buy property in India") start ranking | 2–8 weeks |
| Locality and property-type searches (e.g. "penthouse in Thaltej") | 1–4 months |
| Head terms (e.g. "luxury property Ahmedabad", "NRI property investment") against portals | 3–12 months, needs links and brand signals |

**Fastest levers, in order:**
1. Fix cannibalisation (§5). Merging duplicate pages concentrates existing rankings, often within weeks.
2. Upgrade pages that already exist and rank (needs Search Console to see positions 5–20).
3. Long-tail NRI questions and tools, where portals are weak.
4. Google Business Profile with one consistent address, which drives map-pack visibility for "real estate consultant Ahmedabad".
5. IndexNow (instant Bing/Yandex indexing; the key file is already in `public/`, the `INDEX_NOW_KEY` setting is empty).

If management needs visibility **this week**, only paid search (Google Ads) delivers that. It also produces the real search-volume data this plan needs.

---

## 2. Coverage audit against the brief

| Brief section | Before today | Gaps found | Added today |
|---|---|---|---|
| 1. Luxury lifestyle | 10 clusters, single blog placeholder | No hub; BMW/X7, watches, fashion, clubs, interiors, art, golf missing | 14 clusters; one hub `/luxury-living-ahmedabad` replaces the placeholder |
| 2. Residential + localities | Good per-locality coverage (rates, 4 BHK, bungalows, guides) | "Posh / most expensive / best areas" questions; "for sale" transactional terms; independent houses; duplex/penthouse per locality; spelling variants; comparisons | 15 + 16 + 20 clusters |
| 3. NRI / Non-Resident Gujarati | 32 clusters, strong country pages | OCI rules, agricultural land, jantri, land records, tax beyond TDS, buying for parents, returning NRIs, currency/budget conversion, GCC and East-African Gujaratis, US/UK diaspora wording, fraud and encroachment | 39 clusters, 9 proposed pages |
| 4. Investors | 12 clusters | "Is Ahmedabad good for investment", price trend, calculators, pre-launch, mutual funds comparison, REITs | 13 clusters |
| 5. Commercial | 7 clusters (sale only) | Leasing (office/showroom for rent), premium/Grade-A, locality-led commercial, pre-leased | 10 clusters; retail blocked (§6) |
| 6. HNI / UHNI | 9 clusters | HNI advisor wording, **wealthy Indians abroad** (NRI + HNI together), trophy homes, confidentiality | 9 clusters, 1 proposed page |

**Locality names checked (30 Oct 2026):**
- "Sindhu Van" does not appear as a locality anywhere. Everything points to **Sindhu Bhavan Road** (variants: Sindhubhavan Road, SBR), which the site already uses. Please confirm whether a specific project was meant.
- Vaishno Devi Circle is also searched as "Vaishnodevi" and, misspelled, "Vaishnav Devi".
- Rajpath Rangoli Road is also searched as "Rajpath Rangoli" and "Rangoli Road".

---

## 3. What to build, in order

### P1: build first (highest value, realistic to rank, fits the brand)
| Page | Why | Notes |
|---|---|---|
| **Upgrade `/locations`** into "Posh and luxury areas of Ahmedabad" | Largest uncovered informational demand ("posh areas", "most expensive area", "best area to live", "where rich people live"); every section links to a locality page | No new URL; dated facts only |
| **`/nri/property-budget-currency-converter`** | "1 crore in USD/pounds/AED" is a high-intent NRI long tail; a tool earns links | Uses the site's existing live-rate source |
| **`/learn/jantri-rates-ahmedabad`** | High-volume Gujarat-specific term every buyer and NRI meets | Official GARVI source only; secondary sources say 2023 rates still apply with a 2024 draft pending, so verify first |
| **`/nri/non-resident-gujarati-property-ahmedabad`** (already proposed) | Core brand segment with no page | Consider a Gujarati-language version |
| **`/nri/nri-property-eligibility-fema`** (already proposed, now incl. OCI) | "Can OCI / NRI buy property / agricultural land" | YMYL: cite RBI with dates |
| **`/private-client-advisory/nri-hni-property-advisory`** | Joins the two priority segments: wealthy Indians abroad | Distinct from the all-NRI consultant page |
| **`/invest/rental-yield-calculator-ahmedabad`** (raised to P1) | Investor tool and linkable asset | Inputs only; no promised returns |

### P2: next
`/nri/gcc` (Qatar, Saudi, Kuwait, Oman, Bahrain in one hub) · `/nri/east-africa` · `/nri/buying-home-for-parents-ahmedabad` · `/nri/returning-nri-home-buying-guide` · `/nri/nri-property-tax-guide` (replaces the narrower capital-gains page) · `/learn/property-title-verification-gujarat` · `/compare/real-estate-vs-mutual-funds` · `/luxury-living-ahmedabad` hub · the commercial page's leasing and locality sections.

### Improve existing pages (no new URLs)
- **Locality pages:** add format sections (4 BHK / 5 BHK / penthouse / duplex / bungalow) and spelling variants. Do **not** recreate `/ahmedabad/<area>/<format>` URLs; the 20 locality-format URLs were retired as 404s on 29 Oct.
- **Property-type pages:** "for sale" wording, configuration sections, and "independent house" wording on the bungalow page.
- **Consultant pages:** use the words buyers use ("dealer", "broker", "agent"), and show the GujRERA number once supplied.

Rule kept from the existing strategy: **one page per intent**. Variations go into the same page's copy and FAQ, never into new thin pages.

---

## 4. Luxury-lifestyle strategy

The aim is brand association, not ranking for car prices.
- **Build one hub, `/luxury-living-ahmedabad`.** Sections cover neighbourhoods, private clubs, schools, fine dining, five-star hotels, official car showrooms by area, jewellery, watches, art and collectibles, interiors. Each section links naturally into the matching locality or property page, e.g. "homes near Karnavati Club" → `/locations/karnavati-club`.
- **Strongest bridges to property:** private clubs, interiors for new homes, schools and golf villas.
- **Recorded as "do not build":** "BMW X7 price", "S-Class price in Ahmedabad". Dealers and manufacturers own those results, and the searcher is buying a car, not a home.
- **Earned visibility** with luxury brands (co-hosted events, showroom partnerships, hotel concierge desks) does more for the "luxury = PIKORUA" association than pages do (see `SEO_GROWTH_STRATEGY.md` §7).

---

## 5. Cannibalisation: pages competing for the same searches

Pick the winner using Search Console clicks and impressions, then **301-redirect** the losers and update internal links. Suggested winners are in bold.

| Intent | Competing live pages |
|---|---|
| UAE / Dubai NRIs | **/nri/dubai**, /nri-property-from-uae, /nri-property-from-dubai, /nri/dubai/luxury-flats-ahmedabad, /nri/dubai/property-investment-ahmedabad |
| USA NRIs | **/nri/usa** or /nri-property-from-usa (check GSC: the latter was reported #1 in the US), /nri/usa/luxury-flats-ahmedabad, /nri/usa/property-investment-ahmedabad. Same pattern for UK, Canada, Singapore, Australia |
| NRI buying process | **/nri-home-buying-process-india**, /nri-buying-property-in-ahmedabad, /learn/how-to-buy-property-as-nri-ahmedabad, /invest/nri-property-investment-guide-ahmedabad |
| Penthouses | **/penthouses-ahmedabad**, /ahmedabad/penthouses (+ /3-bhk, /4-bhk, /5-bhk), /ahmedabad/5-bhk-penthouses, /private-client-advisory/luxury-penthouses-ahmedabad |
| 4 BHK | **/luxury-4bhk-ahmedabad**, /ahmedabad/4-bhk-luxury-flats, /ahmedabad/luxury-flats/4-bhk |
| 5 BHK | **/luxury-5bhk-ahmedabad**, /ahmedabad/luxury-flats/5-bhk |
| Villas / bungalows | **/luxury-villas-ahmedabad** vs /ahmedabad/villas; **/luxury-bungalows-ahmedabad** vs /private-client-advisory/luxury-bungalows-ahmedabad |
| High ROI | **/invest/high-roi-luxury-property-ahmedabad**, /ahmedabad/high-roi-investment-properties, /ahmedabad/luxury-flats/high-roi |
| Investment property | **/investment-property-ahmedabad**, /ahmedabad/investment-properties, /ahmedabad/luxury-flats/for-investment |
| Market trend | **/ahmedabad-luxury-property-market-report**, /ahmedabad/real-estate-trends-2026, /invest/ahmedabad-luxury-market-outlook-2026 |
| Ready vs under construction | **/compare/under-construction-vs-ready-to-move** vs /ahmedabad/ready-to-move-vs-under-construction (near-identical) |
| Luxury homes umbrella | **/luxury-real-estate-ahmedabad**, /luxury-homes-ahmedabad, /ahmedabad/luxury-homes, /ahmedabad/premium-properties |
| Ultra-luxury | **/ultra-luxury-properties-ahmedabad** vs /private-client-advisory/ultra-luxury-property-ahmedabad |
| Plots | **/luxury-plots-ahmedabad** vs /private-client-advisory/villa-plots-ahmedabad |
| **Duplicate AI blog posts** | million-minds-tech-city ×3; resset-group south-bopal ×2; commonwealth-games ×2; several "luxury real estate boom/growth" variants. Keep the best of each, deactivate the rest in /admin and redirect them |

The 22 older AI posts were published before the quality gate existed; review them alongside this consolidation.

---

## 6. Decisions only management can make

| Topic | Why it needs a decision |
|---|---|
| **Retail spaces** (requested in the brief) | CLAUDE.md limits commercial to office and showroom; retail needs an explicit product decision |
| **Farmhouses / weekend homes** | Real HNI demand, but not a property category today, and NRIs/OCIs cannot buy farmhouses under FEMA |
| **Office/showroom leasing** | "For rent" searches are large; confirm PIKORUA handles leasing before targeting them |
| **Dholera** | Large investor search volume but speculative and outside the luxury core; only a neutral due-diligence guide, if anything |
| **GujRERA agent number** | Needed on consultant pages and for "best consultant" listicle outreach (pending, due tomorrow) |
| **Gujarati-language pages** | Strong differentiator for Non-Resident Gujaratis; needs a fluent reviewer |

---

## 7. 30-day plan

| Week | Work | Needs |
|---|---|---|
| 1 | Connect **Google Search Console** (submit `/sitemap.xml` and `/sitemap/index.xml`, request indexing of P1 pages) and **Bing Webmaster Tools**; turn on IndexNow; confirm GA4 is recording; pull **Keyword Planner** volumes for the 283 clusters and update the CSV | Google account access |
| 1–2 | Cannibalisation merges (§5) after checking GSC; duplicate AI posts | GSC data, approval |
| 2–3 | Build P1: `/locations` upgrade, currency converter, jantri guide, NRG page, FEMA/OCI page, NRI-HNI page, yield calculator | Facts verified against official sources |
| 3–4 | Google Business Profile with one consistent address; first outreach: Ahmedabad press, diaspora media; submit the market report as a data story | GBP access, spokesperson |
| Ongoing | Automated blog (Mon/Wed/Fri) supports these clusters; later, add editorial briefs for the NRI rules and lifestyle hub topics | — |

**Measure:** impressions and clicks per cluster in Search Console (weekly), enquiries by source in /admin, and the position of the P1 pages.

---

## 8. Authority and backlinks (additions to `SEO_GROWTH_STRATEGY.md` §8)

No paid links, private blog networks or link schemes. Candidates to approach, each to verify before outreach:

- **Ahmedabad / Gujarat press:** Times of India Ahmedabad, Ahmedabad Mirror, Divya Bhaskar, Gujarat Samachar, DeshGujarat. Offer expert comment on the same news the automated blog tracks.
- **Real-estate trade press:** ET Realty, Moneycontrol, Hindustan Times Real Estate.
- **Diaspora media:** UK Gujarati publications such as Garavi Gujarat and Asian Voice; Gulf News and Khaleej Times (UAE Indians); Indian-American community outlets. Offer NRI buying-guide expertise and the currency converter as a resource.
- **Community bodies:** Gujarati Samaj associations abroad, and the Gujarat government's Non-Resident Gujarati initiatives (verify current programmes).
- **Linkable assets:** the market report (dated, sourced), the yield calculator, the currency converter, an NRI buying checklist PDF.
- **Citations:** Google Business Profile, Justdial (merge duplicates), LinkedIn. Use one name, address and phone everywhere (5 different addresses exist today).

---

## 9. Rules that still apply to every new page

- No guaranteed returns or unsupported appreciation/yield figures.
- Legal, tax, FEMA and RBI content must cite official sources with dates and signpost a CA or advocate.
- No unsupported claims about clientele, credentials or rankings.
- Only renderable URLs go into sitemaps (`src/lib/data/public-routes.ts`).
- One page per intent.
