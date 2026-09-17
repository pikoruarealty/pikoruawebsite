import type { GeoLandingPage } from "@/lib/data/geo";
import { NRI_SERVICE_PROMISE } from "@/lib/data/nri-centre";

const HERO_IMAGE = "/properties/maruti-360/maruti-360-view.jpg";
const BROAD_NRI_CATEGORIES = [
  "apartment",
  "penthouse",
  "duplex",
  "villa",
  "bungalow",
  "plot",
  "investment",
  "residential-investment",
] as const;

type CountryHubInput = {
  slug: string;
  country: string;
  residentLabel: string;
  currency: string;
  locationKeywords: string[];
  relatedSlugs: string[];
  travelNote: string;
  legalNote: string;
};

function createCountryHub({
  slug,
  country,
  residentLabel,
  currency,
  locationKeywords,
  relatedSlugs,
  travelNote,
  legalNote,
}: CountryHubInput): GeoLandingPage {
  return {
    kind: "nri",
    slug,
    href: `/nri/${slug}`,
    label: `${country} NRI Property Guide`,
    eyebrow: `${country} to Ahmedabad · NRI Property Centre`,
    title: `${country} NRI Property Ahmedabad Guide | PIKORUA`,
    h1: `Ahmedabad Property Guide for ${country}-Based NRIs`,
    description: `Verified Ahmedabad properties and remote buying guidance for ${residentLabel}, with virtual tours, documentation and local buyer-side advisory.`,
    heroImage: HERO_IMAGE,
    categories: [...BROAD_NRI_CATEGORIES],
    matchKeywords: [
      `${country} NRI Ahmedabad property`,
      `buy property in Ahmedabad from ${country}`,
      `Ahmedabad property for ${residentLabel}`,
    ],
    seoKeywords: [
      `best property broker in Ahmedabad for ${country} NRI`,
      `trusted NRI property consultant Ahmedabad ${country}`,
      `Ahmedabad properties for ${residentLabel}`,
      `luxury property Ahmedabad for ${country} NRI`,
      `verified property Ahmedabad NRI`,
      `remote property buying Ahmedabad from ${country}`,
      `NRI real estate agent Ahmedabad ${country}`,
      ...locationKeywords,
    ],
    collectionHref: `/contact?purpose=nri-${slug}`,
    relatedSlugs,
    intro: `${residentLabel} can use this country hub to compare Ahmedabad homes, investment options, micro-markets and the practical steps for buying remotely. PIKORUA Realty coordinates shortlisting, live video tours, developer checks, negotiation, documentation and possession support through one Ahmedabad-based advisory team.`,
    marketSignals: [
      `${currency} budgeting should be compared against the complete rupee purchase cost, including stamp duty, registration, fit-out and ongoing management.`,
      "Western Ahmedabad corridors such as Iscon-Ambli, Sindhu Bhavan Road, Thaltej, Shilaj and SG Highway serve different self-use, rental and resale goals.",
      travelNote,
    ],
    idealFor: [
      `${residentLabel} searching for a trusted property broker or buyer-side consultant in Ahmedabad.`,
      "Families buying a home for parents, future return, regular India visits or long-term wealth allocation.",
      "Overseas buyers who need verified options, virtual inspections and one accountable local coordination team.",
    ],
    nriDetails: {
      heading: `${country} NRI Property Advisory for Ahmedabad`,
      servicePromise: NRI_SERVICE_PROMISE,
      callingHours: `Video consultations are scheduled around ${country} time zones and confirmed on WhatsApp, Zoom or Google Meet.`,
      timeZoneContact: `Share your ${country} city and preferred call window; the Ahmedabad team will confirm the closest available slot.`,
      documentationChecklist: [
        "Passport, PAN and OCI/visa or residency-status document",
        "Overseas and Indian address proof, where available",
        "NRE/NRO account details and source-of-funds record",
        "Power of Attorney draft if a representative will sign in India",
        "Property-specific KYC and developer forms",
      ],
      videoConsultation: "Private screen-share consultation with a property shortlist, corridor comparison and next-step checklist.",
      testimonialsNote: "Country-specific client references are shared privately only with prior client approval.",
      whatsappFormat: "+91 6354 359 222",
      internationalPhoneFormat: "+91 6354 359 222 from overseas phones",
      reviewNote: `${legalNote} Legal, tax, FEMA, banking and registration decisions require transaction-specific advice from qualified professionals.`,
      commonQuestions: [
        `Can I buy an Ahmedabad property from ${country} without travelling to India?`,
        "How will PIKORUA verify the project, developer and property before I book?",
        "Which NRE/NRO payment route and Power of Attorney process applies to my transaction?",
      ],
    },
    faqs: [
      {
        question: `Which is the best property broker in Ahmedabad for ${country}-based NRIs?`,
        answer: "The right broker should show verifiable local experience, RERA-aware project checks, transparent fees, live video inspections and documented follow-up. PIKORUA Realty provides buyer-side Ahmedabad shortlisting and transaction coordination; buyers should compare scope, evidence and conflicts before appointing any advisor.",
      },
      {
        question: `Can an NRI living in ${country} buy property in Ahmedabad remotely?`,
        answer: "Generally, an eligible NRI or OCI can buy residential or commercial property in India and can often complete much of the process remotely. Agricultural land and similar restricted categories are treated differently. A lawyer, chartered accountant and authorised-dealer bank should confirm the buyer's exact position.",
      },
      {
        question: "How does PIKORUA shortlist Ahmedabad properties for overseas buyers?",
        answer: "The shortlist is based on budget, purpose, possession timing, developer record, location fit, maintenance needs, rental or resale demand and documentation readiness. The team can then arrange live or recorded walkthroughs before a buyer travels or commits.",
      },
      {
        question: `Can I pay for Ahmedabad property in ${currency}?`,
        answer: `The commercial discussion may be modelled in ${currency}, but the Indian transaction and permitted payment route must follow current FEMA and banking rules. Confirm the exact NRE/NRO or inward-remittance route with an authorised-dealer bank before transferring funds.`,
      },
      {
        question: "Which Ahmedabad areas are popular with NRI property buyers?",
        answer: "Iscon-Ambli, Sindhu Bhavan Road, Bodakdev, Thaltej, Shilaj, Vastrapur and SG Highway are frequently considered. The best area depends on family use, airport and business access, property format, possession timing, management needs and exit demand.",
      },
    ],
    bodyContent: [
      `### Start with the ${country} NRI Buying Brief`,
      `A useful search starts with four decisions: self-use or investment, total rupee budget, acceptable possession date and who will manage the home after purchase. PIKORUA uses this brief to remove unsuitable inventory before arranging video tours or site visits.`,
      "### Choose the Ahmedabad Micro-Market Before the Project",
      "A project should not be selected only from a brochure. Iscon-Ambli and Sindhu Bhavan Road offer strong luxury address recall; Thaltej and Bodakdev provide mature family infrastructure; Shilaj offers newer, lower-density options; SG Highway supports broad city connectivity. The corridor must match the buyer's daily-use and exit plan.",
      "### Verify Before Paying a Booking Amount",
      "Buyers should review the developer record, Gujarat RERA details, title and approval documents, agreement terms, carpet-area definition, payment schedule, possession commitments and cancellation clauses. PIKORUA coordinates the property-side evidence, while independent legal and tax professionals provide formal opinions.",
      "### Plan Remote Execution and Ownership",
      "If travel is limited, the process may use live walkthroughs, recorded evidence, digital document review and a properly prepared Power of Attorney. The plan should also cover handover inspection, furnishing, society coordination, tenant management or periodic vacant-home checks after registration.",
    ],
  };
}

