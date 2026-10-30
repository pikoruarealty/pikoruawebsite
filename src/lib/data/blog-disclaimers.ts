/**
 * Disclaimers for automated (AI-assisted) blog posts. A ★ next to the title
 * links to these notes at the end of the post (src/app/blog/[slug]/page.tsx).
 *
 * They are chosen when the page renders, from the post's own text, so a
 * wording change here applies to every automated post at once, including
 * posts published before this file existed. The general note always shows;
 * topic notes are added when the post touches that topic.
 *
 * Drafted 30 Oct 2026 on the pattern used by Indian property advisory sites.
 * Management decided they go live without a lawyer's review. They support
 * the Terms of Use (src/app/terms/page.tsx), which say the same things.
 *
 * A disclaimer can clarify general information; it cannot cure a false or
 * misleading claim (CCPA Guidelines for Prevention of Misleading
 * Advertisements, 2022). That is why the pipeline also removes guaranteed-
 * return wording and unsourced figures before publishing.
 */

/** PIKORUA Realty's GujRERA agent registration number. Shown only once filled in. */
export const GUJRERA_AGENT_REGISTRATION_NO = "";

export interface PostDisclaimer {
  id: string;
  heading: string;
  text: string;
}

const GENERAL: PostDisclaimer = {
  id: "general",
  heading: "General information only",
  text:
    "This article was prepared with the help of artificial intelligence by the PIKORUA Editorial Desk from publicly available information, including any source credited in it, and was not individually reviewed by a qualified professional before publication. It is provided for general information only. It is not legal, tax, financial, investment or other professional advice, and it is not an offer, invitation or solicitation to buy, sell or lease any property. It may contain errors or omissions and may not reflect later changes in law, policy, prices or market conditions, so verify every detail independently before relying on it. To the fullest extent permitted by law, PIKORUA Realty and its partners and employees accept no liability for any loss arising from reliance on this article. If you spot an error, write to connect@pikorua.in and we will review and correct it. Use of this website is governed by our Terms of Use.",
};

const TOPICS: (PostDisclaimer & { test: RegExp })[] = [
  {
    id: "figures",
    heading: "Figures, examples and returns",
    test: /₹|%|\b(?:crore|lakh|yield|returns?|apprecia\w*|rental income|roi)\b/i,
    text:
      "Figures are reproduced from the credited source as at its date of publication and have not been independently verified by PIKORUA Realty. Sentences that begin with \"Example\" are hypothetical illustrations of a calculation, not market data, forecasts or promises. Past performance of any property, locality or market is not a reliable indicator of future results. Property values and rents can fall as well as rise, and no return, rental income, appreciation, resale price or exit timeline is guaranteed.",
  },
  {
    id: "tax",
    heading: "Tax",
    test: /\b(?:tax|taxes|tds|capital gains?|stamp duty|registration (?:fee|fees|charges?)|gst|ltcg|stcg|dtaa|section\s*(?:54|54ec|54f|195))\b/i,
    text:
      "Tax treatment, including income tax, capital gains, TDS, stamp duty, registration charges and GST, depends on your individual circumstances and on the law in force on the date of the transaction, which changes often. Nothing in this article is tax advice. Consult a qualified chartered accountant before making any decision.",
  },
  {
    id: "legal",
    heading: "Legal, RERA and documents",
    test: /\b(?:rera|gujrera|title (?:deed|search|documents?|verification)|clear title|sale deed|agreement for sale|power of attorney|encumbrance|litigation|legal)\b/i,
    text:
      "References to RERA, title, approvals, agreements, powers of attorney or other legal matters are general explanations, not legal advice or an opinion on any particular property. Before you commit, check the project's registration on the GujRERA website (gujrera.gujarat.gov.in) and have the title, approvals and agreements reviewed by an independent advocate.",
  },
  {
    id: "nri",
    heading: "NRI, OCI and foreign exchange rules",
    test: /\b(?:nris?|non-resident|oci|overseas citizen|fema|rbi|reserve bank|repatriat\w*|nre|nro|fcnr|remittances?)\b/i,
    text:
      "Rules for Non-Resident Indians and Overseas Citizens of India on buying, paying for, renting out and selling property in India, and on taking sale proceeds abroad, are set under FEMA and by the Reserve Bank of India and are amended from time to time. Confirm the current position with your authorised dealer bank and with professional advisers in India and in your country of residence before acting.",
  },
  {
    id: "infrastructure",
    heading: "Public projects and infrastructure",
    test: /\b(?:metro|gift city|ring road|expressway|bullet train|high-speed rail|airport|flyover|tp scheme|town planning|infrastructure)\b/i,
    text:
      "Information about metro lines, roads, GIFT City and other public projects is based on announcements and reports that can change. Routes, timelines and approvals are decided by government authorities and are not guaranteed, and any effect of a project on the value or rent of a particular property is uncertain.",
  },
  {
    id: "projects",
    heading: "Projects, developers and prices",
    test: /\b(?:projects?|developers?|builders?|launch\w*|possession|per sq\.?\s?ft|prices?|pricing)\b/i,
    text:
      "Mentions of projects, developers, localities or prices are for information only and are not an endorsement, recommendation or offer. Prices, availability, specifications and possession dates are indicative and can change without notice. Confirm them with the developer and against the project's RERA registration.",
  },
  {
    id: "commercial",
    heading: "Commercial property and leases",
    test: /\b(?:office space|offices|showrooms?|commercial|lease|leasing|tenants?|pre-?leased)\b/i,
    text:
      "Commercial property, leases and rental income carry tenant, vacancy, maintenance and legal risks that vary by property. Review the specific lease, tenant and costs with your own advisers before investing.",
  },
];

const THIRD_PARTY: PostDisclaimer = {
  id: "sources",
  heading: "Third-party sources",
  text:
    "This article discusses information published by third parties, credited at the end of the article. PIKORUA Realty is not affiliated with those publishers, does not endorse their content and is not responsible for its accuracy or availability. Trademarks and names belong to their respective owners.",
};

/**
 * The notes to show on an automated post, general note first. `text` is the
 * post's title, body and FAQs as plain text; `hasSource` is true when the
 * post credits a third-party source.
 */
export function getAutomatedPostDisclaimers(text: string, hasSource: boolean): PostDisclaimer[] {
  const topics = TOPICS.filter(({ test }) => test.test(text)).map(({ id, heading, text: body }) => ({ id, heading, text: body }));
  return [GENERAL, ...topics, ...(hasSource ? [THIRD_PARTY] : [])];
}
