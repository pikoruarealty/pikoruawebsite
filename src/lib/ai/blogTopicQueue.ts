/**
 * Evergreen editorial queue for the automated blog (src/lib/ai/blogPipeline.ts).
 *
 * News can't produce locality guides or NRI due-diligence guides, so the
 * pipeline's "evergreen" rotation slots draft from these briefs instead.
 * Rules for adding a brief:
 *  - targetQuery is an informational long-tail query from
 *    docs/seo/keyword-master.csv whose destination is a blog post, never a
 *    landing page's primary keyword (blogs link to landing pages, they don't
 *    compete with them).
 *  - facts are the article's only grounding: every specific figure or claim
 *    the article may state. Each fact needs a source a person checked.
 *  - alwaysHold forces human review (regulated or lifestyle topics).
 * A brief is used once; its id is recorded as the run's source_url
 * ("brief:<id>") so it is never drafted twice.
 */

import { findTopicDuplicate, type BlogCategory, type ExistingPostRef } from "@/lib/ai/blogQuality";

export interface EditorialBrief {
  id: string;
  title: string;
  targetQuery: string;
  category: BlogCategory;
  /** The landing page this post supports and must link to. */
  linkTo: string;
  angle: string;
  facts: string[];
  sources: { label: string; url: string }[];
  alwaysHold?: boolean;
}

const RBI_FAQ = { label: "RBI: FAQs on purchase of immovable property", url: "https://www.rbi.org.in/commonman/english/scripts/FAQs.aspx?Id=1855" };
const RBI_MD = { label: "RBI Master Direction: acquisition and transfer of immovable property", url: "https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=10196" };
const GUJRERA = { label: "Gujarat Real Estate Regulatory Authority (GujRERA)", url: "https://gujrera.gujarat.gov.in/" };