export const NRI_COUNTRY_INDEX_PAGES: GeoLandingPage[] = [
  createCountryHub({
    slug: "usa",
    country: "USA",
    residentLabel: "USA-based NRIs",
    currency: "USD",
    locationKeywords: ["Ahmedabad real estate agent for NRI in USA", "buy luxury flat Ahmedabad from USA"],
    relatedSlugs: ["usa-luxury-flats-ahmedabad", "usa-property-investment-ahmedabad", "nri-property-from-usa", "india-vs-usa-property-roi-for-nris"],
    travelNote: "EST, CST and PST buyers often rely on recorded comparisons before planning a focused Ahmedabad inspection trip.",
    legalNote: "US tax residents may also need advice on FBAR, FATCA and US reporting obligations.",
  }),
  createCountryHub({
    slug: "uk",
    country: "UK",
    residentLabel: "UK-based NRIs",
    currency: "GBP",
    locationKeywords: ["Ahmedabad property broker for NRI in UK", "buy luxury property Ahmedabad from UK"],
    relatedSlugs: ["uk-luxury-properties-ahmedabad", "uk-buy-property-ahmedabad", "nri-property-from-uk", "nri-property-purchase-process-india"],
    travelNote: "GMT and BST consultation windows allow shortlist reviews before a compact India visit.",
    legalNote: "UK residents should obtain advice on UK tax reporting and the apostille process for documents signed in the UK.",
  }),
  createCountryHub({
    slug: "dubai",
    country: "Dubai / UAE",
    residentLabel: "UAE-based NRIs",
    currency: "AED",
    locationKeywords: ["Ahmedabad property broker for Dubai NRI", "buy property Ahmedabad from UAE"],
    relatedSlugs: ["dubai-luxury-flats-ahmedabad", "dubai-property-investment-ahmedabad", "nri-property-from-dubai", "ahmedabad-vs-dubai-real-estate-investment"],
    travelNote: "Short flights and a small time difference make live video tours and focused inspection visits practical for UAE buyers.",
    legalNote: "UAE-executed documents may require the applicable notarisation and attestation route before use in India.",
  }),
  createCountryHub({
    slug: "canada",
    country: "Canada",
    residentLabel: "Canada-based NRIs",
    currency: "CAD",
    locationKeywords: ["Ahmedabad real estate broker for Canadian NRI", "buy property Ahmedabad from Canada"],
    relatedSlugs: ["canada-luxury-properties-ahmedabad", "nri-property-from-canada", "nri-property-investment-ahmedabad", "property-management-for-nris"],
    travelNote: "Canada-based families can complete initial diligence remotely and reserve travel for final inspections or registration planning.",
    legalNote: "Canadian residents should obtain advice on Canadian reporting and tax treatment alongside Indian transaction advice.",
  }),
  createCountryHub({
    slug: "australia",
    country: "Australia",
    residentLabel: "Australia-based NRIs",
    currency: "AUD",
    locationKeywords: ["Ahmedabad property consultant for Australian NRI", "buy property Ahmedabad from Australia"],
    relatedSlugs: ["australia-property-investment-ahmedabad", "nri-property-from-australia", "nri-property-inspection-service", "property-management-for-nris"],
    travelNote: "AEST and AEDT time differences make structured recorded tours and scheduled decision calls especially useful.",
    legalNote: "Australian residents should obtain advice on ATO reporting and Australian tax treatment of Indian assets and income.",
  }),
  createCountryHub({
    slug: "singapore",
    country: "Singapore",
    residentLabel: "Singapore-based NRIs",
    currency: "SGD",
    locationKeywords: ["Ahmedabad property broker for Singapore NRI", "buy luxury flat Ahmedabad from Singapore"],
    relatedSlugs: ["singapore-luxury-flats-ahmedabad", "nri-property-from-singapore", "nri-property-investment-ahmedabad", "virtual-property-tours-ahmedabad"],
    travelNote: "The close time-zone overlap supports live project tours, document calls and short inspection trips.",
    legalNote: "Singapore residents should confirm local reporting and remittance documentation with appropriate advisers and banks.",
  }),
  createCountryHub({
    slug: "global",
    country: "Global",
    residentLabel: "NRIs living outside India",
    currency: "your local currency",
    locationKeywords: ["international NRI property broker Ahmedabad", "Ahmedabad property consultant for overseas Indians"],
    relatedSlugs: ["global-invest-ahmedabad-real-estate", "nri-property-consultant-ahmedabad", "nri-buying-property-in-ahmedabad", "nri-property-purchase-process-india"],
    travelNote: "Consultations and evidence-led shortlisting are available across major international time zones.",
    legalNote: "Home-country tax and reporting rules differ, so buyers should obtain advice in both India and their country of residence.",
  }),
];

