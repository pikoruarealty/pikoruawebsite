# One-week leads plan — 6 Nov 2026

Goal: more NRI / HNI enquiries within 7 days. Organic SEO and AI answers will not move that fast,
so this week combines (1) paid search for instant visibility, (2) Google Business Profile + reviews,
(3) the on-page enquiry form (code, ready locally), (4) listing / outreach that AI answers cite.

## Day 1 — Google Business Profile (15–30 min, owner logs in)

Listing: https://maps.app.goo.gl/1YcxQwmF7UGicszEA

- Primary category: **Real estate consultant**. Additional: Real estate agency.
- Website: `https://www.pikorua.in/?utm_source=google&utm_medium=organic&utm_campaign=gbp`
- Phone: +91 6354 359 222 · Hours: real office hours only.
- Services (add each): Luxury apartment advisory · Penthouse advisory · Villa & bungalow advisory ·
  NRI property purchase support · Video walkthroughs · Registration coordination · Handover support.
- Photos: 10+ real photos (office exterior with signage, interior, team, site visits). No stock images.
- Description (approved claims only, ~575 characters; Google allows 750):

> PIKORUA Realty is a private luxury residential advisory in western Ahmedabad for local HNI families
> and NRI buyers. We help clients shortlist 4–5 BHK apartments, penthouses, villas and bungalows in
> areas such as Sindhu Bhavan Road, Iskon–Ambli, Shilaj, Thaltej and Bodakdev. For buyers abroad we
> arrange video walkthroughs and coordinate RERA and project documents, negotiation, registration and
> handover, with referrals to lawyers, chartered accountants and property managers when needed.
> GujRERA agent registration: AG/GJ/AHMEDABAD/AHMEDABAD CITY/AUDA/AA01632/300726R1.

  ⚠️ Confirm the GujRERA number is still valid before adding the last line.

- Post one update ("NRI video consultations available across US/UK/UAE time zones") with a link to
  `/nri-property-consultant-ahmedabad?utm_source=google&utm_medium=organic&utm_campaign=gbp-post`.

## Day 1–3 — Reviews (owner / sales team)

Send the GBP "Ask for reviews" link personally to every past client. No incentives, no reviews written
for clients, no staff reviews. Reply to every review.

WhatsApp message:

> Hi {name}, thank you again for trusting PIKORUA Realty with your home in {area}. If you have a
> minute, an honest Google review would really help other families find us: {review link}.
> Thank you! — {advisor name}

## Day 1–2 — Google Ads (only route to new leads inside a week; budget = management decision)

Set a daily cap the boss is comfortable with and check CPCs in Keyword Planner before launch.
Conversion tracking: GA4 `generate_lead` event (already sent by every site form) imported into Ads.

**Campaign A — HNI, Ahmedabad (Search)**
- Location: Ahmedabad + 25 km, "presence" (people in the area).
- Ad groups → landing page:
  - luxury apartments / 4 BHK / 5 BHK luxury flats Ahmedabad → `/luxury-apartments-ahmedabad`
  - penthouse Ahmedabad → `/penthouses-ahmedabad`
  - luxury villa / bungalow Ahmedabad → `/luxury-villas-ahmedabad`
  - Sindhu Bhavan Road / Iskon Ambli flats → `/locations/sindhu-bhavan`, `/locations/iskon-ambli`
- Match types: phrase + exact.

**Campaign B — NRI (Search)**
- Locations: United States, United Kingdom, UAE, Canada, Australia (presence).
- Keywords: "property in Ahmedabad", "flats in Ahmedabad", "luxury apartments Ahmedabad",
  "buy property in Ahmedabad from USA/UK/Dubai", "NRI property Ahmedabad".
  (Search Console shows NRIs mostly use the same luxury terms as local buyers.)
- Landing: `/nri-property-consultant-ahmedabad`, country pages `/nri/uk`, `/nri/dubai`, `/nri/canada`.

**Negative keywords (both):** rent, rental, PG, hostel, 1 BHK, 2 BHK, cheap, affordable, low budget,
jobs, salary, course, plot loan, commercial, shop, warehouse, 99acres, magicbricks, housing.com, olx.

