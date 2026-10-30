/**
 * nri-geo-pages.ts
 *
 * 10x Programmatic SEO — Layer 6: NRI Geo Pages (Country × Intent)
 *
 * URL pattern:  /nri/[country]/[slug] (served by src/app/nri/[slug]/[detail]/page.tsx —
 *               the folder's own param names are [slug]/[detail] to satisfy Next.js's
 *               requirement that sibling dynamic routes share a param name, but the
 *               public URL shape is still country/slug)
 * Examples:     /nri/usa/luxury-flats-ahmedabad
 *               /nri/dubai/property-investment-ahmedabad
 *
 * These are in addition to the existing flat NRI advisory pages
 * (e.g. /buy-property-in-ahmedabad-from-usa) that live in geo.ts.
 * The new country/slug structure targets more specific search queries
 * and provides the `/nri/[country]/` URL cluster that search engines
 * associate with country-specific NRI property content.
 *
 * Exchange rates and legal notes are kept accurate as of July 2026.
 * Each page carries:
 *  - Currency context for the target country
 *  - Legal guide (FEMA, payment routing)
 *  - Remote buying process
 *  - Country-specific FAQ set
 *  - bodyContent for market intelligence depth
 */

import type { GeoLandingPage, NriExecutionDetails } from "@/lib/data/geo";

const HERO = {
  maruti: "/properties/maruti-360/maruti-360-view.jpg",
  ikebana: "/properties/ikebana/ikebana1.png",
  capstone: "/properties/capstone/capstone-1-courtyard.jpg",
  anurita: "/properties/anurita/anurita-1.jpg",
  kalrav: "/properties/kalrav-alpines/kalrav-alpines-1.jpg",
  pashmina: "/properties/pashmina/pashmina.jpg",
};

const NRI_BASE: NriExecutionDetails = {
  servicePromise:
    "One trusted Ahmedabad team for project shortlisting, video inspections, developer verification, negotiation support, documentation coordination, registration assistance and post-purchase property management.",
  callingHours:
    "Global video calls available by appointment. Share your preferred time zone and window — the Ahmedabad team confirms a WhatsApp, Zoom, or Google Meet slot.",
  timeZoneContact:
    "US clients: EST/PST windows served. UK clients: GMT/BST windows served. UAE/GCC clients: GST windows served.",
  documentationChecklist: [
    "Passport and PAN card",
    "OCI, visa, or residency status document",
    "Overseas address proof and Indian address proof if available",
    "NRE/NRO account details and source-of-funds note",
    "Recent photographs and contact details",
    "Power of Attorney draft if a local representative will sign",
  ],
  videoConsultation:
    "Private video consultation with shortlist screen-share, corridor comparison, and next-step documentation notes.",
  testimonialsNote:
    "Country-specific client references are shared privately only where clients have approved. Public reviews available on the testimonials page.",
  whatsappFormat: "+91 6354 359 222",
  internationalPhoneFormat: "+91 6354 359 222 from overseas phones",
  commonQuestions: [
    "Can my family in Ahmedabad inspect the shortlist before I travel?",
    "Can documentation move ahead if I am not physically in India?",
    "Which payment route should I confirm with my bank before booking?",
  ],
};

const LEGAL_NOTE =
  "Last editorial update: July 2026. This page is for advisory education only and should be reviewed by a qualified Indian lawyer, chartered accountant, or bank officer before any legal, tax, remittance, or registration action.";

