export interface NriCentreLink {
  href: string;
  label: string;
  description: string;
}

export interface NriCentreSection {
  title: string;
  description: string;
  links: NriCentreLink[];
}

export const NRI_CENTRE_PATH = "/nri-property-investment-ahmedabad";

export const NRI_SERVICE_PROMISE =
  "One trusted Ahmedabad team for project shortlisting, video inspections, developer verification, negotiation support, documentation coordination, registration assistance and post-purchase property management.";

export const NRI_CENTRE_SECTIONS: NriCentreSection[] = [
  {
    title: "Start Here",
    description: "Understand the Ahmedabad buying journey and choose the right advisory path.",
    links: [
      {
        href: "/learn/how-to-buy-property-as-nri-ahmedabad",
        label: "How to Buy Property in Ahmedabad as an NRI",
        description: "Step by step: bank accounts, power of attorney, checks, payment, registration and buying remotely.",
      },
      {
        href: "/nri-property-consultant-ahmedabad",
        label: "NRI Property Consultant Ahmedabad",
        description: "The scope of PIKORUA's on-ground representation and private advisory.",
      },
    ],
  },
  {
    title: "Country Guides",
    description: "Original coordination guidance for major Gujarati and Indian diaspora markets.",
    links: [
      { href: "/nri/usa", label: "USA", description: "USD budgeting, US time zones, consular planning and remote family coordination." },
      { href: "/nri/uk", label: "United Kingdom", description: "GBP budgeting, UK calling windows and a focused India-visit workflow." },
      { href: "/nri/dubai", label: "Dubai / UAE", description: "AED budgeting, Gulf working patterns and short-notice Ahmedabad inspections." },
      { href: "/nri/canada", label: "Canada", description: "CAD budgeting, long-haul planning and evidence-led shortlisting." },
      { href: "/nri/singapore", label: "Singapore", description: "SGD budgeting, close time-zone coordination and compact inspection trips." },
      { href: "/nri/australia", label: "Australia", description: "AUD budgeting, recorded walkthroughs and limited-travel execution." },
      { href: "/nri/gcc", label: "Qatar, Saudi Arabia, Kuwait, Oman, Bahrain", description: "Gulf NRIs: RBI rules, paying from the Gulf and calls across Gulf time zones." },
      { href: "/nri/east-africa", label: "East Africa", description: "Gujarati families in Kenya, Tanzania and Uganda: the NRI and OCI routes to buying." },
      { href: "/nri/global", label: "Other Countries", description: "A global guide for overseas buyers outside the main country hubs." },
      { href: "/nri/non-resident-gujarati-property-ahmedabad", label: "Non-Resident Gujaratis", description: "For Gujarati families abroad buying a home in Ahmedabad, often for parents or a future return." },
      { href: "/nri/buying-home-for-parents-ahmedabad", label: "Buying a Home for Parents", description: "Choosing a home for parents, whose name it goes in, payment and managing it from abroad." },
    ],
  },
  {
    title: "Remote Purchase Services",
    description: "On-ground work for buyers who cannot inspect or manage every step personally.",
    links: [
      { href: "/nri-property-inspection-service", label: "Property Inspection Service", description: "Independent context videos, condition checks and written observations." },
      { href: "/virtual-property-tours-ahmedabad", label: "Virtual Property Tours", description: "Live and recorded walkthroughs covering the home, tower and immediate streets." },
      { href: "/property-management-for-nris", label: "Post-Purchase Property Management", description: "Handover, maintenance, tenant and vacant-home coordination after registration." },
    ],
  },
  {
    title: "Legal, Banking and Tax",
    description: "Dated educational guides that require transaction-specific review by qualified professionals.",
    links: [
      { href: "/nri/nri-property-eligibility-fema", label: "NRI and OCI Property Rules", description: "What the RBI allows NRIs and OCIs to buy, how to pay, gifts, inheritance and repatriation." },
      { href: "/nri/property-budget-currency-converter", label: "Budget Currency Converter", description: "Crore and lakh to USD, GBP, AED, CAD, AUD and SGD at indicative rates." },
      { href: "/power-of-attorney-for-nri-property-purchase", label: "Power of Attorney", description: "Scope, execution and local-use planning for remote buyers." },
      { href: "/nre-vs-nro-property-payment", label: "NRE vs NRO Property Payment", description: "Payment-channel and future-repatriation questions to review with your bank." },
      { href: "/nri-home-loans-india", label: "NRI Home Loans in India", description: "Eligibility, documents, bank process and POA considerations." },
      { href: "/tds-on-property-purchase-by-nri", label: "TDS and NRI Property", description: "Resident-seller and non-resident-seller scenarios require different treatment." },
      { href: "/selling-inherited-property-for-nris", label: "Selling Inherited Property", description: "Title, succession, tax, buyer-TDS and remote-sale preparation." },
      { href: "/repatriation-of-property-sale-proceeds-nri", label: "Repatriation of Sale Proceeds", description: "Banking trail, taxes, certificates and authorised-dealer review." },
    ],
  },
];

export const NRI_OFFICIAL_RESOURCES = [
  {
    href: "https://www.rbi.org.in/",
    label: "Reserve Bank of India",
    description: "FEMA directions, NRI/OCI payment modes and remittance rules.",
  },
  {
    href: "https://www.incometax.gov.in/",
    label: "Income Tax Department",
    description: "Current tax, TDS and filing guidance.",
  },
  {
    href: "https://gujrera.gujarat.gov.in/",
    label: "Gujarat RERA",
    description: "Project and promoter registration verification.",
  },
];