export const EDITORIAL_QUEUE: EditorialBrief[] = [
  {
    id: "nri-due-diligence-ahmedabad-home",
    title: "An NRI's due-diligence checklist for buying a home in Ahmedabad",
    targetQuery: "nri property documents required",
    category: "nri-insights",
    linkTo: "/learn/how-to-buy-property-as-nri-ahmedabad",
    angle: "A practical checklist for an NRI or OCI buying a residential property in Ahmedabad from abroad: title, approvals, RERA registration, payment trail, documents and who to involve. General information, not legal or tax advice.",
    facts: [
      "Under RBI rules, NRIs and OCI cardholders may acquire immovable property in India other than agricultural land, farm houses or plantation property.",
      "Payment for the property must come through normal banking channels: inward remittance from abroad or funds in an NRE, NRO or FCNR account.",
      "Residential projects in Gujarat must be registered with the Gujarat Real Estate Regulatory Authority (GujRERA), whose website lets buyers look up a project's registration.",
    ],
    sources: [RBI_FAQ, RBI_MD, GUJRERA],
    alwaysHold: true,
  },
  {
    id: "nri-buying-ahmedabad-from-abroad-steps",
    title: "Buying a home in Ahmedabad while living abroad: how the process runs",
    targetQuery: "buying property in ahmedabad from abroad",
    category: "nri-insights",
    linkTo: "/learn/how-to-buy-property-as-nri-ahmedabad",
    angle: "Walk an overseas buyer through the sequence from brief to handover: defining the requirement, shortlisting, virtual tours and inspections, verification, payment through banking channels, registration and handover. Emphasise what can be done remotely and what needs a trusted local representative.",
    facts: [
      "Under RBI rules, NRIs and OCI cardholders may acquire immovable property in India other than agricultural land, farm houses or plantation property.",
      "Payment for the property must come through normal banking channels: inward remittance from abroad or funds in an NRE, NRO or FCNR account.",
    ],
    sources: [RBI_FAQ],
    alwaysHold: true,
  },
  {
    id: "how-to-check-gujrera-registration",
    title: "How to check a project's GujRERA registration before you buy",
    targetQuery: "rera gujarat project check",
    category: "advisory",
    linkTo: "/learn/rera-gujarat-guide",
    angle: "Explain, step by step and without figures, why a buyer should look up a residential project on the GujRERA website before paying a booking amount, what to compare against the developer's brochure, and what questions to ask if details don't match.",
    facts: [
      "Residential projects in Gujarat must be registered with the Gujarat Real Estate Regulatory Authority (GujRERA), whose website lets buyers look up a project's registration.",
    ],
    sources: [GUJRERA],
  },
  {
    id: "choosing-4-bhk-or-5-bhk-ahmedabad",
    title: "4 BHK or 5 BHK: choosing the right luxury home size for your family",
    targetQuery: "4 bhk vs 5 bhk",
    category: "advisory",
    linkTo: "/luxury-4bhk-ahmedabad",
    angle: "Help a family decide between a 4 BHK and a 5 BHK in western Ahmedabad: household size, parents living in, staff quarters, home office, resale buyer pool, running costs. Qualitative only; no prices.",
    facts: [],
    sources: [],
  },
  {
    id: "rajpath-rangoli-road-guide",
    title: "Rajpath Rangoli Road, Bodakdev: a buyer's guide to the street",
    targetQuery: "rajpath rangoli road locality guide",
    category: "corridor-spotlight",
    linkTo: "/locations/rajpath-club",
    angle: "A locality guide for home buyers: where the road is, what it sits next to, the kind of homes buyers look at there and what to check. No prices, no project names.",
    facts: [
      "Rajpath Rangoli Road is in Bodakdev, west Ahmedabad, on the SG Highway side, beside Rajpath Club; addresses on it are also written as Rajpath Club Road, and some are filed under Thaltej.",
      "With Sindhu Bhavan Road it is one of Bodakdev's main streets.",
    ],
    sources: [
      { label: "Federal Bank branch address, Rajpath Rangoli Road (Code for Banks)", url: "https://www.codeforbanks.com/banks/ifsc/code/of/federal-bank/gujarat/ahmedabad/rajpath-rangoli-road/" },
      { label: "eChai Startup Grid: SG Highway run (Rajpath Rangoli Rd, Sindhu Bhavan Rd)", url: "https://echai.ventures/grid" },
    ],
  },
  {
    id: "vaishno-devi-circle-guide",
    title: "Vaishno Devi Circle: what home buyers should know about the junction",
    targetQuery: "vaishno devi circle locality guide",
    category: "corridor-spotlight",
    linkTo: "/locations/vaishno-devi",
    angle: "A locality guide: where the junction is, why townships cluster around it, what buyers trade off (space and newer projects versus distance from the established western corridors) and what to check. No prices.",
    facts: [
      "Vaishno Devi Circle is where SG Highway meets the SP Ring Road on the northern side of Ahmedabad.",
      "Large residential townships, including Adani Shantigram, are located near the circle.",
    ],
    sources: [
      { label: "Square Yards: projects near Vaishno Devi Circle on SG Highway", url: "https://www.squareyards.com/projects-in-near-vaishno-devi-circle-on-sg-highway-ahmedabad" },
      { label: "Adani Realty: flats near Vaishnodevi Circle", url: "https://www.adanirealty.com/flats-in-vaishnodevi-circle-ahmedabad-pcic" },
    ],
  },
  {
    id: "gross-vs-net-rental-yield",
    title: "Gross vs net rental yield: how to judge an Ahmedabad rental property",
    targetQuery: "gross vs net rental yield india",
    category: "advisory",
    linkTo: "/investment-property-ahmedabad",
    angle: "Teach an investor to work out gross and net yield themselves: annual rent divided by the all-in purchase cost, then subtracting maintenance, property tax, vacancy, letting costs and repairs. Discuss uncertainty and holding period. Do not state typical yields or returns for any area.",
    facts: [],
    sources: [],
  },
  {
    id: "office-vs-showroom-investment-checks",
    title: "Buying an office or a showroom as an investment: what to check first",
    targetQuery: "commercial property investment ahmedabad",
    category: "advisory",
    linkTo: "/commercial-property-ahmedabad",
    angle: "For investors weighing an office unit against a showroom: tenant quality, lease lock-in and escalation clauses, frontage and visibility, parking, maintenance, vacancy risk and exit liquidity. Qualitative; no yields or prices.",
    facts: [],
    sources: [],
  },
  {
    id: "homes-near-ahmedabad-clubs",
    title: "Living near Ahmedabad's private clubs: what buyers weigh",
    targetQuery: "homes near rajpath club",
    category: "luxury-living",
    linkTo: "/locations/rajpath-club",
    angle: "A lifestyle piece on how proximity to private clubs shapes where affluent families choose to live: daily routines, children's activities, social life, traffic and noise trade-offs. Do not describe club facilities, membership terms or fees, and do not imply any affiliation.",
    facts: [
      "Rajpath Club is in Bodakdev on SG Highway.",
    ],
    sources: [
      { label: "Rajpath Club, Bodakdev listing (Weddingz)", url: "https://weddingz.in/ahmedabad/rajpath-club-bodakdev/" },
    ],
    alwaysHold: true,
  },
];

export const BRIEF_SOURCE_PREFIX = "brief:";

/**
 * What the unsupported-figure check compares against: the verified facts
 * only. The angle and title contain numbers too ("4 BHK"), which must not
 * make an invented "4% yield" look supported.
 */
export function briefFactsText(brief: EditorialBrief): string {
  return brief.facts.join(" ");
}

/** The brief as "source article" text for drafting. */
export function briefToSourceText(brief: EditorialBrief): string {
  return [
    `Editorial brief (not news). Target reader question: "${brief.targetQuery}".`,
    `Angle: ${brief.angle}`,
    `Link to ${brief.linkTo} where the topic is mentioned.`,
    brief.facts.length
      ? `Verified facts you may state (state no other specific facts or figures):\n${brief.facts.map((f) => `- ${f}`).join("\n")}`
      : "No verified facts are supplied: write qualitatively and state no specific figures, prices, rates or dates.",
  ].join("\n\n");
}

/** The next brief not yet drafted and not a duplicate of an existing post. */
export function pickNextBrief(usedSources: Set<string>, existing: ExistingPostRef[]): EditorialBrief | null {
  return (
    EDITORIAL_QUEUE.find(
      (brief) => !usedSources.has(BRIEF_SOURCE_PREFIX + brief.id) && !findTopicDuplicate(brief.title, existing)
    ) ?? null
  );
}