export const NRI_GEO_PAGES: GeoLandingPage[] = [
  // ─── USA — Luxury Flats ────────────────────────────────────────────────────
  {
    kind: "nri",
    slug: "usa-luxury-flats-ahmedabad",
    href: "/nri/usa/luxury-flats-ahmedabad",
    label: "NRI USA — Luxury Flats Ahmedabad",
    eyebrow: "USA NRI · Luxury Advisory",
    title: "Luxury Flats in Ahmedabad for USA-Based NRIs — Remote Purchase Guide",
    h1: "Luxury Flats in Ahmedabad for USA NRIs",
    description:
      "Complete guide for USA-based NRIs buying luxury flats in Ahmedabad — currency conversion, FEMA compliance, NRE/NRO payment, virtual tours & remote purchase process.",
    heroImage: HERO.maruti,
    categories: ["apartment", "penthouse"],
    matchKeywords: ["nri usa luxury flat", "usa nri ahmedabad property", "american nri flat ahmedabad"],
    seoKeywords: [
      "luxury flats Ahmedabad for USA NRI",
      "NRI USA buy luxury flat Ahmedabad",
      "USA NRI property Ahmedabad",
      "buy flat in Ahmedabad from USA",
    ],
    relatedSlugs: [
      "usa-property-investment-ahmedabad",
      "ahmedabad-luxury-flats",
      "ahmedabad-premium-homes-for-nri",
      "buy-property-in-ahmedabad-from-usa",
    ],
    nriDetails: {
      ...NRI_BASE,
      reviewNote: LEGAL_NOTE,
      heading: "USA NRI — Ahmedabad Luxury Flat Advisory",
      callingHours: "USA clients: EST morning and PST afternoon slots available by appointment (Ahmedabad team covers 6 PM–midnight IST for US overlap).",
      commonQuestions: [
        "Can I route funds from my US bank account through my NRE account in India?",
        "Can I sign the sale agreement using a Power of Attorney from the US?",
        "Do I need to file any US FBAR or FATCA disclosures when buying Indian property?",
      ],
    },
    collectionHref: "/contact?purpose=nri-usa",
    intro:
      "USA-based NRIs represent the largest overseas buyer community for Ahmedabad luxury flats — driven by Gujarati diaspora connections, India allocation strategies, and the desire for a flagship family home in Ahmedabad. PIKORUA Realty provides end-to-end remote purchase support for US-based buyers across all time zones.",
    marketSignals: [
      "USA-based NRIs are the largest single source of NRI enquiries for Ahmedabad luxury residential — driven by large Gujarati community in New Jersey, California, Texas, and Georgia.",
      "USD/INR exchange rate movements create periodic windows when Ahmedabad property offers exceptional dollar-denominated value.",
      "US NRIs often prefer ready-to-move or near-possession properties to eliminate construction risk during remote ownership.",
    ],
    idealFor: [
      "Gujarati NRIs in USA seeking a flagship luxury family home in Ahmedabad.",
      "US-based investors diversifying into India residential real estate with reliable advisory support.",
      "NRI families purchasing an Ahmedabad home for parents or future return plans.",
    ],
    faqs: [
      {
        question: "Can USA-based NRIs buy luxury flats in Ahmedabad?",
        answer:
          "Yes. USA-based NRIs can purchase residential property in India under India's general FEMA framework using NRE/NRO account funds sourced from inward remittance. Agricultural land and plantation property require separate permissions. PIKORUA Realty coordinates the full purchase process remotely.",
      },
      {
        question: "How can I pay for a luxury flat in Ahmedabad from the USA?",
        answer:
          "Payments for Ahmedabad property purchases should be routed through your NRE or NRO account via inward remittance from a US bank account. SWIFT transfer to an Indian NRE account is the standard method. Your Indian CA or bank should confirm the specific payment structure for your transaction.",
      },
      {
        question: "What is the USD to INR exchange rate advantage for Ahmedabad property?",
        answer:
          "The USD/INR rate (approximately ₹83–85 per USD in mid-2026) means a US$500,000 investment translates to approximately ₹4.1–4.2 Cr in Ahmedabad — accessing premium 3 BHK luxury flats in corridors like Thaltej and Bodakdev. Your exact rate depends on the remittance bank and timing.",
      },
      {
        question: "Do US NRIs need to disclose Indian property on US tax returns?",
        answer:
          "US persons (citizens, green card holders, tax residents) may have reporting obligations for foreign property (FBAR, FATCA, Form 8938). We strongly recommend consulting a US-qualified CPA with India expertise before purchase. PIKORUA Realty does not provide US tax advice.",
      },
      {
        question: "Can I complete an Ahmedabad property purchase from the USA without travelling to India?",
        answer:
          "Yes, with a Power of Attorney (POA) authorising a trusted representative in Ahmedabad to sign the sale agreement and attend registration. The POA must be notarised in the USA and apostilled before use in India. PIKORUA Realty coordinates the POA process and recommends legal counsel.",
      },
    ],
    bodyContent: [
      "### The USA NRI Buying Journey",
      "Buying a luxury flat in Ahmedabad from the USA is a fully manageable remote process with the right advisory support. The typical journey has six stages: (1) shortlisting via virtual tour and corridor analysis; (2) legal due diligence (title, RERA, encumbrance); (3) POA drafting and apostille in the US; (4) NRE account inward remittance confirmation with your US and Indian banks; (5) sale agreement review by an Indian property lawyer; and (6) registration (handled by POA holder) and possession.",
      "### Currency Conversion Context",
      "The USD/INR exchange rate creates a dynamic opportunity window for US-based NRI buyers. When the rupee weakens against the dollar, US NRIs receive more rupees per dollar — effectively reducing the dollar-denominated cost of Ahmedabad property. A ₹4 Cr luxury flat at ₹84/USD costs approximately US$476,000. A 5% rupee depreciation (to ₹88/USD) would reduce the dollar cost to approximately US$454,000 for the same property — a meaningful difference for high-value transactions.",
      "### US FBAR and FATCA Considerations",
      "US persons who own or control foreign financial accounts or foreign property above certain thresholds may have US reporting obligations. This is a complex area that requires US-qualified tax advice. PIKORUA Realty strongly recommends engaging a US CPA with India expertise before any payment commitment. We can introduce qualified CA contacts for the India tax side; US tax counsel is the buyer's responsibility.",
      "### NRI Property Management from the USA",
      "One of the most common concerns for US-based NRI buyers is how to manage an Ahmedabad property remotely. PIKORUA Realty provides referrals to qualified property management firms in Ahmedabad who handle tenant sourcing, rent collection, maintenance coordination, society dealings, and periodic inspections on behalf of overseas owners. The management fee is typically 8–10% of monthly rental income.",
    ],
  },

  // ─── USA — Property Investment ─────────────────────────────────────────────
  {
    kind: "nri",
    slug: "usa-property-investment-ahmedabad",
    href: "/nri/usa/property-investment-ahmedabad",
    label: "NRI USA — Property Investment Ahmedabad",
    eyebrow: "USA NRI · Investment Advisory",
    title: "Property Investment in Ahmedabad for USA NRIs — ROI & India Allocation",
    h1: "Property Investment in Ahmedabad for USA-Based NRIs",
    description:
      "Ahmedabad property investment guide for USA NRIs — ROI analysis, India vs USA comparison, currency advantage, rental yield & capital appreciation data by PIKORUA Realty.",
    heroImage: HERO.anurita,
    categories: ["apartment", "investment"],
    matchKeywords: ["usa nri property investment ahmedabad", "nri invest ahmedabad from usa", "american nri investment india"],
    seoKeywords: [
      "property investment Ahmedabad USA NRI",
      "Ahmedabad real estate investment for US NRI",
      "USA NRI invest India property",
    ],
    relatedSlugs: ["usa-luxury-flats-ahmedabad", "ahmedabad-high-roi-investment-properties", "ahmedabad-investment-properties", "buy-property-in-ahmedabad-from-usa"],
    nriDetails: {
      ...NRI_BASE,
      reviewNote: LEGAL_NOTE,
      heading: "USA NRI — Ahmedabad Investment Advisory",
      commonQuestions: [
        "How does Ahmedabad real estate ROI compare to US investment alternatives?",
        "What is the best investment corridor in Ahmedabad for US NRIs?",
        "How do I repatriate investment returns from India to the USA?",
      ],
    },
    collectionHref: "/contact?purpose=nri-usa-investment",
    intro:
      "USA-based NRI investors have a unique opportunity in Ahmedabad real estate — combining India's growth-market capital appreciation with the USD/INR currency advantage, strong diaspora rental demand, and reliable PIKORUA advisory support for remote investment management.",
    marketSignals: [
      "For US buyers, currency movements can increase or reduce the USD value of an Indian property. Assess currency exposure alongside property-level costs, verified rent, transaction evidence, and remittance requirements.",
      "US NRI investors who entered Iscon Ambli Road or Sindhu Bhavan Road in 2019–2021 have achieved 40–60% capital appreciation in rupee terms.",
    ],
    idealFor: [
      "US NRI investors seeking India real estate allocation with advisory support.",
      "NRIs comparing Ahmedabad investment ROI against US alternatives (stocks, REITs, rental property).",
      "Family offices managing multi-country NRI investment portfolios.",
    ],
    faqs: [
      {
        question: "Is Ahmedabad real estate a good investment for USA NRIs?",
        answer:
          "For US NRIs, compare a specific Ahmedabad property with dated comparable transactions, verified rent, purchase and exit costs, currency conversion, remittance rules, and the investor's holding period. Past local price changes do not establish a future INR or USD return.",
      },
      {
        question: "Can USA NRIs repatriate profits from Ahmedabad property sales?",
        answer:
          "Yes. Under FEMA, NRIs can repatriate sale proceeds up to the original investment amount made through NRE/NRO accounts, subject to conditions and tax compliance. A CA and an authorised dealer bank should be involved before any repatriation. US tax on repatriated Indian property gains must also be confirmed with a US-qualified tax advisor.",
      },
    ],
    bodyContent: [
      "### Ahmedabad vs US Real Estate: An NRI Comparison",
      "US NRI investors face a genuine choice between Indian and US real estate. US real estate offers dollar exposure, mature market data, and established legal frameworks — but also high entry prices (especially in coastal cities), property taxes, vacancy risk, and management challenges. Ahmedabad offers India growth-market exposure, family utility, potential currency appreciation, and a growing institutional rental market — but also FEMA compliance complexity, remote management requirements, and builder risk.",
      "### The USD/INR Investment Angle",
      "For US NRIs, currency conversion can increase or reduce a property's USD value. Purely hypothetical arithmetic, not a forecast: a ₹4 crore property at ₹84/USD converts to about US$476,190; ₹5 crore at ₹80/USD converts to US$625,000. This simplified comparison excludes transaction costs, taxes, remittance fees, and timing; property prices and exchange rates can move either way.",
      "### Rental Income from the USA",
      "PIKORUA Realty's network of Ahmedabad property managers enables US NRI investors to receive rental income into their NRO account without requiring a single India visit. Monthly rental income is transferred to the NRO account and can be repatriated to the US within FEMA limits after applicable Indian tax deduction (TDS). The net rental yield after management fees and TDS is typically 1.5–3.5% for prime western Ahmedabad luxury apartments.",
    ],
  },

  // ─── UK ────────────────────────────────────────────────────────────────────
  {
    kind: "nri",
    slug: "uk-luxury-properties-ahmedabad",
    href: "/nri/uk/luxury-properties-ahmedabad",
    label: "NRI UK — Luxury Properties Ahmedabad",
    eyebrow: "UK NRI · Luxury Advisory",
    title: "Luxury Properties in Ahmedabad for UK-Based NRIs — Complete Buying Guide",
    h1: "Luxury Properties in Ahmedabad for UK NRIs",
    description:
      "Complete guide for UK-based NRIs buying luxury property in Ahmedabad — GBP/INR currency, FEMA compliance, NRE/NRO payments, virtual tours & remote purchase support.",
    heroImage: HERO.capstone,
    categories: ["apartment", "penthouse", "villa"],
    matchKeywords: ["uk nri luxury property ahmedabad", "british nri ahmedabad property", "nri uk ahmedabad flat"],
    seoKeywords: [
      "luxury properties Ahmedabad UK NRI",
      "NRI UK buy property Ahmedabad",
      "UK NRI Ahmedabad real estate",
      "buy flat Ahmedabad from UK",
    ],
    relatedSlugs: ["uk-buy-property-ahmedabad", "ahmedabad-luxury-flats", "ahmedabad-premium-homes-for-nri", "buy-property-in-ahmedabad-from-uk"],
    nriDetails: {
      ...NRI_BASE,
      reviewNote: LEGAL_NOTE,
      heading: "UK NRI — Ahmedabad Luxury Property Advisory",
      callingHours: "UK clients: GMT/BST afternoon and evening slots available (IST overlap covers 2 PM–7 PM IST for UK morning windows).",
      commonQuestions: [
        "Can I use SWIFT transfer from my UK bank to my NRE account?",
        "Do I need to pay UK Stamp Duty Land Tax on Indian property?",
        "Can I sign using a UK-apostilled Power of Attorney?",
      ],
    },
    collectionHref: "/contact?purpose=nri-uk",
    intro:
      "The UK hosts one of the world's largest Gujarati diaspora communities — with particularly strong concentrations in Leicester, London, Birmingham, and Manchester. PIKORUA Realty serves UK-based NRI buyers seeking luxury properties in Ahmedabad with full remote buying support across GMT time zones.",
    marketSignals: [
      "UK-based NRIs represent the second-largest NRI buyer community for Ahmedabad luxury property after USA.",
      "GBP/INR exchange rate (approximately ₹107–112 per GBP in mid-2026) provides strong purchasing power for UK buyers entering Ahmedabad's premium segment.",
    ],
    idealFor: [
      "UK-based Gujarati NRIs seeking a luxury family home in Ahmedabad.",
      "UK NRI investors diversifying into India real estate with full remote support.",
      "NRI families purchasing parents' accommodation or a future return base.",
    ],
    faqs: [
      {
        question: "Can UK-based NRIs buy luxury property in Ahmedabad?",
        answer:
          "Yes. UK-based NRIs (Indian passport holders, OCI card holders, and PIOs in some cases) can purchase residential property in Ahmedabad under India's FEMA framework using NRE/NRO account funds. PIKORUA Realty coordinates the full purchase process for UK clients.",
      },
      {
        question: "What is the GBP equivalent of Ahmedabad luxury flat prices?",
        answer:
          "A ₹3 crore purchase price converts to a GBP amount that changes with the exchange rate and transaction date. Compare purchase, remittance, ownership, tax, and exit costs; do not treat currency conversion as a return forecast.",
      },
      {
        question: "Do I need to pay any UK tax when buying Indian property?",
        answer:
          "Purchasing Indian property generally does not trigger UK tax at the point of purchase. However, rental income from Indian property must be declared to HMRC as foreign income, and capital gains on sale may be subject to UK CGT depending on your UK tax residency status. Consult a UK accountant with India expertise.",
      },
    ],
    bodyContent: [
      "### The UK NRI Buying Context",
      "UK-based NRIs should account for GBP/INR movements, which can change the cost and exit value of an Ahmedabad purchase. A ₹3 crore purchase price converts to a GBP amount that changes with the exchange rate and transaction date. Compare the full purchase, remittance, ownership, tax, and exit costs; do not treat a currency conversion as a return forecast.",
      "### UK NRI Legal Framework",
      "UK-based NRIs with Indian passports or OCI cards can buy residential property in India under the standard FEMA framework. UK NRIs who have British citizenship (not OCI) may face additional restrictions — legal advice from a qualified Indian property lawyer is essential before proceeding. All payments should route through NRE/NRO accounts via SWIFT remittance from the UK bank. UK-apostilled Powers of Attorney are valid for Indian property registration.",
      "### HMRC Tax Considerations",
      "UK tax residents who own Indian rental property must declare rental income on their UK self-assessment return as foreign income. Capital gains from Indian property may also have UK tax consequences for UK tax residents. Treatment depends on current rules, residence, the transaction, and any treaty relief; obtain qualified UK and Indian tax advice and check current HMRC guidance before a sale. Double Taxation Agreement (DTA) between India and UK provides some relief against double taxation. A UK accountant with India expertise should be engaged before any transaction.",
    ],
  },
  {
    kind: "nri",
    slug: "uk-buy-property-ahmedabad",
    href: "/nri/uk/buy-property-ahmedabad",
    label: "NRI UK — Buy Property Ahmedabad",
    eyebrow: "UK NRI · Buyer Guide",
    title: "Buy Property in Ahmedabad from UK — Complete NRI Process Guide",
    h1: "How to Buy Property in Ahmedabad from the UK",
    description:
      "Step-by-step guide for UK-based NRIs buying property in Ahmedabad — remote process, documentation, UK apostille, NRE/NRO payments & PIKORUA advisory support.",
    heroImage: HERO.kalrav,
    categories: ["apartment", "penthouse", "villa"],
    matchKeywords: ["buy property ahmedabad from uk", "uk nri buy property india", "nri uk property purchase"],
    seoKeywords: [
      "buy property Ahmedabad from UK",
      "UK NRI buy Ahmedabad property",
      "how to buy flat in Ahmedabad from UK",
    ],
    relatedSlugs: ["uk-luxury-properties-ahmedabad", "ahmedabad-premium-homes-for-nri", "ahmedabad-property-buying-guide", "buy-property-in-ahmedabad-from-uk"],
    nriDetails: { ...NRI_BASE, reviewNote: LEGAL_NOTE },
    collectionHref: "/contact?purpose=nri-uk",
    intro: "Buying property in Ahmedabad from the UK is a structured, remote process that PIKORUA Realty has supported for multiple UK-based NRI buyers — covering virtual tours, legal coordination, UK-apostilled POA, NRE account routing, and possession handover.",
    marketSignals: ["UK-based NRI buyers have completed Ahmedabad property transactions entirely remotely in 8–14 weeks with the right advisory support.", "UK bank SWIFT transfers to Indian NRE accounts clear within 2–5 business days for major UK high street banks."],
    idealFor: ["UK NRIs who need a complete, guided process for their first Ahmedabad property purchase.", "UK-based families purchasing an Ahmedabad home for parents or future return.", "UK NRI investors who want confirmed steps before committing capital."],
    faqs: [
      { question: "What is the step-by-step process for a UK NRI to buy property in Ahmedabad?", answer: "Key steps: (1) Shortlist via virtual tours; (2) Legal due diligence; (3) UK-notarised and apostilled POA; (4) SWIFT transfer from UK bank to Indian NRE account; (5) Sale agreement review by Indian lawyer; (6) Registration by POA holder; (7) Possession and handover. PIKORUA Realty coordinates all Ahmedabad-side steps." },
    ],
    bodyContent: [
      "### The UK NRI Process — Step by Step",
      "**Step 1 — Shortlist**: PIKORUA Realty conducts virtual tours of 3–5 shortlisted properties, covering approach road, building lobby, parking, layout, views, and neighbourhood context. UK buyers receive detailed WhatsApp and email reports after each tour.",
      "**Step 2 — Due Diligence**: An Indian property lawyer reviews title, RERA registration, encumbrance certificate, and sale agreement terms on the buyer's behalf.",
      "**Step 3 — POA**: The buyer executes a Power of Attorney document in the UK, notarises it with a UK solicitor, and apostilles it (through the UK Foreign Commonwealth & Development Office). The apostilled POA is then used by the buyer's representative in Ahmedabad to sign the sale agreement and attend registration.",
      "**Step 4 — Payment**: The buyer opens or uses an existing NRE account in India and routes the purchase amount via SWIFT transfer from their UK bank. The NRE account bank provides a FIRC (Foreign Inward Remittance Certificate) which is an important document for future repatriation.",
      "**Steps 5–7**: Sale agreement signing, stamp duty, registration (by POA holder in Ahmedabad), possession, and utility/society transfer.",
    ],
  },

  // ─── Dubai / UAE ────────────────────────────────────────────────────────────
  {
    kind: "nri",
    slug: "dubai-luxury-flats-ahmedabad",
    href: "/nri/dubai/luxury-flats-ahmedabad",
    label: "NRI Dubai — Luxury Flats Ahmedabad",
    eyebrow: "Dubai NRI · Luxury Advisory",
    title: "Luxury Flats in Ahmedabad for Dubai & UAE NRIs — Property Buying Guide",
    h1: "Luxury Flats in Ahmedabad for Dubai NRIs",
    description:
      "Complete guide for Dubai and UAE-based NRIs buying luxury flats in Ahmedabad — AED/INR currency, FEMA compliance, remote purchase process & PIKORUA advisory support.",
    heroImage: HERO.maruti,
    categories: ["apartment", "penthouse"],
    matchKeywords: ["dubai nri luxury flat ahmedabad", "uae nri ahmedabad property", "nri dubai ahmedabad flat"],
    seoKeywords: [
      "luxury flats Ahmedabad Dubai NRI",
      "NRI Dubai buy luxury flat Ahmedabad",
      "UAE NRI property Ahmedabad",
      "buy flat Ahmedabad from Dubai",
    ],
    relatedSlugs: ["dubai-property-investment-ahmedabad", "ahmedabad-luxury-flats", "ahmedabad-premium-homes-for-nri", "buy-property-in-ahmedabad-from-uae"],
    nriDetails: {
      ...NRI_BASE,
      reviewNote: LEGAL_NOTE,
      heading: "Dubai NRI — Ahmedabad Luxury Flat Advisory",
      callingHours: "UAE clients: GST slots available. IST is 1.5 hours ahead of UAE — convenient overlap for morning UAE / morning India calls.",
      commonQuestions: [
        "Can I remit from my UAE bank account directly to an Indian NRE account?",
        "Does UAE property income need to be declared in India?",
        "Can I use my UAE-notarised Power of Attorney for Indian property registration?",
      ],
    },
    collectionHref: "/contact?purpose=nri-dubai",
    intro:
      "Dubai is home to one of the largest Gujarati NRI communities in the world — and is also Ahmedabad's closest major international gateway (approximately 3 hours by direct flight). UAE-based NRIs enjoy the shortest physical access to Ahmedabad of any overseas diaspora community, making the remote-to-visit transition simpler than for US or UK buyers.",
    marketSignals: [
      "UAE-based NRIs are the third-largest NRI buyer community for Ahmedabad luxury property.",
      "AED/INR rate (approximately ₹22.6 per AED in mid-2026) means a AED 1.5 million Dubai property budget translates to approximately ₹3.4 Cr in Ahmedabad.",
      "Dubai NRIs often purchase Ahmedabad properties for family members and as a long-term India retirement base.",
    ],
    idealFor: [
      "Dubai-based Gujarati NRIs seeking a luxury family home in Ahmedabad.",
      "UAE NRI investors building an India real estate portfolio.",
      "Families purchasing parents' accommodation or a base for upcoming India moves.",
    ],
    faqs: [
      {
        question: "Can Dubai-based NRIs buy luxury flats in Ahmedabad?",
        answer:
          "Yes. UAE-based NRIs with Indian citizenship or OCI status can purchase residential property in Ahmedabad under India's FEMA framework. Payments should route through NRE/NRO accounts via SWIFT from a UAE bank. PIKORUA Realty coordinates the full remote purchase.",
      },
      {
        question: "How long does it take to fly from Dubai to Ahmedabad?",
        answer:
          "Dubai to Ahmedabad is approximately 3 hours by direct flight — one of the shortest international routes for any NRI community. This makes physical inspections and registration visits highly practical for UAE-based NRI buyers.",
      },
      {
        question: "What is AED equivalent for luxury flats in Ahmedabad?",
        answer:
          "At approximately AED 1 = ₹22.6 (mid-2026), a ₹3 Cr luxury flat in Ahmedabad costs approximately AED 1.33 million — well below Dubai's equivalent luxury apartment pricing of AED 2–3+ million.",
      },
    ],
    bodyContent: [
      "### The Dubai NRI Advantage",
      "Dubai-based NRI buyers have a structural advantage over US and UK buyers when purchasing Ahmedabad luxury property — the 3-hour flight makes a physical inspection visit completely practical. A Dubai NRI can fly to Ahmedabad on a Friday morning, inspect 2–3 shortlisted properties with PIKORUA Realty's team, attend a developer meeting, and be back in Dubai by Sunday evening — without using more than a long weekend.",
      "### AED/INR Context",
      "At approximately ₹22.6 per AED (mid-2026), Ahmedabad's luxury property market offers exceptional AED-denominated value versus Dubai. A ₹3 Cr Ahmedabad 3 BHK luxury flat costs approximately AED 1.33 million — comparable to a mid-range Dubai studio or 1 BHK in most areas. For UAE NRIs who understand the cost of property in Dubai, Ahmedabad's premium residential corridor pricing represents remarkable relative value.",
      "### UAE-Apostilled POA",
      "UAE-notarised and apostilled Powers of Attorney are accepted for Indian property transactions. The UAE Ministry of Foreign Affairs provides attestation services. After UAE MoFA attestation, the POA should be attested at the Indian Embassy in Abu Dhabi or Consulate in Dubai, and then used by the buyer's representative in Ahmedabad for signing and registration.",
    ],
  },
  {
    kind: "nri",
    slug: "dubai-property-investment-ahmedabad",
    href: "/nri/dubai/property-investment-ahmedabad",
    label: "NRI Dubai — Property Investment Ahmedabad",
    eyebrow: "Dubai NRI · Investment Advisory",
    title: "Property Investment in Ahmedabad for Dubai NRIs — India vs UAE Comparison",
    h1: "Property Investment in Ahmedabad for Dubai-Based NRIs",
    description:
      "Ahmedabad property investment guide for Dubai NRIs — India vs UAE real estate ROI, AED/INR analysis, rental yield, capital appreciation & PIKORUA advisory.",
    heroImage: HERO.anurita,
    categories: ["apartment", "investment"],
    matchKeywords: ["dubai nri property investment ahmedabad", "uae nri investment india", "invest ahmedabad from dubai"],
    seoKeywords: [
      "property investment Ahmedabad Dubai NRI",
      "Ahmedabad real estate for UAE NRI",
      "Dubai NRI invest Ahmedabad",
    ],
    relatedSlugs: ["dubai-luxury-flats-ahmedabad", "ahmedabad-investment-properties", "ahmedabad-high-roi-investment-properties", "ahmedabad-vs-dubai-real-estate-investment"],
    nriDetails: { ...NRI_BASE, reviewNote: LEGAL_NOTE },
    collectionHref: "/contact?purpose=nri-dubai-investment",
    intro:
      "Dubai NRIs considering Ahmedabad property investment have a unique comparison to make — a market they understand directly (Dubai) against a market with strong family connections (Ahmedabad). PIKORUA Realty provides an honest, data-backed comparison to help Dubai NRIs make informed India allocation decisions.",
    marketSignals: [
      "Compare specific Indian and Dubai properties using dated transaction evidence, rental cash flows, financing, taxes, currency, liquidity, and ownership costs; historic market movement does not predict future returns.",
      "Indian property ownership provides family utility, cultural connection, and India wealth allocation that AED-denominated Dubai property cannot.",
    ],
    idealFor: [
      "Dubai NRIs deciding whether to allocate their next property investment to India or UAE.",
      "UAE-based investors comparing Ahmedabad ROI against Dubai residential alternatives.",
      "NRI families who already own Dubai property and want to diversify into Ahmedabad.",
    ],
    faqs: [
      { question: "Is it better to invest in Ahmedabad or Dubai real estate for NRIs?", answer: "For family use, India connection, and long-term return-to-India planning: Ahmedabad. For dollar/AED income exposure, international tenant demand, and easier foreign ownership: Dubai. Most UAE-based Gujarati NRIs who can afford both view them as complementary — one for family roots, one for international yield." },
    ],
    bodyContent: [
      "### Ahmedabad vs Dubai: NRI Investment Comparison",
      "**Ahmedabad advantages**: Rupee appreciation potential, family utility, cultural connection, India growth-market exposure, strong diaspora buyer demand for exit liquidity, lower entry prices in AED terms.",
      "**Dubai advantages**: AED income stability, foreign freehold ownership, strong international rental demand, tax-free income structure, established property management ecosystem.",
      "**The NRI's recommendation**: PIKORUA Realty's view is that most UAE-based Gujarati NRIs should not treat this as a binary choice. An Ahmedabad property provides the family base, cultural anchor, and India wealth allocation that Dubai property cannot offer. A Dubai property provides the AED income and international tenant demand that Ahmedabad cannot fully replicate. The ideal allocation depends on personal financial goals, risk appetite, and India return timeline.",
    ],
  },

  // ─── Canada ─────────────────────────────────────────────────────────────────
  {
    kind: "nri",
    slug: "canada-luxury-properties-ahmedabad",
    href: "/nri/canada/luxury-properties-ahmedabad",
    label: "NRI Canada — Luxury Properties Ahmedabad",
    eyebrow: "Canada NRI · Luxury Advisory",
    title: "Luxury Properties in Ahmedabad for Canada NRIs — Remote Buying Guide",
    h1: "Luxury Properties in Ahmedabad for Canada-Based NRIs",
    description:
      "Complete guide for Canada-based NRIs buying luxury property in Ahmedabad — CAD/INR currency, FEMA compliance, remote purchase process & PIKORUA advisory support.",
    heroImage: HERO.capstone,
    categories: ["apartment", "penthouse", "villa"],
    matchKeywords: ["canada nri ahmedabad property", "canadian nri luxury flat ahmedabad", "nri canada india property"],
    seoKeywords: [
      "luxury properties Ahmedabad Canada NRI",
      "NRI Canada buy property Ahmedabad",
      "Canadian NRI Ahmedabad real estate",
    ],
    relatedSlugs: ["ahmedabad-luxury-flats", "ahmedabad-premium-homes-for-nri", "buy-property-in-ahmedabad-from-abroad"],
    nriDetails: {
      ...NRI_BASE,
      reviewNote: LEGAL_NOTE,
      heading: "Canada NRI — Ahmedabad Property Advisory",
      callingHours: "Canada clients: EST (Toronto/Montreal) and PST (Vancouver) slots available by appointment.",
      commonQuestions: [
        "Can I use my Canadian bank SWIFT transfer to an NRE account in India?",
        "Do I need to report Indian property on Canadian T1 return?",
        "Can a Canada-apostilled POA be used for Indian property registration?",
      ],
    },
    collectionHref: "/contact?purpose=nri-canada",
    intro:
      "Canada has a large and growing Gujarati NRI community — particularly in Toronto, Vancouver, and Calgary. PIKORUA Realty serves Canada-based NRI buyers with full remote advisory support, virtual tours, and coordinated purchase process management across IST/EST and IST/PST time zones.",
    marketSignals: [
      "Canada-based NRI buyers are the fourth-largest overseas community for Ahmedabad luxury residential purchases.",
      "CAD/INR rate (approximately ₹61–63 per CAD in mid-2026) provides Canadian NRIs with strong purchasing power in Ahmedabad's premium market.",
    ],
    idealFor: [
      "Canadian Gujarati NRIs building an Ahmedabad base for family visits and future return.",
      "Canada-based investors diversifying into India real estate with PIKORUA advisory support.",
      "NRI families purchasing parents' accommodation in Ahmedabad's premium western corridors.",
    ],
    faqs: [
      {
        question: "Can Canada-based NRIs buy luxury property in Ahmedabad?",
        answer:
          "Yes. Canadian citizens of Indian origin with OCI cards, and Indian passport holders resident in Canada, can purchase residential property in Ahmedabad under India's FEMA framework. Payments should route through NRE/NRO accounts. A Canadian property lawyer and an Indian property lawyer should both be engaged for compliance.",
      },
      {
        question: "What is the CAD equivalent of Ahmedabad luxury property prices?",
        answer:
          "At approximately ₹62 per CAD (mid-2026), a ₹3 Cr luxury flat in Ahmedabad costs approximately CAD 483,000 — significantly below comparable Toronto or Vancouver property pricing.",
      },
    ],
    bodyContent: [
      "### Canada NRI Context",
      "Canadian NRIs purchasing Ahmedabad property benefit from a combination of strong CAD/INR purchasing power and the Indian real estate market's growth trajectory. Toronto and Vancouver property prices — where many Gujarati NRIs are based — are among the highest globally, making Ahmedabad's premium corridor pricing look accessible in comparison.",
      "### Canadian Tax Considerations",
      "Canadian tax residents must report worldwide income, including Indian rental income, to the Canada Revenue Agency (CRA). Capital gains from Indian property sales may also be taxable in Canada. The India-Canada tax treaty provides some relief. Canadian NRIs should engage a Canadian accountant with India expertise before purchasing.",
    ],
  },

  // ─── Australia ───────────────────────────────────────────────────────────────
  {
    kind: "nri",
    slug: "australia-property-investment-ahmedabad",
    href: "/nri/australia/property-investment-ahmedabad",
    label: "NRI Australia — Property Investment Ahmedabad",
    eyebrow: "Australia NRI · Investment Advisory",
    title: "Property Investment in Ahmedabad for Australia NRIs — Complete Guide",
    h1: "Property Investment in Ahmedabad for Australia-Based NRIs",
    description:
      "Complete guide for Australia-based NRIs investing in Ahmedabad property — AUD/INR currency, FEMA compliance, rental yield, capital appreciation & PIKORUA advisory.",
    heroImage: HERO.anurita,
    categories: ["apartment", "investment"],
    matchKeywords: ["australia nri property investment ahmedabad", "australian nri india property", "nri australia ahmedabad"],
    seoKeywords: [
      "property investment Ahmedabad Australia NRI",
      "NRI Australia buy property Ahmedabad",
      "Australian NRI Ahmedabad real estate investment",
    ],
    relatedSlugs: ["ahmedabad-investment-properties", "ahmedabad-luxury-flats", "ahmedabad-premium-homes-for-nri", "buy-property-in-ahmedabad-from-abroad"],
    nriDetails: {
      ...NRI_BASE,
      reviewNote: LEGAL_NOTE,
      heading: "Australia NRI — Ahmedabad Investment Advisory",
      callingHours: "Australia clients: AEST and AEDT slots available. IST is 4.5–5.5 hours behind Australia Eastern time — afternoon IST aligns with morning AEST.",
    },
    collectionHref: "/contact?purpose=nri-australia",
    intro:
      "Australia has a significant Gujarati NRI community — particularly in Melbourne, Sydney, and Brisbane. PIKORUA Realty serves Australia-based NRI investors seeking Ahmedabad residential property with full remote advisory support and AEST/IST time zone-compatible consultation slots.",
    marketSignals: [
      "AUD/INR rate (approximately ₹54–56 per AUD in mid-2026) provides Australian NRIs with competitive purchasing power in Ahmedabad's premium segment.",
      "Australia-based NRI buyers are increasingly active in Ahmedabad's luxury residential market driven by India allocation strategies and family-use planning.",
    ],
    idealFor: [
      "Australian Gujarati NRIs building an Ahmedabad luxury property portfolio.",
      "Australia-based investors comparing India and Australian real estate ROI.",
      "NRI families purchasing Ahmedabad property for parents or future return planning.",
    ],
    faqs: [
      {
        question: "Can Australia-based NRIs invest in Ahmedabad property?",
        answer:
          "Yes. Indian-origin buyers with Australian citizenship or permanent residency who hold OCI cards or Indian passports can purchase residential property in Ahmedabad under India's FEMA framework. PIKORUA Realty coordinates full remote purchase support for Australia-based buyers.",
      },
      {
        question: "What is the AUD equivalent of Ahmedabad luxury property prices?",
        answer:
          "At approximately ₹55 per AUD (mid-2026), a ₹3 Cr luxury flat in Ahmedabad costs approximately AUD 545,000 — below Sydney or Melbourne mid-tier apartment pricing but in a prime Ahmedabad corridor with higher appreciation potential.",
      },
    ],
    bodyContent: [
      "### Australia NRI: Ahmedabad as India Allocation",
      "Australia-based NRIs are increasingly viewing Ahmedabad luxury property as their India allocation — a home currency, family-utility asset that complements their Australian property holdings. The typical profile is a Gujarati professional in Melbourne or Sydney who wants to maintain a family connection to Ahmedabad while building long-term India real estate exposure.",
      "### Australian Tax Considerations",
      "Australian tax residents must declare worldwide income including Indian rental income to the Australian Taxation Office (ATO). Capital gains from Indian property sales may attract Australian CGT obligations. The India-Australia tax treaty provides some relief. Australian NRIs should engage an Australian accountant with India expertise before purchasing.",
    ],
  },

  // ─── Singapore ──────────────────────────────────────────────────────────────
  {
    kind: "nri",
    slug: "singapore-luxury-flats-ahmedabad",
    href: "/nri/singapore/luxury-flats-ahmedabad",
    label: "NRI Singapore — Luxury Flats Ahmedabad",
    eyebrow: "Singapore NRI · Luxury Advisory",
    title: "Luxury Flats in Ahmedabad for Singapore-Based NRIs — Buying Guide",
    h1: "Luxury Flats in Ahmedabad for Singapore-Based NRIs",
    description:
      "Guide for Singapore-based NRIs buying luxury flats in Ahmedabad — SGD/INR currency, FEMA compliance, virtual tours, remote purchase process & PIKORUA advisory.",
    heroImage: HERO.maruti,
    categories: ["apartment", "penthouse"],
    matchKeywords: ["singapore nri luxury flat ahmedabad", "singapore nri india property", "nri singapore ahmedabad"],
    seoKeywords: [
      "luxury flats Ahmedabad Singapore NRI",
      "NRI Singapore buy property Ahmedabad",
      "Singapore NRI Ahmedabad real estate",
    ],
    relatedSlugs: ["ahmedabad-luxury-flats", "ahmedabad-premium-homes-for-nri", "buy-property-in-ahmedabad-from-abroad"],
    nriDetails: {
      ...NRI_BASE,
      reviewNote: LEGAL_NOTE,
      heading: "Singapore NRI — Ahmedabad Luxury Flat Advisory",
      callingHours: "Singapore clients: SGT slots available. IST is 2.5 hours behind SGT — convenient overlap for afternoon SGT / afternoon IST calls.",
    },
    collectionHref: "/contact?purpose=nri-singapore",
    intro:
      "Singapore hosts a significant Gujarati and broader Indian professional community — many of whom have family connections to Ahmedabad and Gujarat. PIKORUA Realty serves Singapore-based NRI buyers seeking luxury flats in Ahmedabad with full remote advisory support.",
    marketSignals: [
      "SGD/INR rate (approximately ₹62–64 per SGD in mid-2026) provides Singapore NRIs with strong purchasing power relative to Ahmedabad luxury pricing.",
      "Singapore's 5-hour flight to Ahmedabad (direct) makes physical inspections highly practical for Singapore-based buyers.",
    ],
    idealFor: [
      "Singapore-based Gujarati NRIs purchasing a luxury Ahmedabad home for family visits or future return.",
      "Singapore NRI investors seeking India real estate exposure at competitive SGD pricing.",
    ],
    faqs: [
      { question: "Can Singapore-based NRIs buy luxury flats in Ahmedabad?", answer: "Yes. Singapore-based NRIs with Indian passports or OCI cards can purchase residential property in Ahmedabad under India's FEMA framework. Singapore-notarised and apostilled POAs are accepted for Indian property registration. PIKORUA Realty coordinates full remote purchase support." },
      { question: "What is SGD equivalent for Ahmedabad luxury flat prices?", answer: "At approximately SGD 1 = ₹63 (mid-2026), a ₹3 Cr luxury flat in Ahmedabad costs approximately SGD 476,000 — below comparable Singapore luxury condominium pricing." },
    ],
    bodyContent: [
      "### Singapore NRI: Short Flight, Strong Connection",
      "Singapore-based NRI buyers have a practical advantage over longer-haul diaspora communities — the 5-hour direct flight to Ahmedabad makes a weekend inspection trip completely feasible. Singapore NRIs can coordinate a 3-day Ahmedabad trip around a long weekend to inspect shortlisted properties, meet the PIKORUA Realty advisory team, attend a developer briefing, and still return in time for Monday business.",
      "### Ahmedabad vs Singapore Real Estate",
      "Singapore's luxury residential market — already one of Asia's most expensive — has seen price increases of 30–40% over 2021–2024, with significant ABSD restrictions on foreign buyers. Ahmedabad offers NRIs a fundamentally different value proposition: family-connected assets, India growth-market exposure, and heritage-linked purchasing power without Singapore's foreign buyer restrictions.",
    ],
  },

  // ─── Global ──────────────────────────────────────────────────────────────────
  {
    kind: "nri",
    slug: "global-invest-ahmedabad-real-estate",
    href: "/nri/global/invest-in-ahmedabad-real-estate",
    label: "NRI Global — Invest in Ahmedabad Real Estate",
    eyebrow: "Global NRI · Investment Hub",
    title: "Invest in Ahmedabad Real Estate from Anywhere — Global NRI Guide",
    h1: "Invest in Ahmedabad Real Estate — Global NRI Guide",
    description:
      "Complete guide for global NRIs investing in Ahmedabad real estate — country-specific currency, FEMA framework, remote buying process & PIKORUA Realty advisory for all time zones.",
    heroImage: HERO.capstone,
    categories: ["apartment", "penthouse", "villa", "investment"],
    matchKeywords: ["global nri invest ahmedabad", "nri invest india property", "nri property investment india", "global nri ahmedabad"],
    seoKeywords: [
      "invest in Ahmedabad real estate NRI",
      "global NRI invest Ahmedabad",
      "NRI property investment Ahmedabad global",
      "overseas Indians buy property Ahmedabad",
    ],
    relatedSlugs: [
      "usa-luxury-flats-ahmedabad",
      "uk-luxury-properties-ahmedabad",
      "dubai-luxury-flats-ahmedabad",
      "ahmedabad-investment-properties",
      "ahmedabad-premium-homes-for-nri",
      "nri-property-investment-ahmedabad",
    ],
    nriDetails: {
      ...NRI_BASE,
      reviewNote: LEGAL_NOTE,
      heading: "Global NRI — Ahmedabad Investment Advisory Hub",
      callingHours: "PIKORUA Realty serves NRI buyers across all major time zones: USA (EST/PST), UK (GMT/BST), UAE (GST), Canada, Australia (AEST), Singapore (SGT). Share your country, city, and preferred call window for a confirmed slot.",
      commonQuestions: [
        "What is the general FEMA framework for NRI property purchase in India?",
        "What are the payment routing requirements from any overseas country?",
        "What is the standard POA process for a buyer who cannot travel to India?",
      ],
    },
    collectionHref: "/contact?purpose=nri-global",
    intro:
      "PIKORUA Realty serves NRI buyers from every major diaspora country — USA, UK, UAE, Canada, Australia, Singapore, New Zealand, Germany, South Africa, and beyond. The Ahmedabad luxury property market is accessible remotely from any country, with the right advisory support covering virtual tours, legal coordination, cross-country POA, and time-zone-compatible consultation.",
    marketSignals: [
      "NRI buyers from over 15 countries have purchased Ahmedabad luxury property through PIKORUA Realty's advisory framework.",
      "India's FEMA framework enables residential property purchase for NRIs from virtually any country — with country-specific legal nuances requiring professional review.",
    ],
    idealFor: [
      "NRIs based in countries not specifically covered by other pages — New Zealand, Germany, South Africa, Netherlands, etc.",
      "Global Indian diaspora members who want a starting framework before researching country-specific details.",
      "NRIs comparing Ahmedabad investment against property in their country of residence.",
    ],
    faqs: [
      {
        question: "Can NRIs from any country buy property in Ahmedabad?",
        answer:
          "Generally yes, subject to India's FEMA regulations. Indian passport holders can buy residential property in India from any country. OCI card holders (most Indian-origin foreign citizens) have largely equivalent rights. PIO card holders and foreign citizens of Indian origin should confirm their specific eligibility with an Indian property lawyer. PIKORUA Realty advises on the property side; legal eligibility should be confirmed by qualified counsel.",
      },
      {
        question: "What is the general process for any NRI to buy property in Ahmedabad?",
        answer:
          "The general process: (1) Virtual tour shortlisting; (2) Legal due diligence by Indian property lawyer; (3) Home-country apostilled Power of Attorney (if buyer cannot travel); (4) NRE/NRO account inward remittance from home-country bank; (5) Sale agreement; (6) Stamp duty and registration; (7) Possession and handover. PIKORUA Realty coordinates all Ahmedabad-side steps.",
      },
      {
        question: "Can NRIs repatriate property sale proceeds to their home country?",
        answer:
          "Yes, subject to FEMA conditions. NRIs can repatriate sale proceeds up to the original investment amount sourced through NRE/NRO accounts, after applicable Indian tax compliance (TDS/capital gains). An Indian CA and authorised dealer bank should be involved for repatriation. Home-country tax on repatriated proceeds should be confirmed with local tax advice.",
      },
    ],
    bodyContent: [
      "### The Universal NRI Framework",
      "Regardless of which country you are based in, the core framework for NRI property purchase in Ahmedabad follows the same structure: FEMA eligibility check → NRE/NRO account setup (if not already active) → shortlisting via virtual advisory → due diligence → home-country apostilled POA → inward remittance → sale agreement → registration → possession.",
      "### Country-Specific Nuances",
      "Each country introduces specific legal, tax, and documentation nuances. US buyers face FBAR/FATCA reporting. UK buyers need UK-apostilled POA and HMRC income declaration. UAE buyers benefit from MoFA attestation. Canadian buyers face CRA reporting. Australian buyers face ATO obligations. Singapore buyers face AML/KYC checks for remittance. PIKORUA Realty provides a country-specific advisory checklist at the start of every NRI engagement.",
      "### Time Zone Advisory Coverage",
      "PIKORUA Realty's advisory team operates a multi-time-zone consultation schedule to serve global NRI clients without requiring late-night calls. Standard consultation slots are available for USA (EST morning), UK (GMT afternoon), UAE (GST morning), Australia (AEST afternoon), and Singapore (SGT afternoon). For other time zones, share your window and the team will confirm a slot.",
    ],
  },
];