export const NRI_MAIN_INDEX_PAGE: GeoLandingPage = {
  kind: "nri",
  slug: "nri",
  href: "/nri",
  label: "NRI Property Centre Ahmedabad",
  eyebrow: "Global NRI Property Advisory · Ahmedabad",
  title: "NRI Property Ahmedabad: Guide & Homes | PIKORUA",
  h1: "NRI Property Centre for Ahmedabad",
  description: "Find verified Ahmedabad properties, country-specific NRI buying guides and trusted local advisory for virtual tours, documentation, negotiation and handover.",
  heroImage: HERO_IMAGE,
  categories: [...BROAD_NRI_CATEGORIES],
  matchKeywords: ["NRI property Ahmedabad", "Ahmedabad property for overseas Indians", "NRI real estate Ahmedabad"],
  seoKeywords: [
    "best property broker in Ahmedabad for NRI",
    "trusted NRI property consultant Ahmedabad",
    "best properties in Ahmedabad for NRI",
    "NRI property guide Ahmedabad",
    "verified luxury properties Ahmedabad for NRI",
    "buy property in Ahmedabad from abroad",
    "NRI real estate agent Ahmedabad",
    "remote property buying Ahmedabad",
  ],
  collectionHref: "/contact?purpose=nri",
  relatedSlugs: ["usa", "uk", "dubai", "canada", "australia", "singapore", "global"],
  intro: "This is the starting point for overseas Indians comparing Ahmedabad property. Browse country guides, verified residential options, legal and banking explainers, virtual inspection services and post-purchase support before selecting a project or paying a booking amount.",
  marketSignals: [
    "Country-specific hubs connect overseas search intent with Ahmedabad properties and practical remote-execution guidance.",
    "Property recommendations are organised around purpose, location, possession timing, developer record and documentation readiness.",
    "PIKORUA provides one Ahmedabad-based coordination team from shortlist and video tour through negotiation, registration support and handover.",
  ],
  idealFor: [
    "NRIs searching for a trusted Ahmedabad property broker, advisor or local buyer representative.",
    "Overseas families buying for parents, future return, investment, rental income or long-term India allocation.",
    "Buyers who want evidence-led shortlisting and remote coordination instead of unfiltered project lists.",
  ],
  nriDetails: {
    heading: "End-to-End NRI Property Advisory in Ahmedabad",
    servicePromise: NRI_SERVICE_PROMISE,
    callingHours: "Private video consultations are available by appointment across USA, UK, UAE, Canada, Australia, Singapore and other major time zones.",
    timeZoneContact: "Share your country, city and preferred call window for a confirmed WhatsApp, Zoom or Google Meet slot.",
    documentationChecklist: ["Passport and PAN", "OCI, visa or residency-status document", "Overseas address proof", "NRE/NRO account details", "Power of Attorney plan where required"],
    videoConsultation: "A private consultation includes requirements mapping, corridor comparison, shortlist review and a written next-step checklist.",
    testimonialsNote: "Public reviews are available on the testimonials page; private client references are shared only with permission.",
    whatsappFormat: "+91 6354 359 222",
    internationalPhoneFormat: "+91 6354 359 222 from overseas phones",
    reviewNote: "Legal, tax, banking, FEMA and registration content is educational and must be confirmed for the exact transaction by qualified professionals.",
    commonQuestions: ["Which Ahmedabad properties fit my budget and purpose?", "Can the complete purchase be coordinated remotely?", "How do I verify the developer and legal documents before booking?"],
  },
  faqs: [
    {
      question: "How do I find the best property broker in Ahmedabad for an NRI purchase?",
      answer: "Compare local market depth, verified inventory, fee transparency, RERA and document-review process, video inspection quality and post-booking coordination. PIKORUA offers buyer-side advisory across these stages, but clients should evaluate the documented scope rather than rely on a generic 'best broker' claim.",
    },
    {
      question: "Which properties in Ahmedabad are best for NRIs?",
      answer: "There is no single best property. A suitable NRI purchase depends on self-use or investment purpose, location, possession timeline, developer quality, maintenance, tenant demand and resale depth. PIKORUA builds a shortlist against those criteria.",
    },
    {
      question: "Can PIKORUA show Ahmedabad properties by live video call?",
      answer: "Yes. Live and recorded walkthroughs can cover the home, floor, common areas, project access and nearby streets, followed by a comparison note and document checklist.",
    },
    {
      question: "Can an NRI buy property in Ahmedabad without visiting India?",
      answer: "Many stages can be handled remotely, and a properly prepared Power of Attorney may support signing or registration where legally accepted. The exact structure must be confirmed by an Indian property lawyer and the relevant registration and banking professionals.",
    },
    {
      question: "Does PIKORUA help after the property is purchased?",
      answer: "The team can coordinate handover inspection, snagging, furnishing referrals, society communication and introductions for tenant or vacant-home management according to the agreed service scope.",
    },
  ],
  bodyContent: [
    "### Search Ahmedabad Property by Country and Buying Intent",
    "Use the USA, UK, Dubai/UAE, Canada, Australia, Singapore or Global hub to begin with time-zone, currency, documentation and travel context relevant to you. Then compare dedicated guides for luxury homes, investment property, remote inspections, home loans, Power of Attorney, tax withholding and repatriation.",
    "### What a Trusted NRI Property Advisor Should Do",
    "A useful advisor narrows the market, explains trade-offs and records evidence. The scope should cover micro-market comparison, developer and project screening, live inspection, commercial negotiation, document coordination and a clear handover plan. Legal and tax opinions must still come from appropriately qualified professionals.",
    "### How Properties Are Shortlisted",
    "PIKORUA evaluates the buyer's purpose, rupee budget, configuration, possession timing, location, family infrastructure, rental demand, resale depth and management requirements. This creates a focused set of options instead of a large inventory dump.",
    "### From Overseas Search to Ahmedabad Handover",
    "The typical journey is: private briefing, corridor comparison, project shortlist, video walkthrough, document review, negotiation, payment-route confirmation, agreement and registration coordination, possession inspection and ongoing management planning.",
  ],
};
