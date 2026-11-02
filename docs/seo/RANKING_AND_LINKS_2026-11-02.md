# Ranking and link opportunities — 2 Nov 2026

Sources: Search Console Performance export (`https___www/`, **last 16 months**, no page↔query link),
Coverage export of 29 Oct (totals only), live search results checked 2 Nov 2026 (India, via Firecrawl —
close to Google but not identical; confirm in Search Console).

## 1. What the data says

- **NRI search demand is small.** All NRI-type queries together: 15 queries, 251 impressions, 0 clicks in
  16 months. NRIs mostly search the same luxury terms as everyone else (US: 2,461 impressions, UK 528,
  UAE 252). NRI pages help convert NRIs; luxury pages are what bring them in.
- **HNI luxury terms carry the volume** (482 queries, 17,683 impressions) and are close to the top.
- The 16-month average positions are stale. Live positions on 2 Nov are better:

| Query | Our page | Live position | 16-mo avg |
|---|---|---|---|
| luxury apartments in ahmedabad | /luxury-apartments-ahmedabad | 3 | 13.1 |
| penthouse in ahmedabad | /penthouses-ahmedabad | 6 | 10.0 |
| luxury villas for sale in ahmedabad | /luxury-villas-ahmedabad | 6 | 11.0 |
| best luxury real estate consultant in ahmedabad | / | 6 | — |
| NRI property consultant ahmedabad | /nri-property-consultant-ahmedabad | 1 | — |
| sindhu bhavan road luxury flats | /luxury-apartments-ahmedabad (not the Sindhu Bhavan page) | 5 | — |
| luxury bungalows in ahmedabad | — | not in top 10 | 10.9 (page) |
| NRI buy property in Ahmedabad from USA | — | not in top 10 | — |

- Coverage: 15,578 "Discovered – currently not indexed" and 4,844 "Excluded by noindex" are almost all
  `/p/` combo URLs. Fixed in the 31 Oct release (no more links to noindex combos); the counts should fall.
  The export has totals only, so the 28 redirect / 3 not-found URLs need the drill-down export
  (Search Console → Pages → click each reason → Export).

## 2. On-page priorities (highest value first)

1. **/luxury-villas-ahmedabad and /luxury-bungalows-ahmedabad** — villas at #6, bungalows not in top 10
   (108 + 98 + 75 impressions over 16 months across "bungalow(s) in ahmedabad" variants). Listing sites
   (onlynew, ahmedabadprojects, 99acres) win with project lists; add named projects/areas, prices, FAQs.
2. **Sindhu Bhavan Road** — biggest single query (4,517 impressions, avg 8.5). *Corrected later on 2 Nov:*
   the page Google shows for "sindhu bhavan road" is the blog guide (7,928 impressions); the apartments
   page only showed for the narrower "luxury flats" search. `/sindhu-bhavan-road-properties` already
   301s to `/locations/sindhu-bhavan`. Fixed: area pages now list homes by corridor or area name
   (SBR 1→5 homes, Iskon–Ambli 0→7, Vaishno Devi 0→3), plus three SBR questions.
3. **/penthouses-ahmedabad** (#6) — competitors are portals + Adani; add a project/price table and FAQs.
4. **Home page for "luxury real estate consultant ahmedabad"** (#6) — reviews/GBP and "best consultant"
   list mentions matter most here (see §3).
5. **NRI guide** (`/learn/how-to-buy-property-as-nri-ahmedabad`) — not in top 10 for "NRI buy property in
   Ahmedabad from USA"; developer blogs and Wise rank. Low volume, but high value per lead.
6. Today's auto-blog post `/blog/nri-property-management-ahmedabad` overlaps `/property-management-for-nris`;
   link the post to that page so the page stays the one that ranks. Typo in its key-numbers box: "U$238,000".

## 3. Backlink / mention targets found in today's results

"Best of" and directory pages that already rank for our money keywords — getting listed on these gives
both a link and direct visibility:

| Site | Page ranking for | Ask |
|---|---|---|
| justdial.com | "Estate Agents for NRI in Ahmedabad" category (#2 for NRI consultant) | Add PIKORUA to this category; merge the duplicate listing |
| therealtors.co.in | "Top 5 Real Estate Consultant in Ahmedabad" (#2) — a broker listing itself + 4 others | Request inclusion |
| resmanagement.in | "Top 10 Best Real Estate Agents in Ahmedabad" (#4) — a broker listing itself + 9 others | Request inclusion |
| prelaunchoffers.com | "Top 10 Most Luxurious Flats in Ahmedabad" | Offer project data / quote |
| investoxpert.com | "Top 10 Best Luxury Villas in Ahmedabad" (dated 2023/24) | Offer an update with current data |
| archello.com | Luxury apartment / penthouse interior features | Partner architects/interior firms to credit PIKORUA |
| newswire.com | Press release ranks #9 for an NRI query | Press release for the market report |

Dropped after checking: onlynew.in and ahmedabadprojects.com are one company's own promotion (same
Bing verification code), no outside firms listed. Drafts for the rest: `OUTREACH_DRAFTS_2026-11-02.md`.

Not competitors to approach: developers (Adani, Goyal, Arvind) and portals (99acres, MagicBricks, Housing) —
but developers we list projects for can link to us as channel partner.

## 4. Not possible today

- VibeSEO backlink/competitor tools returned errors for every call, and VibeSEO has no pikorua.in project
  (only maruti360.com), so there is no competitor backlink gap yet. Retry later, or create a pikorua.in
  project there and connect Search Console for page↔query data.
