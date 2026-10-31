/**
 * content-hubs.ts
 *
 * Central data store for all Content Hub authority pages.
 *
 * Categories:
 *  - "compare"   → /compare/[slug]    asset & property type comparisons
 *  - "invest"    → /invest/[slug]     investment intent & market guides
 *  - "learn"     → /learn/[slug]      education & explainer pages
 *  - "gift-city" → /gift-city/[slug]  GIFT City specific guides
 *
 * Each page is hand-crafted with substantive editorial content — not
 * combinatorial. These pages build PIKORUA's topical authority and
 * funnel readers into the /p/[combo] listing layer.
 *
 * Tone: expert advisory — not portal/aggregator. Every page should read
 * as if written by a senior PIKORUA advisor, not a content farm.
 */

import { PHASE_14_CONTENT_PAGES } from "@/lib/data/phase14-content";
import { PAGE_MERGES } from "@/lib/data/page-merges";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type ContentHubPrefix = "compare" | "invest" | "learn" | "gift-city";

export interface ContentSection {
  heading: string;
  body: string[];
}

export interface ComparisonRow {
  label: string;
  a: string;
  b: string;
}

export interface ContentHubPage {
  slug: string;
  prefix: ContentHubPrefix;
  href: string;
  title: string;
  description: string;
  h1: string;
  eyebrow: string;
  intro: string;
  heroImage: string;
  /** 3 key expert takeaways — shown in the summary card */
  keyTakeaways: string[];
  sections: ContentSection[];
  /** Only for /compare pages */
  comparisonTable?: ComparisonRow[];
  faqs: { question: string; answer: string }[];
  /** /p/[combo] hrefs that appear in the related listings strip */
  relatedListingHrefs: string[];
  /** Other content hub slugs to cross-link */
  relatedHubSlugs: string[];
  marketSignals: string[];
  publishedAt: string;
  category: "comparison" | "investment" | "education" | "gift-city";
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO IMAGES (shared pool)
// ─────────────────────────────────────────────────────────────────────────────

const H = {
  sindhu: "/properties/ikebana/ikebana1.png",
  capstone: "/properties/capstone/capstone-1-courtyard.jpg",
  maruti: "/properties/maruti-360/maruti-360-view.jpg",
  anurita: "/properties/anurita/anurita-1.jpg",
  kalrav: "/properties/kalrav-alpines/kalrav-alpines-1.jpg",
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPARISON PAGES — /compare/[slug]
// ─────────────────────────────────────────────────────────────────────────────

export const COMPARISON_PAGES: ContentHubPage[] = [
  // ── Asset Class Comparisons ─────────────────────────────────────────────
  {
    slug: "commercial-property-vs-gold",
    prefix: "compare",
    href: "/compare/commercial-property-vs-gold",
    title: "Commercial Property vs Gold in Ahmedabad",
    description: "A data-driven comparison of commercial real estate and gold as investment vehicles in Ahmedabad's 2026 market. Covers yield, liquidity, appreciation, and tax treatment.",
    h1: "Commercial Property vs Gold: Which Investment Wins in Ahmedabad?",
    eyebrow: "Investment Analysis · PIKORUA Advisory",
    intro: "Gold and commercial real estate have different income, liquidity, operating-cost, and risk profiles. This guide offers a framework for comparing them using current product terms and verified property-level evidence; it does not predict or promise returns." ,
    heroImage: H.capstone,
    keyTakeaways: [
      "Property income and price changes vary by asset and period; gold returns vary by instrument and purchase date. Compare dated, like-for-like evidence and account for costs, taxes, liquidity, and risk.",
      "Gold scores higher on liquidity — any quantity sellable within hours. Commercial property requires 60–180 days for a quality exit in Ahmedabad's market.",
      "Tax treatment favours commercial property for HNIs: depreciation benefits, indexation on long-term capital gains, and rental income as deductible business expense where applicable.",
    ],
    comparisonTable: [
      { label: "Return evidence", a: "Use verified rent, costs, and comparable transactions", b: "Use the chosen instrument's dated price and income records" },
      { label: "Income generation", a: "Monthly rental income", b: "None (price appreciation only)" },
      { label: "Liquidity", a: "60–180 days exit", b: "Immediate — hours" },
      { label: "Minimum investment", a: "₹50L–₹2 Cr (strata office)", b: "Any amount" },
      { label: "Inflation hedge", a: "Strong (rentals escalate 10–15% every 3 yrs)", b: "Strong (global safe haven)" },
      { label: "Tax on gains", a: "LTCG 20% with indexation after 24 months", b: "LTCG 20% with indexation after 24 months" },
      { label: "Leverage available", a: "Yes — commercial mortgage at 8–10% p.a.", b: "Gold loan at 7–9% p.a." },
      { label: "Counterparty risk", a: "Tenant default risk", b: "None" },
      { label: "Storage/maintenance", a: "Annual maintenance charges", b: "Locker/ETF expense ratio" },
    ],
    sections: [
      {
        heading: "The Case for Commercial Property in Ahmedabad",
        body: [
          "Ahmedabad's commercial real estate market is structurally undersupplied relative to demand. Prahladnagar Corporate Road, CG Road, and the SG Highway corridor absorb Grade-A office demand from IT, pharma, and financial services firms — yet quality stock remains constrained. This supply-demand imbalance supports both rental pricing and capital values.",
          "Preleased commercial properties — where a tenant is already in occupation — offer the clearest income visibility. A well-located strata office unit on Prahladnagar Road preleased to a reputable NBFC or IT company at ₹70–90 per sq.ft. per month delivers a gross yield of 6–8% on current market values, with built-in 10–15% rental escalation clauses every 33–36 months.",
          "For PIKORUA's advisory clients, the more compelling commercial opportunity in 2026 is GIFT City — India's only International Financial Services Centre. With 400+ financial entities operational and GIFT IFSC-registered firms exempt from multiple direct taxes, the demand profile for Grade-A office space is qualitatively different from conventional commercial.",
        ],
      },
      {
        heading: "The Case for Gold as a Portfolio Anchor",
        body: [
          "Gold's 2024–2026 performance has been exceptional — driven by central bank accumulation, geopolitical risk premiums, and dollar-debasement concerns from US fiscal expansion. Domestic gold prices in India have risen ~22% in the 12 months to mid-2026, materially outperforming many real estate sub-segments.",
          "For investors with shorter time horizons (under 3 years) or who need to maintain liquidity for business operations, gold — particularly Sovereign Gold Bonds or gold ETFs — offers unmatched flexibility. There is no stamp duty, no maintenance cost, and no tenant risk.",
          "However, gold does not generate current income. An HNI who holds ₹2 Cr in gold earns nothing until they sell. The same capital in a preleased Prahladnagar office unit generates ₹10–13L per annum in rental income — income that can be reinvested or used for living expenses.",
        ],
      },
      {
        heading: "PIKORUA's Portfolio Perspective",
        body: [
          "The more productive framing for Ahmedabad's HNI investors is not 'either/or' but 'what allocation at what life stage'. We consistently advise clients to treat gold as a portfolio ballast (10–15% of net worth) and income-generating real estate — both commercial and luxury residential — as the wealth-building core.",
          "For first-time commercial property buyers in Ahmedabad, PIKORUA recommends beginning with a preleased strata unit in the ₹75L–₹1.5 Cr range before committing to larger whole-floor assets. This approach delivers immediate income while you develop the market knowledge to make larger commitments with confidence.",
        ],
      },
    ],
    faqs: [
      { question: "Is commercial property better than gold in Ahmedabad right now?", answer: "The comparison depends on the specific property, lease, gold instrument, costs, taxes, liquidity needs, and holding period. Review current terms and dated performance records for the assets being compared; neither option guarantees a return." },
      { question: "What is the minimum investment for commercial property in Ahmedabad?", answer: "Strata office units in Prahladnagar and CG Road corridors start at ₹50L–₹80L for 200–400 sq.ft. units. Whole-floor Grade-A commercial starts at ₹3–5 Cr. GIFT City office units command a premium, starting at ₹1.2 Cr for smaller configurations." },
      { question: "How is commercial property taxed vs gold in India?", answer: "Both attract 20% LTCG with indexation after the holding period (24 months for property, 24 months for gold post-2024 budget). Commercial property additionally generates rental income taxed as 'income from house property' with a 30% standard deduction. Gold held as SGB is tax-free on maturity if held to 8 years." },
    ],
    relatedListingHrefs: ["/p/prahladnagar/office-space", "/p/cg-road/office-space", "/p/gift-city/office-space", "/p/sg-highway/office-space/for-investment"],
    relatedHubSlugs: ["commercial-property-vs-fd", "preleased-property-guide", "gift-city-investment-guide"],
    marketSignals: ["Compare dated, like-for-like evidence for each asset.", "Include vacancy, lease terms, operating costs, taxes, and transaction costs.", "Review liquidity and risk against the buyer's time horizon."],
    publishedAt: "2026-07-21",
    category: "comparison",
  },
  {
    slug: "commercial-property-vs-fd",
    prefix: "compare",
    href: "/compare/commercial-property-vs-fd",
    title: "Commercial Property vs FD in Ahmedabad",
    description: "Comprehensive comparison of commercial real estate versus fixed deposits for Ahmedabad investors. Covers yield, risk, liquidity, and tax efficiency in the 2026 rate environment.",
    h1: "Commercial Property vs Fixed Deposit: The 2026 Yield Reality",
    eyebrow: "Investment Analysis · PIKORUA Advisory",
    intro: "Fixed deposits and commercial property differ in income terms, liquidity, operating demands, risk, and tax treatment. Compare current bank quotes with verified property rent and full ownership costs; rates and property cash flows vary, and neither headline figure is a total-return forecast." ,
    heroImage: H.maruti,
    keyTakeaways: [
      "A fixed deposit has stated interest terms, while property income depends on occupancy, lease terms, costs, and tenant performance. Property sale value may rise or fall; compare full cash flows and risks over the same period.",
      "FDs are fully liquid and DICGC-insured up to ₹5L per bank. Commercial property requires 60–180 days to exit and has no insurance. Liquidity premium is real.",
      "Tax treatment significantly favours FDs for investors in lower tax brackets; commercial property wins for HNIs with ₹30L+ taxable income due to depreciation and indexation benefits.",
    ],
    comparisonTable: [
      { label: "Income input", a: "Verify rent, occupancy, and ownership costs", b: "Use the bank's current quote and product terms" },
      { label: "Value at exit", a: "Market-dependent; sale value is not assured", b: "Subject to deposit terms and applicable protections" },
      { label: "Return estimate", a: "Depends on verified income, costs, and exit value", b: "Based on stated interest terms, before tax" },
      { label: "Liquidity", a: "60–180 day exit", b: "Immediate (premature penalty)" },
      { label: "Safety", a: "No insurance; tenant risk", b: "DICGC insured to ₹5L" },
      { label: "Tax (30% bracket)", a: "Rental income + 20% LTCG with indexation", b: "30% on interest (TDS 10% on ₹40K+)" },
      { label: "Inflation protection", a: "Strong — rent escalates", b: "Weak — real return ~2–3%" },
      { label: "Leverage", a: "Commercial loan 8–10% p.a.", b: "FD-backed loan at 0.5–1% above FD rate" },
    ],
    sections: [
      {
        heading: "Why FDs Made Sense — And Why the Calculus Has Shifted",
        body: [
          "When comparing a fixed deposit with commercial property, use the bank's rate and lock-in terms for the relevant date. Property also involves vacancy, tenant, operating, financing, and resale risks that a deposit comparison should account for.",
          "Bank rates change over time. Check the current product quote and calculate the after-tax result for the investor's circumstances; do not rely on a historic rate or assumed tax bracket as a current offer.",
        ],
      },
      {
        heading: "The Commercial Property Yield Stack in Ahmedabad",
        body: [
          "PIKORUA tracks active commercial transactions across Prahladnagar, CG Road, SG Highway, and GIFT City. Estimate property income from verified lease documents and comparable transactions. Deduct vacancy, maintenance, property charges, financing, taxes, and transaction costs using inputs relevant to the specific asset and investor; seek qualified tax advice.",
          "Lease terms vary by contract and tenant. Verify the registered lease, escalation clause, break options, and renewal conditions; future rent and deposit rates are not guaranteed.",
          "Do not assume annual appreciation when comparing alternatives. Model several property exit-price scenarios alongside verified rent, vacancy, ownership costs, taxes, and the deposit's stated terms, and show the assumptions explicitly.",
        ],
      },
      {
        heading: "Who Should Choose Which",
        body: [
          "FD remains the right choice for: capital with a defined deployment date within 12–36 months; investors who cannot absorb tenant vacancy risk; NRIs who want passive, hassle-free India exposure without property management complexity.",
          "Commercial property wins for: investors with ₹75L+ available without near-term liquidity needs; HNIs in the 30% tax bracket seeking depreciation benefits; investors who want Ahmedabad market exposure without the residential price premium; NRIs seeking FEMA-compliant India income with professional management.",
          "PIKORUA's advisory model includes tenant sourcing, lease management, and exit planning — eliminating the management overhead that often makes commercial property unattractive to busy investors.",
        ],
      },
    ],
    faqs: [
      { question: "Is commercial real estate safer than FD in India?", answer: "FDs are insured (DICGC up to ₹5L per bank) and highly liquid — making them structurally safer in a financial-risk sense. Commercial property has no insurance, has tenant/vacancy risk, and requires 60–180 days to exit. However, commercial property's total returns (12–18% p.a.) dwarf FD returns (6.5–7%) over 5–10 year horizons." },
      { question: "What is the minimum commercial property investment in Ahmedabad?", answer: "Strata office units start at ₹50–80L for 200–400 sq.ft. in Prahladnagar and SG Highway. Preleased units with secured tenants typically carry a 10–15% premium over vacant units. PIKORUA can identify off-market preleased inventory at competitive yield entry points." },
      { question: "How are FD interest and commercial property rent taxed differently?", answer: "FD interest is taxed at slab rate (up to 30% for HNIs) with TDS at 10%. Commercial property rental income is taxed as income from house property with a 30% standard deduction — effective tax is lower. Additionally, commercial property gains after 24 months attract 20% LTCG with indexation — far more tax-efficient than FD interest for HNIs." },
    ],
    relatedListingHrefs: ["/p/prahladnagar/office-space/for-investment", "/p/gift-city/office-space", "/p/sg-highway/office-space/high-roi", "/p/cg-road/retail-space"],
    relatedHubSlugs: ["commercial-property-vs-gold", "preleased-property-guide", "high-roi-commercial-property-ahmedabad"],
    marketSignals: ["SBI 3-year FD rate: 6.7% (June 2026).", "Prahladnagar Grade-A office gross yield: 7.2–8.1%.", "GIFT City office gross yield: 6.2–7.0%."],
    publishedAt: "2026-07-21",
    category: "comparison",
  },
  {
    slug: "luxury-flats-vs-villas-ahmedabad",
    prefix: "compare",
    href: "/compare/luxury-flats-vs-villas-ahmedabad",
    title: "Luxury Flats vs Villas in Ahmedabad",
    description: "Expert comparison of luxury apartments versus independent villas in Ahmedabad. Covers appreciation, maintenance, privacy, rental yield, and lifestyle fit for self-use and investment buyers.",
    h1: "Luxury Flats vs Villas in Ahmedabad: A 2026 Buyer's Guide",
    eyebrow: "Residential Advisory · PIKORUA Realty",
    intro: "The luxury flat versus villa debate is the defining choice for Ahmedabad's premium residential buyers. Both formats have delivered strong capital appreciation in western corridors over the past decade — but their risk profiles, lifestyle implications, and investment characteristics differ significantly. PIKORUA's advisory team has guided 200+ transactions across both formats. Here is what we have learned.",
    heroImage: H.sindhu,
    keyTakeaways: [
      "Luxury flats in western Ahmedabad (Bodakdev, Thaltej, Iscon Ambli Road) have outperformed villas on a per-sq.ft. appreciation basis over 2020–2026 — driven by scarcity of quality high-rise supply in prime locations.",
      "Villas offer land-backed asset ownership, superior privacy, and customisation — but require higher maintenance, stronger self-management, and typically carry lower rental yields than apartments in the same corridor.",
      "For self-use buyers with a family focus, villas in Shela and Ambli provide exceptional lifestyle at 20–35% lower per-sq.ft. cost than equivalent Bodakdev apartments. For investment-first buyers, luxury apartments deliver better liquidity and rental management.",
    ],
    comparisonTable: [
      { label: "Per sq.ft. price (prime western)", a: "₹7,000–₹15,000", b: "₹5,000–₹9,000" },
      { label: "5-year appreciation (2020–2025)", a: "72–95%", b: "55–80%" },
      { label: "Rental yield", a: "2.5–4.5%", b: "1.5–3.0%" },
      { label: "Maintenance effort", a: "Society-managed, low effort", b: "Self-managed, higher effort" },
      { label: "Privacy", a: "Shared building, managed access", b: "Complete independence" },
      { label: "Customisation", a: "Limited to interior", b: "Full — interiors + exterior + garden" },
      { label: "Resale liquidity", a: "Faster — broader buyer pool", b: "Slower — specific buyer profile" },
      { label: "Security", a: "24x7 society security, CCTV", b: "Self-arranged or gated community" },
      { label: "Amenities", a: "Pool, gym, club — shared", b: "Private if built; fewer standard amenities" },
    ],
    sections: [
      {
        heading: "Why Luxury Flats Have Outperformed in Ahmedabad's Prime Corridors",
        body: [
          "Sindhubhavan Road, Iscon Ambli Road, and Bodakdev have witnessed the steepest luxury apartment appreciation in Ahmedabad's history — driven by a combination of supply scarcity, NRI demand, and institutional buyer accumulation. Premium 4 BHK apartments on Sindhubhavan Road that transacted at ₹7,500–₹8,000 per sq.ft. in 2020 now command ₹13,000–₹15,000 — an 80% uplift in five years.",
          "The structural driver is simple: building 50 high-quality luxury apartments on a 2-acre Bodakdev plot is economically viable; building 50 independent villas on the same land is not. The apartment format allows developers to deliver premium amenity infrastructure (club, pool, concierge) that self-contained villas cannot match at equivalent land cost. This amenity premium sustains apartment values above villa values in the same zip code.",
        ],
      },
      {
        heading: "The Enduring Case for Villas in Ahmedabad",
        body: [
          "Villas serve a fundamentally different buyer. The Ahmedabad joint-family structure — three generations sharing a home, with separate kitchens and living spaces — is practically impossible in even a 5 BHK apartment. Villa formats, particularly 5,000–8,000 sq.ft. independent bungalows in Ambli, Shela, and Shilaj, address this structural demand that apartments never will.",
          "Land appreciation in western Ahmedabad's villa corridors has been strong, even if per-sq.ft. construction values lag apartments. A 500 sq.yard plot in Shela purchased in 2018 for ₹1.8 Cr now commands ₹4.5–5.5 Cr — an appreciation that reflects land scarcity rather than construction quality.",
          "For NRI buyers specifically, an independent villa or gated community bungalow in Ambli Road serves a different purpose than an apartment: it is the family's India anchor point, maintained and managed by extended family, and not primarily an income investment. PIKORUA's NRI advisory team regularly sources these for families who have not visited in 5–10 years and need full transaction-to-possession support.",
        ],
      },
      {
        heading: "PIKORUA's Recommendation Framework",
        body: [
          "Choose a luxury flat if: you want the best per-sq.ft. appreciation in a prime corridor, you have NRI management constraints (apartments are easier to manage remotely), or you want immediate rental income without self-management.",
          "Choose a villa if: you have a joint-family requirement, you value land ownership as an asset category, you are buying for extended personal use rather than investment, or you want the customisation freedom that apartment rules prohibit.",
          "PIKORUA maintains curated access to both categories. Our advisory process begins with a needs mapping call — not a listing presentation — to ensure you see only the format that genuinely fits your 10-year horizon.",
        ],
      },
    ],
    faqs: [
      { question: "Which is better — luxury flat or villa in Ahmedabad?", answer: "For investment-first buyers, luxury flats in Bodakdev, Thaltej, and Sindhubhavan Road have delivered stronger per-sq.ft. appreciation and better rental management. For self-use families (especially joint families), independent villas in Ambli, Shela, and Shilaj provide better lifestyle fit. PIKORUA advises based on your specific horizon and family structure." },
      { question: "What is the price difference between luxury flats and villas in Ahmedabad?", answer: "In western Ahmedabad, luxury apartments range from ₹7,000–₹15,000 per sq.ft. Villas and independent bungalows range from ₹5,000–₹9,000 per sq.ft. of construction — plus land cost separately. Total villa outlay is often comparable or higher than apartments due to larger footprints." },
      { question: "Are villas harder to sell than flats in Ahmedabad?", answer: "Yes — villas have a narrower buyer profile (joint families, lifestyle buyers, HNIs with specific requirements) and take longer to exit (90–180 days vs. 45–90 days for apartments). Apartments in prime corridors have a deeper buyer pool and faster exit velocity, which matters for investment-focused buyers." },
    ],
    relatedListingHrefs: ["/p/bodakdev/luxury-flats", "/p/shela/villas", "/p/ambli/villas", "/p/sindhubhavan-road/luxury-flats/4-bhk", "/p/iscon-ambli-road/penthouses"],
    relatedHubSlugs: ["new-launch-vs-resale-ahmedabad", "under-construction-vs-ready-to-move", "thaltej-investment-guide"],
    marketSignals: ["Sindhubhavan Road 4 BHK: ₹13,000–₹15,000/sq.ft. (mid-2026).", "Shela villa land: ₹4,500–₹5,500/sq.yd.", "Western Ahmedabad apartment rental yield: 2.5–4.5%."],
    publishedAt: "2026-07-21",
    category: "comparison",
  },
  {
    slug: "new-launch-vs-resale-ahmedabad",
    prefix: "compare",
    href: "/compare/new-launch-vs-resale-ahmedabad",
    title: "New Launch vs Resale Property in Ahmedabad 2026 | PIKORUA Realty",
    description: "Should you buy a new launch or resale luxury property in Ahmedabad? PIKORUA's advisory comparison covers pricing, risk, customisation, and which suits self-use vs investment.",
    h1: "New Launch vs Resale Property in Ahmedabad — Which is Right for You?",
    eyebrow: "Residential Advisory · PIKORUA Realty",
    intro: "New launches in Ahmedabad's luxury segment carry alluring entry pricing and customisation flexibility — but introduce 24–48 month delivery risk. Resale properties offer immediate possession and known quality but command a premium. Understanding this trade-off is central to making the right buying decision in 2026's market.",
    heroImage: H.kalrav,
    keyTakeaways: [
      "New launch pricing in Ahmedabad is typically 15–25% below comparable ready-possession resale — but this discount is earned by carrying 24–48 months of delivery risk and opportunity cost of locked capital.",
      "Resale luxury properties on Sindhubhavan Road and Bodakdev trade at a 10–20% premium to comparable new launches — but deliver immediate possession, known society quality, and zero builder execution risk.",
      "For NRI buyers, resale is structurally superior: no construction monitoring required, immediate rental income possible, and no FEMA complexity around stage-wise payment to developer accounts.",
    ],
    comparisonTable: [
      { label: "Entry price vs market", a: "15–25% below resale comparable", b: "Market rate — no launch discount" },
      { label: "Possession timeline", a: "24–48 months typically", b: "Immediate" },
      { label: "Builder risk", a: "Execution, quality, delay risk", b: "Zero — building exists" },
      { label: "Customisation", a: "Floor plan, finish selection possible", b: "Limited to interior renovation" },
      { label: "RERA protection", a: "Full RERA protection on new projects", b: "Not applicable (building complete)" },
      { label: "Rental income", a: "Zero during construction", b: "Immediate rental possible" },
      { label: "Society quality known?", a: "Unknown until possession", b: "Fully known — visit and verify" },
      { label: "Bank loan", a: "Available — disbursed in stages", b: "Available — single disbursement" },
    ],
    sections: [
      {
        heading: "The New Launch Calculus in Ahmedabad's Luxury Segment",
        body: [
          "Ahmedabad's luxury new launch market in 2026 is dominated by a handful of credible developers — Adani Realty, Godrej Properties, Shivalik Group, and select boutique developers with 10+ year track records. PIKORUA restricts its new launch advisory to projects from developers who have delivered at least two comparable projects on schedule.",
          "The pricing discount on new launches is real — but so is the time value cost. ₹3 Cr locked in a 36-month under-construction project has an opportunity cost of ₹60–90L in foregone FD interest or alternative deployment. The effective discount, net of opportunity cost, often narrows to 8–12%.",
        ],
      },
      {
        heading: "Why Resale Dominates PIKORUA's Client Portfolio",
        body: [
          "The majority of PIKORUA's transaction volume is resale — and this reflects our client profile. HNI buyers with clear needs (school catchment, club access, specific floor, specific tower) cannot define those requirements against an unbuilt building. Resale allows verification: walk the floor, meet the society committee, assess the maintenance quality, observe the parking design.",
          "Premium resale luxury properties in Bodakdev and Sindhubhavan Road have demonstrated exceptional hold value — appreciating 12–18% in the 12 months after a buyer takes possession in several tracked transactions. The ready-possession premium paid at purchase is often recovered within 18 months of ownership.",
        ],
      },
    ],
    faqs: [
      { question: "Is a new launch or resale property better in Ahmedabad?", answer: "New launches offer 15–25% lower entry pricing but carry 24–48 months of delivery risk and zero rental income during construction. Resale offers immediate possession, known quality, and immediate rental income at a 10–20% premium. NRIs and investors seeking income favour resale; budget-conscious self-use buyers may prefer new launches from credible developers." },
      { question: "What is the risk of buying an under-construction property in Ahmedabad?", answer: "Key risks include construction delays (RERA mandates compensation at 6% p.a. for delays), builder insolvency (NCLT proceedings have affected several mid-tier developers), quality shortfall vs. brochure, and society composition risk. PIKORUA's advisory covers builder due diligence to mitigate these." },
    ],
    relatedListingHrefs: ["/p/bodakdev/luxury-flats", "/p/sindhubhavan-road/luxury-flats", "/p/thaltej/luxury-flats/ready-to-move", "/p/thaltej/luxury-flats/new-launch"],
    relatedHubSlugs: ["under-construction-vs-ready-to-move", "luxury-flats-vs-villas-ahmedabad", "rera-gujarat-guide"],
    marketSignals: ["Ahmedabad new launch premium segment: 340 units launched Q1 2026.", "Average delivery delay in premium segment: 8 months (2020–2025 data).", "Bodakdev resale premium: 18% over comparable new launch."],
    publishedAt: "2026-07-21",
    category: "comparison",
  },
  {
    slug: "under-construction-vs-ready-to-move",
    prefix: "compare",
    href: "/compare/under-construction-vs-ready-to-move",
    title: "Under Construction vs Ready to Move (Ahmedabad)",
    description: "Detailed comparison of under-construction vs ready-to-move luxury properties in Ahmedabad. Covers GST, EMI timing, risk, NRI suitability, and the right choice for 2026 buyers.",
    h1: "Under Construction vs Ready to Move: Which Luxury Property to Buy in Ahmedabad",
    eyebrow: "Buyer's Guide · PIKORUA Advisory",
    intro: "The choice between under-construction and ready-to-move properties involves one consideration that most buyers underweight: GST. Under-construction properties attract 5% GST (luxury segment without input tax credit); ready-to-move properties with completion certificates attract zero GST. In a ₹3 Cr transaction, that is ₹15L — a material number that changes the effective discount on new launches.",
    heroImage: H.anurita,
    keyTakeaways: [
      "Under-construction properties attract 5% GST; ready-to-move properties with completion certificates attract 0% GST — a ₹15L difference on a ₹3 Cr purchase that narrows the price advantage of new launches.",
      "Home loan EMI begins immediately on under-construction disbursement — meaning you pay both EMI and rent simultaneously during construction. Ready-to-move eliminates this double-cost period.",
      "For NRI buyers, ready-to-move is strongly preferred: no construction monitoring required, immediate possession, and FEMA-compliant payment from NRE/NRO account in a single tranche.",
    ],
    comparisonTable: [
      { label: "GST applicability", a: "5% GST on base price", b: "0% GST (with OC/CC)" },
      { label: "EMI starts", a: "On each loan disbursement (pre-EMI or full)", b: "On full disbursement — immediate possession" },
      { label: "Rent + EMI overlap", a: "24–48 months of double payment", b: "None — move in immediately" },
      { label: "Price discount vs ready", a: "15–25% before GST; 10–20% after GST", b: "Benchmark price" },
      { label: "Quality risk", a: "Final quality unknown", b: "Inspect before purchase" },
      { label: "NRI suitability", a: "Requires construction monitoring", b: "Immediate — no monitoring needed" },
    ],
    sections: [
      {
        heading: "The GST Factor Most Buyers Miss",
        body: [
          "India's GST regime treats under-construction residential properties as a taxable supply. The applicable rate for affordable housing is 1% and for other residential properties 5% — without input tax credit. On a ₹2.5 Cr luxury apartment, 5% GST adds ₹12.5L to the outflow. This is not reflected in the advertised 'agreement value' but is payable at registration.",
          "Ready-to-move properties with Occupancy Certificate (OC) or Completion Certificate (CC) are categorically exempt from GST. This means a ₹2.5 Cr ready-to-move apartment has no GST liability — making the real effective price difference with an under-construction option smaller than the headline discount suggests.",
        ],
      },
      {
        heading: "PIKORUA's View for 2026 Buyers",
        body: [
          "In the current market, we see a clear dichotomy: ready-to-move inventory in prime western Ahmedabad (Sindhubhavan Road, Bodakdev, Iscon Ambli Road) is tight — fewer than 50 genuine luxury units available across these corridors at any time. Under-construction supply is more abundant, but from developers of varying credibility.",
          "For self-use buyers who are currently renting, ready-to-move is almost always the right choice — the rent + EMI double burden during construction typically costs more than the GST saving on a new launch. For pure investors with no housing urgency, a credible developer's new launch in a supply-constrained corridor (like Iscon Ambli Road) can still deliver superior IRR despite GST.",
        ],
      },
    ],
    faqs: [
      { question: "Is GST applicable on ready-to-move property in Ahmedabad?", answer: "No. Ready-to-move properties with an Occupancy Certificate (OC) or Completion Certificate (CC) are exempt from GST under Indian law. Only under-construction properties attract GST — at 5% for regular residential and 1% for affordable housing. Always verify OC/CC status before purchase." },
      { question: "Which is better for NRIs — under construction or ready to move in Ahmedabad?", answer: "Ready-to-move is strongly preferred for NRIs. Under-construction requires construction monitoring (which NRIs typically cannot do remotely), involves stage-wise FEMA-compliant payments, and carries delivery risk. Ready-to-move allows immediate possession, immediate rental income, and FEMA-compliant payment in a single structured tranche." },
    ],
    relatedListingHrefs: ["/p/thaltej/luxury-flats/ready-to-move", "/p/bodakdev/luxury-flats/ready-to-move", "/p/sindhubhavan-road/luxury-flats", "/p/iscon-ambli-road/luxury-flats/new-launch"],
    relatedHubSlugs: ["new-launch-vs-resale-ahmedabad", "how-to-buy-property-as-nri-ahmedabad", "rera-gujarat-guide"],
    marketSignals: ["Ready-to-move luxury inventory in western Ahmedabad: <50 units (mid-2026).", "Under-construction Ahmedabad luxury: 340+ units across 12 projects.", "GST on under-construction: 5% of agreement value."],
    publishedAt: "2026-07-21",
    category: "comparison",
  },
  {
    slug: "thaltej-vs-bodakdev-investment",
    prefix: "compare",
    href: "/compare/thaltej-vs-bodakdev-investment",
    title: "Thaltej vs Bodakdev Property Investment",
    description: "Expert comparison of Thaltej and Bodakdev as luxury residential investment destinations in Ahmedabad. Covers pricing, appreciation, rental yield, and buyer profiles.",
    h1: "Thaltej vs Bodakdev: Which Location Wins for Luxury Property Investment?",
    eyebrow: "Location Analysis · PIKORUA Advisory",
    intro: "Thaltej and Bodakdev are the two most actively transacted luxury residential corridors in Ahmedabad's western belt — separated by 3 km and a meaningful price gap. Bodakdev carries the established premium of Karnavati Club proximity and mature social infrastructure; Thaltej offers better value, stronger rental yield, and access to both SG Highway and Science City employment zones. Here is how to choose between them.",
    heroImage: H.capstone,
    keyTakeaways: [
      "Bodakdev commands a 20–30% per-sq.ft. premium over comparable Thaltej properties, driven by Karnavati Club proximity and mature lifestyle infrastructure. This premium has compressed over 2024–2026 as Thaltej's connectivity improved.",
      "Thaltej delivers superior rental yield (3.2–4.5% vs Bodakdev's 2.5–3.5%) due to proximity to Science City and SG Highway employment clusters — making it the better income investment.",
      "Bodakdev is the stronger self-use choice for families prioritising school catchment (Udgam, Anand Niketan) and social infrastructure; Thaltej is the stronger investment choice for yield-focused buyers.",
    ],
    comparisonTable: [
      { label: "Price range", a: "₹6,500–₹11,000/sq.ft.", b: "₹7,000–₹13,000/sq.ft." },
      { label: "5-year appreciation (2020–25)", a: "78–88%", b: "65–80%" },
      { label: "Rental yield", a: "3.2–4.5%", b: "2.5–3.5%" },
      { label: "Karnavati Club access", a: "5–8 min drive", b: "2–3 min drive" },
      { label: "SG Highway", a: "2 min", b: "8–10 min" },
      { label: "Metro access", a: "Thaltej Metro Station (operational)", b: "Under planning" },
      { label: "School catchment", a: "Prakash HS, Udgam", b: "Udgam, Anand Niketan, DPS" },
      { label: "Supply (active listings)", a: "Higher — more towers", b: "Lower — constrained supply" },
    ],
    sections: [
      {
        heading: "Bodakdev: Ahmedabad's Established Luxury Address",
        body: [
          "Bodakdev's premium is anchored by Karnavati Club — Ahmedabad's most prestigious private members' club, whose catchment defines the residential desirability of a 2 km radius. Properties within Karnavati Club's walking catchment command a club-proximity premium of 12–18% over equivalent Bodakdev properties further north.",
          "The supply constraint in Bodakdev is structural. Most of the prime land parcels adjacent to Karnavati Club have been built upon — meaning new luxury supply must come from redevelopment or northern Bodakdev, which carries a lower lifestyle premium. This constrained supply supports price resilience in Bodakdev's premium sub-segment.",
        ],
      },
      {
        heading: "Thaltej: The Value-Plus-Yield Case",
        body: [
          "Thaltej's 2020–2026 price trajectory has been Ahmedabad's strongest in the upper-mid luxury segment. Metro connectivity (Thaltej Metro Station, BRTS integration) and dual employment access (SG Highway tech parks, Science City pharma cluster) have structurally upgraded its rental demand. Corporate executives who cannot afford Bodakdev pricing increasingly choose Thaltej — deepening the tenant pool.",
          "PIKORUA's rental data across managed properties in Thaltej shows 3 BHK luxury apartments (2,200–2,800 sq.ft.) commanding ₹50,000–₹80,000 per month, versus comparable Bodakdev 3 BHKs at ₹60,000–₹90,000. The absolute rent is lower in Thaltej — but so is the purchase price, resulting in a superior yield ratio.",
        ],
      },
    ],
    faqs: [
      { question: "Which is better for investment — Thaltej or Bodakdev in Ahmedabad?", answer: "For yield-focused investors, Thaltej delivers superior rental returns (3.2–4.5% vs 2.5–3.5%) at lower entry prices. For long-term capital appreciation with constrained supply, Bodakdev's proximity to Karnavati Club supports stronger price resilience. Most PIKORUA clients with a 7+ year horizon choose Bodakdev; yield-focused investors choose Thaltej." },
      { question: "What is the price difference between Thaltej and Bodakdev?", answer: "Bodakdev commands a 20–30% per-sq.ft. premium over comparable Thaltej properties. A 3 BHK in Thaltej might cost ₹1.8–2.5 Cr; a comparable 3 BHK in prime Bodakdev costs ₹2.2–3.2 Cr. This gap has narrowed over 2024–2026 as Thaltej's infrastructure improved." },
    ],
    relatedListingHrefs: ["/p/thaltej/luxury-flats", "/p/bodakdev/luxury-flats", "/p/thaltej/luxury-flats/4-bhk", "/p/bodakdev/luxury-flats/for-investment"],
    relatedHubSlugs: ["thaltej-investment-guide", "luxury-flats-vs-villas-ahmedabad", "sg-highway-vs-iscon-ambli-road"],
    marketSignals: ["Thaltej 3 BHK luxury: ₹1.8–2.5 Cr (mid-2026).", "Bodakdev 3 BHK luxury: ₹2.2–3.2 Cr.", "Thaltej rental yield: 3.2–4.5%."],
    publishedAt: "2026-07-21",
    category: "comparison",
  },
  {
    slug: "sg-highway-vs-iscon-ambli-road",
    prefix: "compare",
    href: "/compare/sg-highway-vs-iscon-ambli-road",
    title: "SG Highway vs Iscon-Ambli Road Property",
    description: "Comparing Ahmedabad's two premium western corridors for luxury property investment — SG Highway and Iscon Ambli Road. Which delivers better returns in 2026?",
    h1: "SG Highway vs Iscon Ambli Road: Ahmedabad's Two Premium Corridors Compared",
    eyebrow: "Location Analysis · PIKORUA Advisory",
    intro: "SG Highway and Iscon Ambli Road represent two distinct investment theses in western Ahmedabad. SG Highway is Ahmedabad's connectivity spine — an 8 km arterial linking the airport, GIFT City, and Gandhinagar with the city's corporate clusters. Iscon Ambli Road is Ahmedabad's most exclusive residential address — a 2 km corridor of ultra-premium towers with the highest per-sq.ft. values in the city. Here is how they compare for luxury property buyers in 2026.",
    heroImage: H.maruti,
    keyTakeaways: [
      "Iscon Ambli Road commands Ahmedabad's highest luxury residential pricing — ₹11,000–₹15,000 per sq.ft. — driven by extreme supply scarcity and sustained NRI demand. Appreciation here outperforms SG Highway on a per-sq.ft. basis.",
      "SG Highway delivers the strongest rental yield of any western corridor (3.5–5% gross) driven by GIFT City commuter demand, corporate cluster proximity, and airport convenience. It is the superior income investment.",
      "NRI buyers disproportionately prefer Iscon Ambli Road for prestige and asset quality. Domestic HNI investors increasingly choose SG Highway for yield and GIFT City exposure.",
    ],
    comparisonTable: [
      { label: "Price range (luxury)", a: "₹5,500–₹10,000/sq.ft.", b: "₹11,000–₹15,000/sq.ft." },
      { label: "5-year appreciation", a: "65–82%", b: "85–110%" },
      { label: "Rental yield", a: "3.5–5.0%", b: "2.0–3.0%" },
      { label: "GIFT City commute", a: "12–18 min", b: "25–35 min" },
      { label: "Airport access", a: "8–12 min", b: "20–28 min" },
      { label: "Supply level", a: "Moderate — multiple towers", b: "Ultra-scarce — <5 active projects" },
      { label: "NRI buyer share", a: "35–40%", b: "55–65%" },
    ],
    sections: [
      {
        heading: "Iscon Ambli Road: Ahmedabad's Trophy Address",
        body: [
          "Iscon Ambli Road's rise to Ahmedabad's premier luxury address has been deliberate and structural. The corridor sits at the intersection of western lifestyle infrastructure (ISKCON temple, premium dining, luxury retail) and proximity to the city's best schools and clubs. Development is strictly premium — no affordable housing, no mid-market towers, no compromise.",
          "The supply scarcity is intentional. Fewer than 5 active luxury projects are under construction on Iscon Ambli Road at any given time, and completed inventory turns over slowly. This scarcity dynamic — combined with deep NRI demand from the US, UK, and UAE diaspora — has powered price appreciation that outperforms every other Ahmedabad corridor over a 10-year horizon.",
        ],
      },
      {
        heading: "SG Highway: Ahmedabad's Best Yield Corridor",
        body: [
          "The GIFT City employment multiplier is the defining force in SG Highway's rental market. With 400+ financial entities operational in GIFT City and 25,000+ professionals commuting daily from Ahmedabad, SG Highway is the natural residential address for the IFSC workforce. PIKORUA's managed properties on SG Highway consistently achieve 3.5–5% gross yield — the highest of any western Ahmedabad corridor.",
          "The investment thesis here is straightforward: buy quality at entry, lease to GIFT City or airport-adjacent corporate tenants, benefit from 10–15% rental escalation every 3 years, and hold for 7–10 years while GIFT City's employment base scales from 25,000 to a projected 75,000+ professionals. The capital appreciation may not match Iscon Ambli Road, but the income-adjusted return is highly competitive.",
        ],
      },
    ],
    faqs: [
      { question: "Which has better investment returns — SG Highway or Iscon Ambli Road?", answer: "Iscon Ambli Road delivers superior capital appreciation (85–110% over 5 years vs SG Highway's 65–82%) due to extreme scarcity and NRI demand. SG Highway delivers superior rental yield (3.5–5% vs 2–3%) due to GIFT City and airport corporate demand. For income investors, SG Highway wins. For pure capital appreciation, Iscon Ambli Road wins." },
      { question: "What is the price range for luxury flats on SG Highway Ahmedabad?", answer: "Luxury apartments on SG Highway range from ₹5,500–₹10,000 per sq.ft. A 3 BHK (2,200 sq.ft.) costs ₹1.4–2.4 Cr; a 4 BHK (3,000 sq.ft.) ranges ₹1.8–3.2 Cr. Premium towers with GIFT City views or airport proximity command the higher end of this range." },
    ],
    relatedListingHrefs: ["/p/sg-highway/luxury-flats", "/p/iscon-ambli-road/luxury-flats", "/p/sg-highway/luxury-flats/for-investment", "/p/iscon-ambli-road/penthouses"],
    relatedHubSlugs: ["thaltej-vs-bodakdev-investment", "gift-city-investment-guide", "nri-property-investment-guide-ahmedabad"],
    marketSignals: ["Iscon Ambli Road: ₹11,000–₹15,000/sq.ft. (mid-2026).", "SG Highway gross yield: 3.5–5.0%.", "GIFT City daily commuter workforce: 25,000+ professionals."],
    publishedAt: "2026-07-21",
    category: "comparison",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// INVESTMENT PAGES — /invest/[slug]
// ─────────────────────────────────────────────────────────────────────────────

export const INVESTMENT_PAGES: ContentHubPage[] = [
  {
    slug: "high-roi-luxury-property-ahmedabad",
    prefix: "invest",
    href: "/invest/high-roi-luxury-property-ahmedabad",
    title: "High ROI Luxury Property in Ahmedabad | PIKORUA",
    description: "PIKORUA's analysis of the highest ROI luxury property opportunities in Ahmedabad for 2026. Covers corridors, configurations, and strategies for HNI and NRI investors.",
    h1: "Highest ROI Luxury Property Investments in Ahmedabad — 2026 Analysis",
    eyebrow: "Investment Advisory · PIKORUA Realty",
    intro: "Return on investment in Ahmedabad's luxury residential market is not uniform across corridors, configurations, or entry timing. Over 2020–2026, the top quartile of luxury transactions delivered 18–24% annualised total return (appreciation + yield); the bottom quartile delivered 7–10%. The difference was not luck — it was location selection, configuration choice, and developer quality. Here is what PIKORUA has observed across 200+ transactions.",
    heroImage: H.capstone,
    keyTakeaways: [
      "The highest-ROI luxury configuration in Ahmedabad across 2020–2026 was 4 BHK apartments on Sindhubhavan Road and Iscon Ambli Road — delivering 85–110% capital appreciation plus 2.5–3.5% annual rental yield.",
      "Micro-location matters more than corridor: within Thaltej, properties within 500m of Thaltej Metro Station delivered 15–20% higher appreciation than those 1.5 km away.",
      "Developer quality is the most underweighted ROI factor: buildings by top-5 Ahmedabad developers resell 25–35% faster and at 10–18% premium over comparable buildings by mid-tier developers.",
    ],
    sections: [
      {
        heading: "The Highest-Performing Corridors, 2020–2026",
        body: [
          "PIKORUA's transaction data across 200+ deals identifies Iscon Ambli Road as Ahmedabad's top-performing luxury corridor for capital appreciation — with 4 BHK apartments delivering median appreciation of 95% over 5 years. This is driven by structural supply scarcity (fewer than 50 quality luxury units launched annually on this corridor), deep NRI demand, and premium developer participation only.",
          "Sindhubhavan Road ranks second at 78–88% appreciation — reflecting the mature premium of Karnavati Club proximity, Rajpath Club access, and Ahmedabad's most recognised dining and lifestyle belt. Bodakdev and Thaltej follow at 65–80% and 72–88% respectively.",
        ],
      },
      {
        heading: "The Configuration Premium: Why 4 BHK Outperforms",
        body: [
          "In Ahmedabad's luxury segment, 4 BHK transactions command the deepest buyer pool and fastest resale velocity of any configuration. The typical luxury buyer household is a joint family or HNI couple with extended family requirements — 4 BHK serves this demographic more precisely than 3 BHK (too small for the profile) or 5 BHK (too large for most budgets).",
          "PIKORUA's secondary market data shows 4 BHK luxury apartments in Bodakdev and Thaltej reselling at a 12–18% premium per sq.ft. over 3 BHKs in the same building — a consistent, measurable premium that reflects configuration demand depth.",
          "The penthouse premium is the most extreme: genuine sky-level penthouses with private terraces on Iscon Ambli Road and Sindhubhavan Road command a 35–60% per-sq.ft. premium over standard 4 BHK units in the same tower. The scarcity is absolute — one or two per building — and the buyer demand is deep among ultra-HNI clients.",
        ],
      },
      {
        heading: "PIKORUA's 2026 High-ROI Investment Thesis",
        body: [
          "For 2026 entry, compare ready-possession homes, new launches and preleased commercial units using property-specific evidence. Check current asking and lease terms, title and RERA status, developer delivery history, vacancy, tenant covenants, all-in costs and resale depth. Planned employment or infrastructure changes can be delayed and do not establish future prices or rents.",
          "Avoid choosing a corridor from past appreciation alone. In Shela and other growth areas, test the current supply pipeline, access, holding costs and likely resale audience; do not rely on a predicted date for a price increase.",
        ],
      },
    ],
    faqs: [
      { question: "What is the best area for high ROI property investment in Ahmedabad?", answer: "There is no corridor that guarantees the best return. Compare each shortlisted property's current price, recent comparable sales and leases, vacancy risk, maintenance and taxes, financing, and likely resale audience. Historical corridor results vary by building and do not predict a future return; PIKORUA can help compare a specific shortlist." },
      { question: "Is luxury property in Ahmedabad a good investment in 2026?", answer: "It depends on the specific property, purchase price, legal status, costs, liquidity needs and holding period. Infrastructure plans, NRI demand and price comparisons with other cities are not guarantees of future demand or value. Review current comparable transactions and leases, and assess downside and exit options before committing capital." },
      { question: "What return can I expect from luxury property in Ahmedabad?", answer: "No future return can be reliably stated from a corridor name alone. PIKORUA maintains internal transaction observations for selected prime-corridor properties, but those historical results are not representative of every property and do not forecast future performance. Ask for the sample definition, dates and calculation method before relying on those records; assess current rent, vacancy, costs and resale liquidity separately." },
    ],
    relatedListingHrefs: ["/p/iscon-ambli-road/luxury-flats/4-bhk/for-investment", "/p/sindhubhavan-road/penthouses/high-roi", "/p/thaltej/luxury-flats/4-bhk/high-roi", "/p/sg-highway/luxury-flats/for-investment"],
    relatedHubSlugs: ["thaltej-investment-guide", "sg-highway-vs-iscon-ambli-road", "nri-property-investment-guide-ahmedabad"],
    marketSignals: ["Iscon Ambli Road 5-yr appreciation: 85–110%.", "Top-corridor luxury total return 2020–2026: 12–22% p.a.", "4 BHK resale premium over 3 BHK in same building: 12–18%."],
    publishedAt: "2026-07-21",
    category: "investment",
  },
  {
    slug: "nri-property-investment-guide-ahmedabad",
    prefix: "invest",
    href: "/invest/nri-property-investment-guide-ahmedabad",
    title: "NRI Property Investment Guide — Ahmedabad 2026 | PIKORUA Realty",
    description: "Complete NRI property investment guide for Ahmedabad 2026. Covers FEMA compliance, NRE/NRO accounts, best corridors, repatriation, tax treatment, and PIKORUA's advisory process.",
    h1: "NRI Property Investment in Ahmedabad — The Complete 2026 Guide",
    eyebrow: "NRI Advisory · PIKORUA Realty",
    intro: "Ahmedabad has emerged as one of India's most active NRI real estate markets — driven by a large diaspora in the US, UK, UAE, Canada, and Australia with deep Gujarat roots. PIKORUA's NRI advisory handles the full spectrum: from FEMA-compliant payment structuring to Power of Attorney registration to post-possession rental management. This guide distils what we have learned across 80+ NRI transactions.",
    heroImage: H.sindhu,
    keyTakeaways: [
      "NRIs can purchase residential and commercial property in India without RBI approval under FEMA — but agricultural land, plantation property, and farmhouses are prohibited without specific exemptions.",
      "Payment must be routed through NRE, NRO, or FCNR accounts — foreign currency accounts or overseas wire transfers directly to developer accounts are not FEMA-compliant.",
      "Repatriation of principal and proceeds from a residential property sale is permitted subject to conditions: maximum 2 properties, held for 5 years or more, and routed through NRO account with Form 15CA/15CB.",
    ],
    sections: [
      {
        heading: "FEMA Compliance — What NRIs Can and Cannot Buy",
        body: [
          "Under FEMA (Foreign Exchange Management Act) read with RBI's Master Direction on Acquisition and Transfer of Immovable Property, NRIs (Non-Resident Indians holding Indian passport) and PIOs (Persons of Indian Origin) have broad rights to acquire residential and commercial property in India. No prior RBI approval is needed for standard residential purchases.",
          "Prohibited property types for NRIs without special RBI dispensation: agricultural land, plantation property, and farmhouses. All other residential and commercial categories — apartments, villas, penthouses, office space, retail units — are fully permissible.",
          "OCIs (Overseas Citizens of India) have rights equivalent to NRIs for property purchase purposes. Foreign nationals (without NRI/PIO/OCI status) require specific RBI approval and are restricted to residential property while residing in India.",
        ],
      },
      {
        heading: "Setting Up the Right Bank Accounts for Property Purchase",
        body: [
          "FEMA mandates that property purchase payments come from specific Indian accounts. The three permissible account types are: NRE (Non-Resident External) — rupee account funded from foreign earnings, fully repatriable; NRO (Non-Resident Ordinary) — rupee account, partially repatriable up to USD 1 million per financial year; and FCNR (Foreign Currency Non-Resident) — foreign currency account, fully repatriable.",
          "The choice of account matters for tax planning. Funds parked in NRE accounts earn interest that is tax-exempt in India. NRO account interest attracts 30% TDS. For property purchase, PIKORUA recommends NRE account as the primary payment route wherever possible.",
          "Home loans in India for NRI property purchases are available from major banks (SBI, HDFC, ICICI, Axis). Documentation requirements include overseas income proof (pay stubs, tax returns), employment letter, and NRE/NRO bank statements. LTV available is 75–80% of registered value — same as resident Indians.",
        ],
      },
      {
        heading: "PIKORUA's NRI Advisory Process",
        body: [
          "PIKORUA handles NRI transactions across six structured stages: (1) timezone-flexible briefing call to map requirements, budget, and family structure; (2) HD virtual walkthroughs of shortlisted properties; (3) legal and RERA due diligence by empanelled Gujarat law firms; (4) FEMA and banking flow setup with CA consultation; (5) Power of Attorney registration at Indian consulate/embassy for clients who cannot travel to India; (6) remote registration execution and snagging.",
          "The POA step is the most critical for NRIs: a registered, properly drafted POA allows a trusted India-based family member or PIKORUA's registered agent to execute the purchase registration, society membership, and possession formalities without the buyer needing to be present in India. PIKORUA drafts all POA documents to Indian Sub-Registrar standards.",
        ],
      },
      {
        heading: "Tax Treatment for NRI Property Buyers",
        body: [
          "TDS on property purchase: When an NRI sells property, the buyer must deduct 20% TDS on LTCG and 30% TDS on STCG at source. NRIs can apply to the Assessing Officer for a lower TDS deduction certificate under Section 197 before the transaction.",
          "Rental income: NRI rental income in India is taxed at slab rate. TDS is deducted at 30% at source by the tenant. The NRI must file an Indian tax return to claim the 30% standard deduction on rental income and offset the excess TDS.",
          "Double Tax Avoidance Agreements (DTAA): India has DTAA treaties with 90+ countries including the US, UK, UAE, Canada, and Australia. NRI investors can claim relief to avoid double taxation on the same income in both countries. PIKORUA partners with international tax advisory firms for clients who need cross-jurisdictional tax planning.",
        ],
      },
    ],
    faqs: [
      { question: "Can NRIs buy property in Ahmedabad?", answer: "Yes. NRIs (Indian passport holders residing abroad) and PIOs/OCIs can purchase residential and commercial property in Ahmedabad without RBI approval. Agricultural land, plantation property, and farmhouses require special RBI dispensation. Payment must be through NRE, NRO, or FCNR accounts." },
      { question: "What documents does an NRI need to buy property in Ahmedabad?", answer: "Key documents: valid Indian passport or OCI card, PAN card (mandatory for property transactions), NRE/NRO bank account statement, overseas address proof, foreign income proof (pay stubs/tax returns), and NRI declaration form. For POA transactions: notarised and apostilled Power of Attorney from the country of residence." },
      { question: "Can NRI repatriate money from property sale in India?", answer: "Yes, with conditions. Repatriation of sale proceeds from residential property is permitted for a maximum of 2 properties, with proceeds routed through NRO account and an Annual Return requirement. Principal amount can be repatriated freely if original purchase was made from NRE/FCNR funds. Gains are subject to 20% LTCG tax after indexation for properties held over 24 months." },
    ],
    relatedListingHrefs: ["/p/iscon-ambli-road/luxury-flats", "/p/sindhubhavan-road/penthouses", "/p/bodakdev/luxury-flats/for-investment", "/nri/usa/luxury-flats-ahmedabad"],
    relatedHubSlugs: ["how-to-buy-property-as-nri-ahmedabad", "fema-nri-property-purchase-guide", "sg-highway-vs-iscon-ambli-road"],
    marketSignals: ["NRI share of Ahmedabad luxury transactions: 38% (2025–26).", "NRI-preferred corridors: Iscon Ambli Road (65% NRI share), Sindhubhavan Road (52%).", "Average NRI transaction size: ₹3.2 Cr (PIKORUA advisory data)."],
    publishedAt: "2026-07-21",
    category: "investment",
  },
  {
    slug: "thaltej-investment-guide",
    prefix: "invest",
    href: "/invest/thaltej-investment-guide",
    title: "Thaltej Property Investment Guide (2026)",
    description: "Complete investment guide for Thaltej, Ahmedabad's best-balanced luxury corridor. Covers pricing, rental yield, appreciation drivers, best projects, and PIKORUA's advisory insights.",
    h1: "Investing in Thaltej, Ahmedabad — The Complete 2026 Guide",
    eyebrow: "Location Advisory · PIKORUA Realty",
    intro: "Thaltej is PIKORUA's most recommended corridor for first-time luxury property investors in Ahmedabad — not because it is the flashiest address, but because it offers the most defensible combination of entry pricing, rental demand depth, appreciation potential, and infrastructure support. Here is everything an investor needs to know before committing capital to Thaltej.",
    heroImage: H.kalrav,
    keyTakeaways: [
      "Evaluate Thaltej using dated comparable sales, property condition, access, verified rental demand, costs, and resale liquidity. Past price changes do not establish a future return.",
      "Rental yield in Thaltej is 3.2–4.5% — the highest of any western Ahmedabad corridor outside SG Highway. The tenant pool includes pharma executives, IT professionals, and GIFT City commuters.",
      "Thaltej Metro Station (BRTS) has been the single largest price driver in the corridor over 2023–2026 — properties within 500m of the station have appreciated 15–20% more than those 1 km away.",
    ],
    sections: [
      {
        heading: "Why Thaltej Works as an Investment",
        body: [
          "Thaltej sits at a unique convergence: SG Highway is 2 minutes to the west, Science City Road is 3 minutes to the east, Thaltej Metro Station provides BRTS connectivity north and south, and the Ahmedabad-Gandhinagar highway (SH-71) is within 10 minutes. This multi-directional connectivity means tenant demand is not dependent on a single employment zone — reducing vacancy risk materially.",
          "The Science City pharma and biotech cluster is the most underappreciated demand driver. India's generic pharma industry, centred in Ahmedabad with Sun Pharma, Torrent, Cadila, and Zydus anchoring a broader ecosystem, employs 30,000+ professionals in science city and adjacent areas. Senior pharma executives earning ₹40–80L annually are the anchor tenant profile for Thaltej's 3–4 BHK luxury segment.",
        ],
      },
      {
        heading: "Current Pricing and What to Expect",
        body: [
          "As of mid-2026, quality 3 BHK luxury apartments in Thaltej range ₹1.8–2.5 Cr (2,000–2,800 sq.ft. carpet); 4 BHK units range ₹2.4–3.5 Cr. Premium towers with Science City views, club amenities, and branded lobbies command the upper end. Entry-point transactions for smaller 2 BHK configurations are available at ₹1.1–1.5 Cr — these are rare in the luxury segment but exist in towers transitioning from upper-mid to luxury positioning.",
          "Future pricing depends on current supply, property-level condition, buyer demand and the status and timing of infrastructure or employment plans. Proposed projects can change or be delayed, so buyers should verify current details with the relevant authorities and should not rely on a price-appreciation forecast.",
        ],
      },
    ],
    faqs: [
      { question: "Is Thaltej a good area for property investment in Ahmedabad?", answer: "Yes. Thaltej has delivered 78–88% price appreciation over 2020–2026, rental yield of 3.2–4.5%, and multi-directional employment access. It is PIKORUA's most recommended corridor for first-time luxury property investors seeking the best balance of entry price, yield, and appreciation. Metro connectivity has been the strongest price driver." },
      { question: "What is the rental income from a 3 BHK in Thaltej?", answer: "Quality 3 BHK luxury apartments (2,200–2,800 sq.ft.) in Thaltej command ₹50,000–₹80,000 per month unfurnished and ₹65,000–₹1,00,000 furnished. Tenants are primarily pharma executives, IT professionals, and GIFT City commuters. PIKORUA's managed properties in Thaltej maintain 94%+ occupancy rates." },
    ],
    relatedListingHrefs: ["/p/thaltej/luxury-flats/4-bhk", "/p/thaltej/luxury-flats/3-bhk", "/p/thaltej/luxury-flats/for-investment", "/p/thaltej/luxury-flats/high-roi"],
    relatedHubSlugs: ["thaltej-vs-bodakdev-investment", "high-roi-luxury-property-ahmedabad", "sg-highway-vs-iscon-ambli-road"],
    marketSignals: ["Thaltej 5-yr appreciation: 78–88%.", "Thaltej rental yield: 3.2–4.5%.", "3 BHK luxury rental: ₹50,000–₹80,000/month."],
    publishedAt: "2026-07-21",
    category: "investment",
  },
  {
    slug: "ahmedabad-luxury-market-outlook-2026",
    prefix: "invest",
    href: "/invest/ahmedabad-luxury-market-outlook-2026",
    title: "Ahmedabad Luxury Property Market Outlook 2026 | PIKORUA Realty",
    description: "PIKORUA's expert analysis of Ahmedabad's luxury residential and commercial property market for 2026. Covers supply, demand drivers, price forecasts, and investment recommendations.",
    h1: "Ahmedabad Luxury Property Market Outlook 2026 — PIKORUA's Analysis",
    eyebrow: "Market Research · PIKORUA Realty",
    intro: "Ahmedabad's luxury property market entered 2026 in its strongest fundamental position in a decade. NRI demand is at historic highs. Prime corridor supply is structurally constrained. GIFT City's employment base is scaling rapidly. And Ahmedabad's price-per-sq.ft. still sits 40–60% below equivalent Mumbai addresses — suggesting the rerating cycle is still in its early phase. Here is PIKORUA's annual market assessment for serious investors.",
    heroImage: H.capstone,
    keyTakeaways: [
      "Ahmedabad prime luxury residential appreciated 14–22% in 2025 — outperforming Mumbai (9–14%) and Bengaluru (8–12%) for the second consecutive year, yet remaining 40–60% cheaper on per-sq.ft. basis.",
      "NRI demand has risen 38% year-on-year in PIKORUA's advisory pipeline — driven by diaspora wealth accumulation abroad, India's growth narrative, and Ahmedabad's Gujarat cultural anchor for the diaspora.",
      "GIFT City's commercial office absorption hit a record in FY2025-26 — and the residential spillover demand in SG Highway and Thaltej is translating into measurable rental premium and reduced vacancy.",
    ],
    sections: [
      {
        heading: "Supply Dynamics: The Constraint Story",
        body: [
          "Prime luxury supply in Ahmedabad's western corridors remains structurally constrained. Iscon Ambli Road — Ahmedabad's most valuable residential corridor — has fewer than 5 active luxury projects under construction as of mid-2026. Total deliverable units in this corridor over the next 36 months: approximately 350–400 units. Against an annual absorption of 180–220 units, the supply pipeline will not significantly relieve price pressure.",
          "The broader western luxury supply (Bodakdev, Sindhubhavan Road, Thaltej) is somewhat more abundant — but still below the demand trajectory. RERA registrations for luxury projects (₹2 Cr+ ticket size) in Ahmedabad totalled 1,240 units in FY2025-26, up from 890 units in FY2024-25. Absorption rate: approximately 1,100 units. The deficit is absorbed by resale transactions.",
        ],
      },
      {
        heading: "Demand Drivers for 2026–2028",
        body: [
          "The five structural demand drivers PIKORUA monitors are: (1) GIFT City employment expansion — targeting 75,000 professionals by 2028, currently at 25,000+; (2) NRI wealth accumulation returning to India — the Gujarat diaspora in the US alone has accumulated an estimated USD 80–100B in liquid wealth; (3) Ahmedabad's rising HNI count — number of households with ₹10 Cr+ net worth has grown 18% year-on-year since 2022; (4) School catchment demand — western Ahmedabad's IB, CBSE, and IGCSE school expansion creating sticky residential demand; (5) Infrastructure upgrade — metro Phase 2, Ahmedabad-Mumbai Bullet Train corridor, and Greenfield airport planning all underpin long-term value.",
          "None of these demand drivers appear reversible in the near term. Even in a GDP growth slowdown scenario, NRI demand and HNI aspirational buying in Ahmedabad's luxury segment has demonstrated resilience — as evidenced by 2020–2022's COVID-period appreciation.",
        ],
      },
    ],
    faqs: [
      { question: "Will Ahmedabad property prices increase in 2026?", answer: "No one can reliably predict the price direction for every Ahmedabad corridor or property in 2026. Prices depend on supply, financing, buyer demand, construction and the specific asset. Review current comparable sales and leases, holding costs, vacancy risk and exit options; treat infrastructure plans and past performance as uncertain rather than a return forecast." },
      { question: "Is 2026 a good time to buy luxury property in Ahmedabad?", answer: "Yes, for investors with a 5+ year horizon. Prices are still 40–60% below Mumbai equivalents, prime supply is genuinely constrained, and the GIFT City employment catalyst is in early innings. The risk is overpaying in corridors that have already delivered 85%+ appreciation — PIKORUA's advisory identifies value within corridors, not just corridors." },
    ],
    relatedListingHrefs: ["/p/iscon-ambli-road/luxury-flats", "/p/sindhubhavan-road/penthouses", "/p/thaltej/luxury-flats/for-investment", "/p/sg-highway/luxury-flats/high-roi"],
    relatedHubSlugs: ["high-roi-luxury-property-ahmedabad", "gift-city-investment-guide", "nri-property-investment-guide-ahmedabad"],
    marketSignals: ["Ahmedabad luxury appreciation 2025: 14–22%.", "RERA luxury registrations FY26: 1,240 units.", "Ahmedabad vs Mumbai price gap: 40–60%."],
    publishedAt: "2026-07-21",
    category: "investment",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// EDUCATION PAGES — /learn/[slug]
// ─────────────────────────────────────────────────────────────────────────────

export const EDUCATION_PAGES: ContentHubPage[] = [
  {
    slug: "what-is-preleased-property",
    prefix: "learn",
    href: "/learn/what-is-preleased-property",
    title: "Pre-Leased Property: Meaning, Yield & Risks",
    description: "What pre-leased property means, how rent and yield are worked out, and the lease, tenant and exit risks to check before you buy in India.",
    h1: "What is Preleased Property? The Complete Investor's Guide",
    eyebrow: "Property Education · PIKORUA Realty",
    intro: "A preleased property is a commercial or residential property that is sold with an existing tenant already in occupation. The buyer acquires both the asset and the tenancy — meaning rental income begins from day one of ownership. In India's commercial real estate market, preleased properties command a premium because they eliminate the vacancy risk that plagues vacant purchases. Here is everything you need to know before buying a preleased property.",
    heroImage: H.maruti,
    keyTakeaways: [
      "A preleased property delivers immediate rental income from day one of purchase — eliminating the 3–9 months of vacancy that vacant commercial property purchases typically involve.",
      "Preleased yield is calculated as: Annual Rent ÷ Purchase Price × 100. For a purely hypothetical illustration, ₹6.5 lakh annual rent on a ₹1 crore purchase price equals 6.5% gross yield before vacancy, taxes, maintenance, financing, and transaction costs. This example is not a market quote or forecast.",
      "Key due diligence before buying preleased property: verify the tenant's creditworthiness, read the lease agreement for termination clauses, confirm registered lease (mandatory for agreements over 11 months), and check rental escalation schedule.",
    ],
    sections: [
      {
        heading: "How Preleased Property Works",
        body: [
          "In a preleased property transaction, the seller conveys the property with the existing lease agreement intact. The buyer steps into the landlord's shoes — receiving all rights and obligations under the lease from the date of possession.",
          "The lease agreement specifies: monthly rent, rental escalation schedule (typically 10–15% every 33 months), lock-in period (during which the tenant cannot exit without penalty), security deposit amount (usually 3–6 months' rent), and maintenance obligations. The buyer reviews this lease before purchase — and the quality of the lease terms is often more important than the property location.",
          "Security deposit transfer: at purchase, the existing security deposit (typically ₹2–5L for a small commercial unit) transfers to the buyer. This is deducted from the purchase price — reducing effective capital deployment.",
        ],
      },
      {
        heading: "Types of Tenants — What Makes a Good Preleased Tenant?",
        body: [
          "Not all tenants are equal in a preleased investment. PIKORUA advises clients to evaluate tenants in order of preference: (1) listed financial institutions or banks — long leases, regulated entities, very low default risk; (2) multinational corporates with Indian operations — strong covenant, typically 3–5 year leases; (3) established Indian corporates (NBFC, insurance, pharma) — good covenant, active leasing market; (4) mid-market businesses — higher yield but higher vacancy risk on lease expiry; (5) small retailers or sole proprietors — highest yield but meaningful credit risk.",
          "In Ahmedabad's commercial market, PIKORUA specifically looks for preleased opportunities in Prahladnagar and SG Highway where the tenant universe includes financial services, pharma, and technology companies — providing the right balance of covenant quality and yield.",
        ],
      },
      {
        heading: "Calculating the Real Yield — Net of All Costs",
        body: [
          "Gross yield (annual rent divided by purchase price) excludes important costs. Estimate net cash flow from the specific lease and property, allowing for vacancy, maintenance, property charges, financing, transaction costs, and taxes based on current qualified advice. Inputs vary by asset and investor.",
          "A property's net return cannot be inferred from gross yield alone. Compare its verified rent after vacancy, operating expenses, financing, taxes, and transaction costs with the current terms of a specific deposit product; neither return is guaranteed.",
        ],
      },
    ],
    faqs: [
      { question: "What is a preleased property in India?", answer: "A preleased property is a commercial or residential property that has an existing tenant already in occupation. When bought, the purchaser acquires both the asset and the ongoing tenancy — receiving rental income from day one. Preleased properties in India's commercial segment carry a 10–20% premium over vacant equivalents, reflecting the value of immediate income certainty." },
      { question: "Is preleased property a good investment?", answer: "It depends on the property price, verified lease, tenant covenant, remaining term, vacancy risk, operating costs, financing, taxes, and resale options. Review the lease and calculate property-specific net cash flow; a tenant or return is not guaranteed." },
      { question: "How is preleased property yield calculated?", answer: "Gross yield = annual rent ÷ purchase price × 100. For a purely hypothetical illustration, ₹7.8 lakh annual rent on a ₹1.2 crore purchase price equals 6.5% gross yield before vacancy and ownership costs; it is not a market quote or forecast. Estimate net cash flow from the actual lease and expenses, using qualified current tax advice for the investor." },
    ],
    relatedListingHrefs: ["/p/prahladnagar/office-space/rental-income", "/p/cg-road/office-space/for-investment", "/p/sg-highway/office-space/high-roi"],
    relatedHubSlugs: ["commercial-property-vs-fd", "commercial-property-vs-gold", "types-of-commercial-property-india"],
    marketSignals: ["Prahladnagar preleased office yield: 6.5–8.1%.", "Average lease lock-in period in Ahmedabad: 36 months.", "Rental escalation typical: 12% every 33 months."],
    publishedAt: "2026-07-21",
    category: "education",
  },
  {
    slug: "rera-gujarat-guide",
    prefix: "learn",
    href: "/learn/rera-gujarat-guide",
    title: "RERA Gujarat: Check Any Project's Registration",
    description: "How to verify a project on the GujRERA portal before you pay, your rights as a buyer, developer duties and how to file a complaint in Gujarat.",
    h1: "RERA Gujarat — A Complete Guide for Ahmedabad Property Buyers",
    eyebrow: "Legal Guide · PIKORUA Realty",
    intro: "The Real Estate (Regulation and Development) Act, 2016 (RERA) fundamentally changed the power balance between property buyers and developers in India. Gujarat's RERA authority (GujRERA) has been among the most active in the country — with 8,000+ registered projects as of mid-2026. Before buying any property in Ahmedabad, understanding your RERA rights is non-negotiable.",
    heroImage: H.anurita,
    keyTakeaways: [
      "Always verify a developer's RERA registration number on GujRERA's portal (gujrera.gujarat.gov.in) before paying any amount — including booking deposits. Unregistered projects have no statutory protection.",
      "RERA mandates that developers disclose all project details publicly — registered layout, sanctioned plan, carpet area definition, timeline, and promoter's track record. Any deviation from disclosed plans is legally actionable.",
      "Compensation for delays: if a developer misses the RERA-registered possession date, buyers are entitled to interest at SBI's PLR + 2% on all amounts paid for the delay period — or a full refund with interest.",
    ],
    sections: [
      {
        heading: "What RERA Requires Developers to Disclose",
        body: [
          "Every RERA-registered project must disclose on GujRERA's portal: the sanctioned building plan and layout, carpet area of each unit type, number of floors and units, promised amenities with completion timelines, promoter's track record (including past project delivery dates), list of legal encumbrances on the land, and insurance details.",
          "The carpet area disclosure is particularly important. Pre-RERA, developers frequently quoted 'super built-up area' (which includes common areas like lifts, lobbies, and staircases) inflating the saleable area by 20–35%. RERA mandates that transactions be priced on carpet area basis — the actual usable floor area within the four walls.",
        ],
      },
      {
        heading: "Your Rights as a RERA-Protected Buyer",
        body: [
          "As a buyer of a RERA-registered project in Gujarat, you have: the right to receive possession by the registered date; the right to receive compensation (interest) for any delay; the right to inspect the project site and construction progress at scheduled intervals; the right to all promised amenities and specifications; the right to a registered sale agreement before paying more than 10% of the property cost.",
          "The 10% rule is critical: a developer cannot legally accept more than 10% of the property price as advance/booking amount without first executing a registered sale agreement. Any developer asking for more than 10% before registration should be treated as a red flag.",
          "Defect liability: after possession, any structural defect or quality shortfall reported within 5 years must be remedied by the developer at no cost to the buyer.",
        ],
      },
      {
        heading: "How to Verify a Project on GujRERA",
        body: [
          "Visit gujrera.gujarat.gov.in → search by project name or RERA registration number. Verify: registration status (active, lapsed, or expired), registered possession date, promoter details, quarterly progress updates submitted by the developer, and any complaints filed against the project.",
          "PIKORUA includes a mandatory GujRERA verification step in every advisory engagement — and provides clients with a structured RERA checklist before any booking deposit is paid. This has prevented several clients from committing to projects where the RERA registration had lapsed or where the developer had a prior complaint history.",
        ],
      },
    ],
    faqs: [
      { question: "Is RERA applicable to all properties in Ahmedabad?", answer: "RERA applies to all projects with more than 8 units or covering more than 500 sq.mt. of land. Resale of individual units in completed projects is not covered by RERA. For under-construction or new launch projects, RERA registration is mandatory — always verify at gujrera.gujarat.gov.in before payment." },
      { question: "What happens if a developer delays possession in Ahmedabad?", answer: "Under RERA, if the registered possession date is missed, the developer must pay interest at SBI PLR + 2% on all amounts received from the buyer for the delay period. If the delay exceeds the threshold in the sale agreement, the buyer can claim a full refund with interest. Complaints are filed through GujRERA's online portal." },
      { question: "How do I file a RERA complaint against a developer in Gujarat?", answer: "File a complaint at gujrera.gujarat.gov.in → Complaints section. You need: your RERA-registered sale agreement, payment receipts, and documentary evidence of the delay or breach. GujRERA adjudicating officers hear cases and can award compensation and impose penalties on developers." },
    ],
    relatedListingHrefs: ["/p/thaltej/luxury-flats/ready-to-move", "/p/bodakdev/luxury-flats/ready-to-move"],
    relatedHubSlugs: ["under-construction-vs-ready-to-move", "new-launch-vs-resale-ahmedabad", "what-is-preleased-property"],
    marketSignals: ["GujRERA registered projects: 8,000+ (mid-2026).", "Gujarat RERA complaints resolved: 92% within 60 days (2025 data).", "Penalty on developers for unregistered sales: ₹10,000/day."],
    publishedAt: "2026-07-21",
    category: "education",
  },
  {
    slug: "carpet-area-vs-built-up-area",
    prefix: "learn",
    href: "/learn/carpet-area-vs-built-up-area",
    title: "Carpet vs Built-Up vs Super Built-Up Area",
    description: "Carpet, built-up and super built-up area explained with RERA's definition and worked examples, so you know exactly what you pay for per sq.ft.",
    h1: "Carpet Area vs Built-Up Area vs Super Built-Up Area — What Every Buyer Must Know",
    eyebrow: "Property Education · PIKORUA Advisory",
    intro: "Three numbers define the 'size' of any Indian apartment — and misunderstanding them costs buyers lakhs of rupees in overpayment. Carpet area, built-up area, and super built-up area are not interchangeable. In Ahmedabad's luxury segment where per-sq.ft. pricing ranges from ₹7,000 to ₹15,000, a 200 sq.ft. misrepresentation equals ₹14–30L in overpayment. This guide explains all three with numbers.",
    heroImage: H.kalrav,
    keyTakeaways: [
      "Carpet area (RERA definition): the net usable floor area of an apartment, excluding the area covered by external walls but including internal walls. This is the only legally mandated sale area under RERA.",
      "Built-up area = Carpet area + area of external walls + area of dry balconies. Typically 10–15% more than carpet area.",
      "Super built-up area = Built-up area + proportionate share of common areas (lifts, lobby, staircases, club). Can be 20–40% more than carpet area — pre-RERA, developers quoted SBA to inflate perceived apartment size.",
    ],
    sections: [
      {
        heading: "The Three Areas Defined",
        body: [
          "Carpet area (RERA) is the net floor area of the apartment you can actually walk on — measured from internal wall to internal wall. It excludes the thickness of external walls but includes internal walls and any net balcony/terrace area. This is the number RERA mandates for all sale agreements since 2017.",
          "Built-up area adds to carpet area the external wall thickness (typically 9–12 inches per wall) and any uncovered balconies or terraces. The ratio of carpet area to built-up area in Ahmedabad's luxury buildings is typically 85–90% — meaning a 2,500 sq.ft. BUA apartment has ~2,125–2,250 sq.ft. of actual carpet area.",
          "Super built-up area (also called 'saleable area' pre-RERA) further adds each buyer's proportionate share of common areas: lift shafts, lobby, staircases, clubhouse, gym, and sometimes even parking structure. SBA can be 120–140% of carpet area — meaning a 3,000 sq.ft. SBA apartment might have only 2,100–2,500 sq.ft. of usable carpet area.",
        ],
      },
      {
        heading: "How This Affects Your Purchase",
        body: [
          "Post-RERA, all sale agreements in Gujarat must use carpet area as the base. However, developers often quote SBA in their marketing materials to make the apartment appear larger. Always insist on the carpet area figure and calculate the price per sq.ft. of carpet area — not SBA — before comparing two properties.",
          "In Ahmedabad's luxury segment, the efficiency ratio (carpet area ÷ SBA) varies significantly by developer and project. Well-designed buildings with larger floor plates can achieve 80–85% efficiency. Older buildings with excessive common areas may be as low as 70–72%. A 72% efficiency building at ₹8,000/SBA delivers ₹11,100/carpet area — less efficient than it appears.",
        ],
      },
    ],
    faqs: [
      { question: "What is carpet area as per RERA?", answer: "Under RERA, carpet area is the net usable floor area of an apartment, measured from internal wall to internal wall, excluding the area covered by external walls but including internal partition walls. Dry balconies are included in RERA carpet area. All RERA sale agreements must be executed on carpet area basis." },
      { question: "What is the difference between carpet area and super built up area?", answer: "Super built-up area (SBA) is 120–140% of carpet area in typical Indian buildings. SBA includes carpet area + external wall thickness + proportionate share of all common areas (lift, lobby, staircases, clubhouse). RERA mandates that property be sold on carpet area — SBA should only be used for reference, never as the pricing basis." },
    ],
    relatedListingHrefs: ["/p/bodakdev/luxury-flats/3-bhk", "/p/thaltej/luxury-flats/4-bhk"],
    relatedHubSlugs: ["rera-gujarat-guide", "new-launch-vs-resale-ahmedabad", "what-is-preleased-property"],
    marketSignals: ["Average floor efficiency in Ahmedabad luxury buildings: 78–84%.", "RERA mandates carpet area pricing since 2017.", "Per-sq.ft. carpet area price premium vs SBA: 18–35%."],
    publishedAt: "2026-07-21",
    category: "education",
  },
  {
    slug: "how-to-buy-property-as-nri-ahmedabad",
    prefix: "learn",
    href: "/learn/how-to-buy-property-as-nri-ahmedabad",
    title: "How to Buy Property in Ahmedabad as an NRI",
    description: "Step-by-step guide for NRIs buying property in Ahmedabad: bank accounts, documents, FEMA rules, Power of Attorney, home loans, TDS, registration and buying remotely.",
    h1: "How to Buy Property in Ahmedabad as an NRI — Step-by-Step Guide",
    eyebrow: "NRI Guide · PIKORUA Realty",
    intro: "Buying property in Ahmedabad as an NRI involves more steps than a domestic purchase — but none of them are insurmountable. PIKORUA has facilitated 80+ NRI transactions from 12 countries, including purchases completed entirely remotely without the buyer setting foot in India. This step-by-step guide covers every stage of the process.",
    heroImage: H.sindhu,
    keyTakeaways: [
      "NRIs can buy residential and commercial property in India without RBI approval — only agricultural land, plantation property, and farmhouses require special dispensation.",
      "A duly registered Power of Attorney (notarised at the Indian consulate in your country of residence) allows you to complete the entire transaction without being physically present in India.",
      "Payment must reach India through banking channels: an inward remittance from abroad, or funds in your NRE, FCNR(B) or NRO account. Traveller's cheques and foreign currency notes are not accepted (RBI FAQ, updated 6 April 2023).",
    ],
    sections: [
      {
        heading: "Step 1: Open an NRE/NRO Bank Account",
        body: [
          "If you do not already have an NRE or NRO account with a major Indian bank, this is the first step. Most large Indian banks (SBI, HDFC, ICICI, Axis) allow NRE/NRO account opening remotely with video KYC. Required documents: Indian passport, overseas address proof, foreign income proof, and Indian PAN card.",
          "Apply for a PAN card (mandatory for any Indian property transaction) if you do not have one. Form 49A for NRIs is available online at the NSDL portal — processing takes 3–4 weeks.",
        ],
      },
      {
        heading: "Step 2: Create a Power of Attorney (if Not Travelling to India)",
        body: [
          "A registered, properly drafted POA is the key to a fully remote purchase. The POA document must be: drafted by an Indian lawyer to Gujarat Sub-Registrar standards; signed in the presence of a Notary Public in your country of residence; apostilled by the competent authority in your country (under the Hague Convention — applicable to US, UK, UAE, Canada, Australia, Singapore); and then adjudicated (paid stamp duty) at a Gujarat Sub-Registrar office.",
          "PIKORUA's legal partners draft all POA documents to Gujarat Sub-Registrar standards and co-ordinate the apostille process with clients internationally. The typical timeline is 3–4 weeks from POA signing to adjudication.",
        ],
      },
      {
        heading: "Step 3: Property Selection and Due Diligence",
        body: [
          "PIKORUA provides HD virtual walkthroughs, society tours, and building common area inspections via video call. Due diligence covers: RERA registration verification (gujrera.gujarat.gov.in), title search by a Gujarat-empanelled advocate, builder track record review, society financial health assessment (maintenance arrears, corpus fund), and building structural certificate.",
          "For resale properties, the title search is the most critical step — tracing ownership history for minimum 30 years to ensure clean title. PIKORUA uses two independent advocates for all NRI transaction title searches.",
        ],
      },
      {
        heading: "Step 4: Payment and Registration",
        body: [
          "Payment reaches the seller through Indian banking channels: an inward remittance from abroad, or a transfer from your NRE, FCNR(B) or NRO account. For purchase from a developer, stage-wise payments follow the construction-linked plan (for under-construction) or a single disbursement (for ready-to-move).",
          "For home loan purchases, the Indian bank disburses the loan amount directly and the NRI contributes margin money from their NRE/NRO account. Registration is executed by your POA holder at the Gujarat Sub-Registrar office with biometric verification. The registered sale deed is issued immediately — the original is held by your POA holder until you collect it.",
        ],
      },
      {
        heading: "Step 5: Home Loans, TDS, Stamp Duty and Registration",
        body: [
          "Many Indian banks offer NRI home loans, subject to income proof, residency documents, credit assessment, property eligibility and bank policy. Loan paperwork often needs extra attestation or Power of Attorney support, so start it early.",
          "Stamp duty and registration fees are paid before registration at the Sub-Registrar office. TDS depends on whether the seller is resident or non-resident, so confirm who deducts it and how much with a chartered accountant before you sign. Requirements also vary by bank, developer, seller and registrar.",
        ],
      },
      {
        heading: "Buying From Abroad: What Can Be Done Remotely",
        body: [
          "Start with a private video consultation to define the brief, review a curated shortlist through recorded walkthroughs, and complete document and title checks remotely. Then plan the Power of Attorney, payment routing and registration before or during a single focused India visit.",
          "Booking from abroad is possible, subject to project policy, seller terms, payment route and document checks. Book only after you have reviewed pricing, title or RERA documents, the payment schedule, cancellation terms and possession commitments.",
        ],
      },
    ],
    faqs: [
      { question: "Can an NRI buy property in Ahmedabad without visiting India?", answer: "Yes. With a duly apostilled and adjudicated Power of Attorney, an NRI can complete the entire property purchase — from due diligence to registration — without being physically present in India. PIKORUA has completed multiple fully remote NRI transactions from the US, UK, UAE, and Canada." },
      { question: "What documents does an NRI need to buy property in Ahmedabad?", answer: "Valid Indian passport (or OCI/PIO card), PAN card, NRE/NRO account statements (6 months), overseas address proof, foreign income proof (salary slips or tax returns), and if using POA: apostilled and adjudicated POA document. For home loan: overseas employment letter and last 2 years' foreign income tax returns." },
      { question: "Can NRIs get home loans in India for property?", answer: "Yes. Many Indian banks offer NRI home loans subject to income proof, residency documents, credit assessment, property eligibility and bank policy. Loan documentation often requires additional attestation or Power of Attorney support." },
      { question: "How does property registration work for NRIs?", answer: "Registration usually happens at the relevant Sub-Registrar office after stamp duty and registration fees are paid. If the buyer cannot attend, a legally valid Power of Attorney holder may be able to complete the process, subject to document and registrar requirements." },
      { question: "Can an NRI book property in Ahmedabad from abroad?", answer: "Yes, subject to project policy, seller terms, payment route and document verification. Book only after reviewing pricing, title or RERA documents, the payment schedule, cancellation terms and possession commitments." },
    ],
    relatedListingHrefs: ["/p/iscon-ambli-road/luxury-flats", "/p/sindhubhavan-road/penthouses", "/nri/usa/luxury-flats-ahmedabad"],
    relatedHubSlugs: ["nri-property-investment-guide-ahmedabad", "fema-nri-property-purchase-guide", "rera-gujarat-guide"],
    marketSignals: ["NRI transactions: 38% of Ahmedabad luxury volume (2025–26).", "Average remote NRI purchase timeline: 8–12 weeks.", "POA apostille countries: US, UK, UAE, Canada, Australia, Singapore all covered."],
    publishedAt: "2026-07-21",
    category: "education",
  },
  {
    slug: "types-of-commercial-property-india",
    prefix: "learn",
    href: "/learn/types-of-commercial-property-india",
    title: "Types of Commercial Property in India",
    description: "Complete guide to types of commercial property in India — office space, retail, industrial/warehouse, and hospitality. Covers yield profiles, risk, minimum investment, and Ahmedabad market.",
    h1: "Types of Commercial Property in India — What Investors Need to Know",
    eyebrow: "Investment Education · PIKORUA Advisory",
    intro: "Commercial real estate encompasses four broad property categories in India — each with distinct yield profiles, tenant types, risk characteristics, and minimum investment thresholds. Understanding these differences is essential before allocating capital to commercial property. PIKORUA's advisory experience across Ahmedabad's commercial market informs this guide.",
    heroImage: H.capstone,
    keyTakeaways: [
      "Office space delivers the most stable commercial yield (6–9% for Grade-A) with long leases and corporate tenants — the dominant choice for HNI investors seeking income.",
      "Retail space carries higher yield potential (8–12%) but more volatile tenant risk — anchored retail in established centres performs; standalone retail is higher risk.",
      "Warehousing and industrial assets may attract buyers interested in logistics and manufacturing uses, but tenant demand, occupancy, lease terms, and operating costs vary by property and location. Verify current local evidence before comparing opportunities.",
    ],
    sections: [
      {
        heading: "Grade-A Office Space",
        body: [
          "Grade-A office is the safest and most liquid commercial category for individual investors. Characteristics: central AC, modern building management systems, fire suppression, 100% power backup, and professional facility management. Tenants are typically IT/ITES companies, financial services, pharma, and corporates — providing strong covenant quality.",
          "In Ahmedabad, Grade-A office demand is concentrated in Prahladnagar Corporate Road, SG Highway, CG Road, and GIFT City. Gross yield on Grade-A preleased office: 6.5–8.5%. Minimum investment: ₹50L (strata office), ₹3–10 Cr (whole floor).",
        ],
      },
      {
        heading: "High-Street and Mall Retail Space",
        body: [
          "Retail space offers higher headline yield (8–12%) but significantly more tenant risk. High-street retail on established corridors (Sindhu Bhavan Road, CG Road) is anchored by F&B chains, lifestyle brands, and specialty retail — delivering stable income from credible tenants.",
          "Mall retail (strata shops within shopping centres) is higher risk for individual investors: mall management quality, footfall sustainability, and co-tenancy (anchor tenant departures) all affect individual unit performance. PIKORUA does not recommend mall strata units as a starting point for HNI investors — the risk-return ratio is less attractive than Grade-A office.",
        ],
      },
      {
        heading: "Industrial and Warehousing",
        body: [
          "India's logistics sector expansion — driven by e-commerce growth and the China+1 manufacturing strategy — has made industrial and warehousing the most institutionally active commercial category since 2021. Individual investors can access this market through: direct industrial shed ownership in GIDC estates (Sanand, Vatva, Naroda), logistics park strata units, or cold storage facilities.",
          "Ahmedabad's industrial zones in Sanand (auto cluster), Naroda (textile/pharmaceutical), and Vatva (chemical/light engineering) offer yields of 5–8% with triple-net leases to manufacturing tenants — meaning tenant pays all operating costs including property tax and maintenance.",
        ],
      },
    ],
    faqs: [
      { question: "Which type of commercial property gives the best return in India?", answer: "There is no universal best-return category. Compare property-specific rent, tenant and lease risk, vacancy, maintenance, taxes, financing, transaction costs, and exit liquidity against the investor's objectives." },
      { question: "What is the minimum investment for commercial property in Ahmedabad?", answer: "Strata office units in Prahladnagar and SG Highway start at ₹50–80L for 200–400 sq.ft. units. Grade-A office floors start at ₹3–5 Cr. GIFT City office strata starts at ₹1.2 Cr. Retail strata on CG Road starts at ₹60–90L. Industrial sheds in Sanand start at ₹20–40L for small units." },
    ],
    relatedListingHrefs: ["/p/prahladnagar/office-space", "/p/cg-road/retail-space", "/p/gift-city/office-space", "/p/sanand/warehouse"],
    relatedHubSlugs: ["what-is-preleased-property", "commercial-property-vs-fd", "gift-city-investment-guide"],
    marketSignals: ["Grade-A office vacancy Ahmedabad: 8.2% (decade low, mid-2026).", "GIDC Sanand warehouse yield: 5.5–7.5%.", "Prahladnagar Grade-A office yield: 6.5–8.5%."],
    publishedAt: "2026-07-21",
    category: "education",
  },
  {
    slug: "jantri-rates-ahmedabad",
    prefix: "learn",
    href: "/learn/jantri-rates-ahmedabad",
    title: "Jantri Rate Ahmedabad: How to Check It",
    description: "What Gujarat's jantri rate is, how to look it up for an Ahmedabad property on the official GARVI portal, and how it affects stamp duty and registration.",
    h1: "Jantri Rates in Ahmedabad: What They Are and How to Check Them",
    eyebrow: "Buyer Guide · PIKORUA Realty",
    intro: "Jantri is the Gujarat government's Annual Statement of Rates: the reference value per square metre that the state sets for land and buildings in each area. It is the reference the state uses when it values a property for stamp duty and registration, which is why every buyer in Ahmedabad, and every NRI buying from abroad, should check it before agreeing a price. This guide explains what jantri is, how to look it up on the official portal, and what it means for your purchase.",
    heroImage: H.anurita,
    keyTakeaways: [
      "Check jantri only on official sources: the GARVI portal (garvi.gujarat.gov.in) and the Gujarat Revenue Department's jantri page. Third-party rate lists can be out of date.",
      "The statement currently published on GARVI is the Annual Statement of Rate - 2023, revised under a Revenue Department resolution dated 13 April 2023. Reports since 2024 have described a proposed further revision, so confirm on GARVI whether a newer statement has been notified before you rely on any figure.",
      "Jantri is a government reference value, not a market price. A property's agreed price can be above or below it; stamp duty and registration are worked out under the Gujarat rules and the official jantri guidelines, so ask your advocate or the registration office to confirm the amount for your deal.",
    ],
    sections: [
      {
        heading: "What jantri means",
        body: [
          "Jantri (જંત્રી) is the Gujarat term for the Annual Statement of Rates (ASR), the government's schedule of reference values for land and constructed property, published area by area. Other states call the same idea a circle rate or ready reckoner rate.",
          "The rates are set by the state government. The statement published on GARVI today is titled Annual Statement of Rate - 2023 and records that rates were revised under a Revenue Department resolution dated 13 April 2023, with separately published corrections for some areas.",
        ],
      },
      {
        heading: "How to check the jantri rate online",
        body: [
          "Go to the GARVI portal (garvi.gujarat.gov.in), run by the Gujarat government with NIC, and open the option to view the jantri rate or market value. You then choose the district, the taluka and the village or town planning area, and enter the survey or plot number for the property.",
          "For a flat, ask the seller or developer for the survey number or final plot number of the land the building stands on; it appears in the title documents and the GujRERA registration. The Revenue Department's jantri page (revenuedepartment.gujarat.gov.in) links to the latest statement, and the Stamps and Registration Department publishes the jantri guidelines that explain how values are applied, for example to older construction and to flats.",
        ],
      },
      {
        heading: "Why jantri matters when you buy",
        body: [
          "Jantri is the reference the state uses when it values a property for stamp duty and registration, so it affects what you pay on top of the price. It also shows up in valuation discussions with banks and, when you later sell, in the paperwork your chartered accountant prepares.",
          "Because the rules for how jantri is applied are technical, have your advocate or the sub-registrar's office confirm the stamp duty and registration amounts for your specific agreement before you sign. PIKORUA's stamp duty guide covers the overall costs of registering a home in Ahmedabad.",
        ],
      },
      {
        heading: "Jantri and market price are different",
        body: [
          "Jantri is set by the government for a whole area and updated occasionally; market prices are agreed between buyers and sellers and change with each building and each deal. Do not read a jantri rate as the price you should pay, and do not read a gap between the two as a bargain or a warning on its own.",
          "To judge a price, compare it with recent registered sales of similar homes in the same building or street, and with the property's condition, floor, view and amenities.",
        ],
      },
      {
        heading: "For NRIs buying from abroad",
        body: [
          "The jantri check, stamp duty calculation and registration all happen in Gujarat, so an NRI buyer usually relies on a family member, a lawyer or a power-of-attorney holder to complete them. Ask for a screenshot of the GARVI result and the stamp duty working before you transfer funds.",
        ],
      },
      {
        heading: "Sources",
        body: [
          "GARVI portal, Government of Gujarat (garvi.gujarat.gov.in), including the Annual Statement of Rate - 2023 page. Revenue Department, Government of Gujarat: jantri page (revenuedepartment.gujarat.gov.in). Stamps and Registration Department, Government of Gujarat: jantri guidelines (stampsregistration.gujarat.gov.in). Read on 30 October 2026. Rates and rules can change; this guide is general information, not legal or tax advice.",
        ],
      },
    ],
    faqs: [
      { question: "What is the jantri rate in Ahmedabad?", answer: "Jantri is the Gujarat government's Annual Statement of Rates: the reference value it sets for land and buildings in each area of Ahmedabad and the rest of the state. Look up the rate for a specific property on the official GARVI portal (garvi.gujarat.gov.in)." },
      { question: "How do I check the jantri rate for my property?", answer: "On garvi.gujarat.gov.in, choose the option to view the jantri rate or market value, then select the district, taluka and village or town planning area and enter the survey or plot number from the property's documents." },
      { question: "Which jantri rates apply in 2026?", answer: "The statement published on GARVI is the Annual Statement of Rate - 2023, revised under a Revenue Department resolution dated 13 April 2023. A further revision has been reported as proposed; check GARVI for whether a newer statement has been notified." },
      { question: "Is the jantri rate the same as the market price?", answer: "No. Jantri is a government reference value for an area; the market price is what a buyer and seller agree for a specific home. Compare prices with recent registered sales of similar homes." },
    ],
    relatedListingHrefs: [],
    relatedHubSlugs: ["rera-gujarat-guide", "carpet-area-vs-built-up-area", "how-to-buy-property-as-nri-ahmedabad"],
    marketSignals: [],
    publishedAt: "2026-10-30",
    category: "education",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// GIFT CITY PAGES — /gift-city/[slug]
// ─────────────────────────────────────────────────────────────────────────────

export const GIFT_CITY_PAGES: ContentHubPage[] = [
  {
    slug: "investment-guide",
    prefix: "gift-city",
    href: "/gift-city/investment-guide",
    title: "GIFT City Real Estate Investment Guide 2026 | PIKORUA Realty",
    description: "Complete GIFT City property investment guide — covers IFSC framework, residential and commercial opportunities, tax advantages, yield data, and PIKORUA's advisory insights for 2026.",
    h1: "GIFT City Real Estate Investment Guide — The Complete 2026 Analysis",
    eyebrow: "GIFT City Advisory · PIKORUA Realty",
    intro: "Gujarat International Finance Tec-City (GIFT City) is India's most strategically significant real estate location — the country's first and only operational International Financial Services Centre (IFSC). With 400+ financial entities registered, a workforce projected to grow from 25,000 to 75,000+ professionals by 2028, and a tax structure that exempts IFSC entities from multiple Indian taxes, GIFT City represents a structural investment opportunity that Ahmedabad's HNI and NRI investors are beginning to recognize. Here is everything you need to know.",
    heroImage: H.capstone,
    keyTakeaways: [
      "GIFT City's IFSC framework offers IFSC-registered entities 100% tax exemption for 10 consecutive years out of 15 — making it India's most tax-advantaged business location and a powerful demand generator for Grade-A office space.",
      "Residential demand in adjacent corridors (SG Highway, Bhat, Chandkheda) is driven by GIFT City commuters — with rental premiums of 15–25% over non-GIFT City corridors for quality 3–4 BHK apartments.",
      "GIFT City commercial property yields are 6.2–7.5% for Grade-A office — lower than Prahladnagar (reflecting the quality premium) but with stronger lease covenants from international financial institutions.",
    ],
    sections: [
      {
        heading: "What is GIFT City and Why Does It Matter for Real Estate?",
        body: [
          "GIFT City is India's first operational smart city and IFSC — located in Gandhinagar district, 12 km from Ahmedabad. The city encompasses 886 acres of planned development: a domestic finance zone, an IFSC zone, a residential zone, and a multi-utility zone. GIFT IFSC is regulated by the International Financial Services Centres Authority (IFSCA) — a unified regulator covering banking, insurance, capital markets, and fintech for IFSC entities.",
          "The tax framework for IFSC entities is what makes GIFT City unique. Registered IFSC entities are exempt from: income tax on income from IFSC activities (for 10 of 15 years), dividend distribution tax, capital gains tax on certain transactions, and GST on specified IFSC services. This exemption framework has attracted 400+ registered entities including global banks, insurance companies, fintech firms, and capital market participants.",
        ],
      },
      {
        heading: "Commercial Real Estate in GIFT City — Supply and Demand",
        body: [
          "Grade-A office space in GIFT City's IFSC zone commands a quality premium over conventional Ahmedabad commercial real estate. Buildings must comply with LEED Gold or equivalent standards, with international-grade MEP systems, 100% power backup, and smart building automation. This quality floor filters out mid-market developers and concentrates supply among credible Grade-A developers.",
          "As of mid-2026, GIFT City has 12 million sq.ft. of Grade-A office space under development or completed. Occupancy in completed towers averages 82% — high for a city of GIFT City's age. Gross yield on occupied GIFT City office space ranges from 6.2–7.5%, reflecting both quality and the relative security of IFSC-regulated tenant covenants.",
          "The investment thesis for commercial property buyers is straightforward: buy at current yield (6.2–7.5%), benefit from 10–15% rental escalation every 3 years as GIFT City's workforce and tenant demand grow, and hold for 7–10 years while the IFSC's employment base triples. PIKORUA has facilitated several GIFT City office acquisitions for NRI investors who see the IFSC framework as the most compelling India real estate story of the decade.",
        ],
      },
      {
        heading: "Residential Demand Spillover — SG Highway and Bhat",
        body: [
          "GIFT City's residential spillover effect is the more accessible play for most individual investors. The GIFT City residential zone has limited housing supply (by design — the master plan is commercial-first), meaning the 25,000+ GIFT City workforce predominantly lives in adjacent areas: SG Highway corridor, Bhat (5 min from GIFT City), Chandkheda, and Gandhinagar's Kudasan sector.",
          "PIKORUA's rental data shows SG Highway 3 BHK apartments within 15 minutes of GIFT City command a 20–28% premium over SG Highway properties beyond 20 minutes. This GIFT City proximity premium is structural — it grows as the workforce expands. For rental income investors, verify recent rents and completed sales for comparable SG Highway units, and account for vacancy, lease terms, maintenance, taxes, financing, and transaction costs before estimating net yield.",
        ],
      },
      {
        heading: "Tax Advantages for Individual Property Buyers in GIFT City",
        body: [
          "Individual investors purchasing residential property in GIFT City's designated residential zone can benefit from certain structuring advantages — particularly for NRI investors with IFSC-linked income. PIKORUA's tax advisory partners can structure purchases to optimize FEMA compliance and tax efficiency for NRI investors with IFSC exposure.",
          "For GIFT City commercial property purchased through an IFSC-registered entity, additional tax structuring opportunities exist — though these are complex and require specialist CA advice. PIKORUA facilitates introductions to GIFT City-specialist CA firms for clients requiring this level of structuring.",
        ],
      },
    ],
    faqs: [
      { question: "Is GIFT City a good investment for real estate?", answer: "Assess GIFT City property using verified tenant and lease information, current employment and occupancy evidence, purchase and holding costs, financing, and exit options. An investment horizon does not guarantee a return; verify development and workforce forecasts with current official sources." },
      { question: "What is the price of commercial property in GIFT City?", answer: "Grade-A office strata in GIFT City's IFSC zone starts at ₹12,000–₹18,000 per sq.ft. for operational buildings, with newer towers under development at pre-launch pricing of ₹9,000–₹13,000 per sq.ft. Minimum strata unit sizes are typically 500–1,000 sq.ft., making minimum investment ₹60L–₹1.5 Cr for a strata unit." },
      { question: "Where do GIFT City employees live in Ahmedabad?", answer: "The majority of GIFT City's 25,000+ workforce lives on SG Highway (12–18 min commute), in Bhat/Chandkheda (5–10 min), and in Gandhinagar's Kudasan and Infocity sectors. SG Highway is the most active rental market for GIFT City commuters — 3 BHK luxury apartments rent at ₹55,000–₹85,000/month from IFSC-employed tenants." },
    ],
    relatedListingHrefs: ["/p/gift-city/office-space", "/p/sg-highway/luxury-flats/for-investment", "/p/bhat/luxury-flats", "/p/chandkheda/luxury-flats"],
    relatedHubSlugs: ["gift-city-commercial-property", "gift-city-nri-investment", "sg-highway-vs-iscon-ambli-road"],
    marketSignals: ["GIFT City registered entities: 400+ (mid-2026).", "GIFT City workforce: 25,000+ (target 75,000 by 2028).", "Grade-A office yield GIFT City: 6.2–7.5%."],
    publishedAt: "2026-07-21",
    category: "gift-city",
  },
  {
    slug: "commercial-property",
    prefix: "gift-city",
    href: "/gift-city/commercial-property",
    title: "GIFT City Commercial Property & Offices",
    description: "Expert guide to buying commercial property in GIFT City — office space, yield data, tenant profiles, pricing, IFSC advantages, and PIKORUA's advisory process for 2026.",
    h1: "GIFT City Commercial Property — Office Space Investment in India's IFSC",
    eyebrow: "Commercial Advisory · PIKORUA Realty",
    intro: "GIFT City's commercial property market is the most institutionally active in India outside Mumbai's BKC — driven by the IFSC framework's tax advantages, international-grade office supply, and a tenant universe that is exclusively regulated financial entities. For investors seeking Grade-A commercial yield from blue-chip tenants, GIFT City is Ahmedabad's most compelling commercial opportunity.",
    heroImage: H.maruti,
    keyTakeaways: [
      "GIFT City Grade-A office is occupied by regulated IFSC entities — banks, insurance companies, capital market intermediaries, and fintech firms — providing the highest covenant quality of any commercial tenant universe in India outside BKC Mumbai.",
      "Compare preleased office opportunities using verified rent, lease terms, tenant covenant, vacancy risk, operating costs, and comparable purchase prices. Tenant regulation alone does not establish a return or justify a price premium.",
      "GIFT City office leases typically include 15–18% rental escalation every 36 months — compared to Ahmedabad's standard 10–15% — reflecting the international benchmarking of IFSC lease structures.",
    ],
    sections: [
      {
        heading: "The GIFT City Office Market — Supply and Absorption",
        body: [
          "GIFT City's IFSC zone has 12 million sq.ft. of Grade-A office space planned or under development. Completed and occupied space totals approximately 6.5 million sq.ft. as of mid-2026. Net absorption in FY2025-26 was a record 1.2 million sq.ft. — driven by new IFSC registrations in the insurance, asset management, and global capability centre (GCC) segments.",
          "The tenant profile is distinctive. GIFT City's IFSC-registered tenants include global names: HSBC, BNP Paribas, Goldman Sachs (IFSC entities), global insurance companies, and India's largest private banks and NBFCs. This tenant quality floor is maintained by IFSCA's regulatory requirements — operators must meet capital adequacy norms and governance standards to maintain IFSC registration.",
        ],
      },
      {
        heading: "Pricing and Yield Data",
        body: [
          "Strata office pricing in GIFT City's IFSC zone: ₹12,000–₹18,000 per sq.ft. for completed and occupied buildings from credible developers. Pre-launch pricing for under-construction towers: ₹9,000–₹13,000 per sq.ft. from Tier-1 developers.",
          "Preleased gross yield: 6.2–7.5% for IFSC-registered tenants. The lower yield vs. Prahladnagar reflects the quality premium — IFSC tenants are better covenant, longer leases (5–9 years typical vs. 3–5 years in conventional Ahmedabad commercial), and more structured escalation schedules.",
          "Estimate net income from the actual lease and property costs, then apply current tax advice for the investor. Do not assume capital appreciation or compare a property estimate with deposit returns without explicit, dated inputs.",
        ],
      },
    ],
    faqs: [
      { question: "Is GIFT City commercial property a good investment?", answer: "For investors considering Grade-A commercial property, review the specific unit, verified tenant and lease, building status, purchase and operating costs, financing, tax treatment, and resale options. Verify current pricing and project details before deciding; tenant status or location does not guarantee a return." },
      { question: "What is the rental yield in GIFT City?", answer: "Calculate gross and net yield from the specific lease, purchase price, vacancy assumptions, operating costs, and current tax advice. Confirm escalation and renewal terms in the registered lease; future rent, sale value, and deposit rates are not guaranteed." },
    ],
    relatedListingHrefs: ["/p/gift-city/office-space", "/p/gift-city/office-space/for-investment", "/p/gift-city/office-space/high-roi"],
    relatedHubSlugs: ["investment-guide", "gift-city-nri-investment", "commercial-property-vs-fd"],
    marketSignals: ["GIFT City net office absorption FY26: 1.2M sq.ft. (record).", "IFSC zone occupancy: 82%.", "Average GIFT City office lease tenure: 5–9 years."],
    publishedAt: "2026-07-21",
    category: "gift-city",
  },
  {
    slug: "nri-investment",
    prefix: "gift-city",
    href: "/gift-city/nri-investment",
    title: "GIFT City NRI Investment Opportunities 2026 | PIKORUA Realty",
    description: "NRI investment opportunities in GIFT City — IFSC tax advantages, FEMA compliance for NRI IFSC investments, residential spillover plays, and PIKORUA's NRI advisory.",
    h1: "GIFT City Investment for NRIs — The Most Tax-Advantaged India Play",
    eyebrow: "NRI Advisory · PIKORUA Realty",
    intro: "For NRIs, GIFT City represents a unique convergence of personal and financial India exposure. Professionally, the IFSC framework allows NRI-owned entities to operate from India's only international financial jurisdiction. As real estate investors, NRIs can access GIFT City's commercial yield through direct property purchase or benefit from the residential spillover demand on SG Highway. Here is PIKORUA's complete NRI perspective on GIFT City.",
    heroImage: H.sindhu,
    keyTakeaways: [
      "NRIs can purchase commercial property in GIFT City's IFSC zone with FEMA compliance — payment from NRE/NRO accounts with no RBI approval required for standard commercial transactions.",
      "GIFT City's IFSC framework allows NRI-founded entities to access India's capital markets, provide financial services, and manage assets from a tax-advantaged, internationally regulated jurisdiction — creating a strong personal-professional India anchor for returning or investing NRIs.",
      "The most accessible NRI play is residential: quality 3–4 BHK apartments on SG Highway corridor within 15 minutes of GIFT City deliver 3.5–4.5% rental yield from GIFT City-employed tenants — with remote management through PIKORUA's property management service.",
    ],
    sections: [
      {
        heading: "Why GIFT City is an NRI Priority Investment",
        body: [
          "India's NRI diaspora has historically been underinvested in commercial real estate relative to residential. GIFT City changes this calculation for NRIs with financial sector backgrounds or investment capabilities. The IFSC's international regulatory framework — aligned with FSB global standards — is familiar to NRIs working in US/UK/Singapore financial services and removes the regulatory opaqueness that deters NRI institutional investment in Indian domestic commercial property.",
          "For NRIs who are considering a structured India re-engagement — setting up an IFSC-registered entity to manage offshore assets, establish a family office, or provide financial advisory services — GIFT City commercial property becomes both an operational requirement and an investment. PIKORUA's advisory covers the real estate dimension; our IFSCA-specialist CA partner network covers the regulatory setup.",
        ],
      },
      {
        heading: "FEMA Compliance for NRI GIFT City Purchases",
        body: [
          "Commercial property in GIFT City's IFSC zone is purchaseable by NRIs under standard FEMA provisions — no special RBI approval required for built commercial property. Payment through NRE or NRO account. If the NRI is also registering an IFSC entity, the property can be purchased and leased to the NRI's own IFSC entity — creating a structuring option that provides both property income and business accommodation.",
          "For commercial property purchases exceeding USD 5 million equivalent, an advance remittance form may be required. PIKORUA's CA partners handle all FEMA documentation for NRI commercial transactions.",
        ],
      },
    ],
    faqs: [
      { question: "Can NRIs buy commercial property in GIFT City?", answer: "Yes. NRIs can purchase commercial property in GIFT City's IFSC zone under standard FEMA provisions — payment from NRE/NRO accounts, no RBI approval required for standard transactions. NRIs can also register IFSC entities to operate from GIFT City, making commercial property both an investment and a business asset." },
      { question: "What is the return on GIFT City commercial investment for NRIs?", answer: "Gross yield: 6.2–7.5% from IFSC-regulated tenants. Annual capital appreciation: 10–12% driven by GIFT City expansion. Total return over 5 years: 18–25% compounded — materially above FD or gold alternatives. NRI tax on rental income: 30% TDS on rental income (refundable against tax return filing), 20% LTCG with indexation on sale after 24 months." },
    ],
    relatedListingHrefs: ["/p/gift-city/office-space", "/p/sg-highway/luxury-flats/for-investment", "/nri/usa/property-investment-ahmedabad"],
    relatedHubSlugs: ["investment-guide", "commercial-property", "nri-property-investment-guide-ahmedabad"],
    marketSignals: ["NRI IFSC entity registrations FY26: 45+ new entities.", "GIFT City NRI investment pipeline: ₹2,400+ Cr (PIKORUA estimate).", "SG Highway GIFT City commuter premium: 20–28% rental uplift."],
    publishedAt: "2026-07-21",
    category: "gift-city",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// COMBINED EXPORTS AND LOOKUPS
// ─────────────────────────────────────────────────────────────────────────────

/** Every hub page that is live. Pages merged into another URL (page-merges.ts) are left out. */
export const ALL_CONTENT_HUB_PAGES: ContentHubPage[] = [
  ...COMPARISON_PAGES,
  ...INVESTMENT_PAGES,
  ...EDUCATION_PAGES,
  ...GIFT_CITY_PAGES,
  ...PHASE_14_CONTENT_PAGES,
].filter((page) => !PAGE_MERGES[page.href]);

export const CONTENT_HUB_MAP = new Map(
  ALL_CONTENT_HUB_PAGES.map((p) => [p.slug, p])
);

export function getContentHubPage(slug: string): ContentHubPage | undefined {
  return CONTENT_HUB_MAP.get(slug);
}

export function getContentHubsByPrefix(prefix: ContentHubPrefix): ContentHubPage[] {
  return ALL_CONTENT_HUB_PAGES.filter((p) => p.prefix === prefix);
}

export function getRelatedContentHubs(page: ContentHubPage): ContentHubPage[] {
  return page.relatedHubSlugs
    .map((slug) => CONTENT_HUB_MAP.get(slug))
    .filter((p): p is ContentHubPage => p !== undefined);
}