**Ad text rules:** approved claims only (OFFICIAL_BUSINESS_FACTS.md). No "best", no returns, no
guarantees, no unconfirmed numbers (80+ transactions, 12+ years, 38%).

### Ready-to-paste ad text (Responsive Search Ads; lengths checked: headlines ≤30, descriptions ≤90)

**Campaign A (HNI) headlines:** Luxury Apartments Ahmedabad · 4 & 5 BHK Luxury Homes · Penthouses, Villas & Flats ·
Sindhu Bhavan & Iskon-Ambli · Shilaj, Thaltej & Bodakdev · Private Luxury Home Advisory · With Negotiation Support ·
Registration Coordination · Book a Private Consultation · PIKORUA Realty Ahmedabad · Shortlists Matched to Budget ·
Western Ahmedabad Homes

**Campaign A descriptions:**
1. Shortlist 4-5 BHK apartments, penthouses & villas in western Ahmedabad with one advisor.
2. From shortlisting to negotiation, registration and handover, we coordinate each step.
3. Share your budget and preferred area. An advisor replies personally with homes that fit.
4. Private luxury residential advisory for HNI families in Ahmedabad. Enquire today.

**Campaign B (NRI) headlines:** Buy in Ahmedabad From Abroad · NRI Property Advisory · Video Walkthroughs for NRIs ·
Luxury Homes in Ahmedabad · From the USA, UK, UAE, Canada · 4-5 BHK Homes for NRIs · Registration Coordination ·
Referrals to Lawyers & CAs · Time-Zone Friendly Calls · PIKORUA Realty Ahmedabad · Handover Support Included ·
Book a Video Consultation

**Campaign B descriptions:**
1. See shortlisted homes on live video walkthroughs before you plan a trip to Ahmedabad.
2. We coordinate RERA documents, negotiation, registration and handover for buyers abroad.
3. Referrals to lawyers, CAs and property managers in Ahmedabad when you need them.
4. Share budget, area and time zone. An advisor replies personally and books a video call.

**Callouts:** Video Walkthroughs · Negotiation Support · Registration Support · Handover Support · NRI Advisory · 4-5 BHK Homes
**Sitelinks:** Penthouses → `/penthouses-ahmedabad` · Villas & Bungalows → `/luxury-villas-ahmedabad` ·
NRI Advisory → `/nri-property-consultant-ahmedabad` · Contact → `/contact`
**Call asset:** +91 6354 359 222 (set to office hours so calls are answered).

Pin "PIKORUA Realty Ahmedabad" to headline position 1 only if the boss wants brand-first ads; otherwise leave unpinned.

Tag every final URL: `?utm_source=google&utm_medium=cpc&utm_campaign={campaign}&utm_term={keyword}`
— the site stores these with each lead, so the CRM shows which ad produced it.

## Day 2–5 — Listings and outreach (drafts ready in OUTREACH_DRAFTS_2026-11-02.md)

1. Justdial: merge duplicate listing; add "Estate Agents for NRI" category; same NAP as GBP.
2. RES Management "Top 10" and TheRealtors "Top 5" inclusion requests.
3. Bing Webmaster Tools → import from Search Console → submit sitemap (ChatGPT search relies on Bing).
4. LinkedIn company page + Instagram bio: same name, phone, address, website as GBP.

## Code (ready locally, not yet live)

On-page enquiry form on every landing page, guide and blog post (`#enquire`), hero "Private Advisory"
buttons scroll to it, and each lead records the page it came from ("Interest: Enquiry from /penthouses-ahmedabad").
Before this, those pages had no form — visitors had to click through to /contact (a multi-step form) or WhatsApp.

## How to measure after 7 days

- Leads in the CRM by source / UTM / "Enquiry from" page.
- GA4: `generate_lead` events by landing page (analytics live since 3 Nov).
- GBP Insights: calls, website clicks, direction requests, review count.
- AI visibility tracker (AI_VISIBILITY_TRACKER.md): run the 10 prompts now as the baseline, again in 4 weeks.
