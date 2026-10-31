import type { ContentHubPage, ContentHubPrefix, ComparisonRow } from "@/lib/data/content-hubs";

const UPDATED = "2026-07-23";
const HERO = {
  apartment: "/properties/maruti-360/maruti-360-view.jpg",
  private: "/properties/capstone/capstone-1-courtyard.jpg",
  landed: "/properties/anurita/anurita-1.jpg",
};

interface DecisionPageInput {
  slug: string;
  prefix: ContentHubPrefix;
  h1: string;
  description: string;
  /** Shorter search title when the H1 is too long for Google (~65 chars with the brand). */
  title?: string;
  intro: string;
  takeaways: [string, string, string];
  sections: [
    { heading: string; body: [string, string] },
    { heading: string; body: [string, string] },
  ];
  listings: string[];
  related: string[];
  comparison?: ComparisonRow[];
  hero?: keyof typeof HERO;
}

function decisionPage(input: DecisionPageInput): ContentHubPage {
  return {
    slug: input.slug,
    prefix: input.prefix,
    href: `/${input.prefix}/${input.slug}`,
    title: input.title ?? `${input.h1} | PIKORUA Realty`,
    description: input.description,
    h1: input.h1,
    eyebrow: "Buyer Decision Guide · PIKORUA Advisory",
    intro: input.intro,
    heroImage: HERO[input.hero ?? "apartment"],
    keyTakeaways: input.takeaways,
    sections: input.sections,
    comparisonTable: input.comparison,
    faqs: [
      {
        question: `How should I use this ${input.h1.toLowerCase()} guide?`,
        answer:
          "Use it to define the brief and rejection criteria before requesting live inventory. Availability, asking prices and transaction terms must then be checked against a dated shortlist.",
      },
      {
        question: "Can PIKORUA prepare a private comparison?",
        answer:
          "Yes. PIKORUA can prepare a current shortlist with property-level observations, unresolved risks, total acquisition cost and the reasons each option does or does not fit the mandate.",
      },
    ],
    relatedListingHrefs: input.listings,
    relatedHubSlugs: input.related,
    marketSignals: input.takeaways,
    publishedAt: UPDATED,
    category:
      input.prefix === "compare"
        ? "comparison"
        : input.prefix === "invest"
          ? "investment"
          : "education",
  };
}

export const PHASE_14_CONTENT_PAGES: ContentHubPage[] = [
  decisionPage({
    slug: "luxury-property-ahmedabad-below-3-crore",
    prefix: "invest",
    h1: "Best Luxury Properties in Ahmedabad Below ₹3 Crore",
    title: "Luxury Property in Ahmedabad Below ₹3 Crore",
    description: "A realistic buyer framework for Ahmedabad luxury homes below ₹3 crore, including corridor, size, possession and resale trade-offs.",
    intro: "Below ₹3 crore is a selective premium brief, not an unlimited luxury brief. The strongest choice usually requires one deliberate compromise across address, usable area, building age, possession stage or amenity depth.",
    takeaways: ["Do not compare brochure area without carpet-area context.", "Ready resale and newer outer-corridor supply solve different needs.", "Keep registration, interiors and initial maintenance outside the headline budget."],
    sections: [
      { heading: "Where the Budget Usually Works", body: ["Thaltej, Science City, Shilaj, Vaishno Devi, Shela and selected SG Highway pockets generally offer more choice than core Iscon-Ambli or Sindhu Bhavan.", "A smaller residence in a mature address may preserve resale depth; a larger home farther out may provide better daily utility. The right answer depends on intended use."] },
      { heading: "Reject Before You Shortlist", body: ["Reject density, access, developer-history or title compromises that a lower headline price does not compensate for.", "PIKORUA compares total acquisition cost, usable planning, possession certainty and realistic exit demand before arranging inspections."] },
    ],
    listings: ["/properties", "/p/thaltej/luxury-flats", "/p/shilaj/luxury-flats"],
    related: ["new-launch-vs-resale-ahmedabad", "under-construction-vs-ready-to-move"],
  }),
  decisionPage({
    slug: "luxury-homes-ahmedabad-3-to-5-crore",
    prefix: "invest",
    h1: "Luxury Homes in Ahmedabad from ₹3 Crore to ₹5 Crore",
    title: "Luxury Homes in Ahmedabad: ₹3–5 Crore",
    description: "How to compare 4 BHK and selected 5 BHK luxury homes in Ahmedabad within a ₹3–5 crore acquisition budget.",
    intro: "The ₹3–5 crore band opens credible 4 BHK and selected 5 BHK choices across established and growth corridors. Building quality, floor plate and possession certainty create more meaningful differences than amenity counts.",
    takeaways: ["Compare total cost rather than agreement value.", "Prioritise usable family planning over decorative specifications.", "A stronger building in a secondary pocket can outperform a compromised prime-address tower."],
    sections: [
      { heading: "Established Versus Emerging Choice", body: ["Bodakdev, Thaltej, Vastrapur and selected SG Highway projects provide established infrastructure; Shilaj, Science City and Vaishno Devi can provide newer supply or larger formats.", "Iscon-Ambli and Sindhu Bhavan options within this band may involve smaller floor plates, earlier purchase stages or resale-specific opportunities."] },
      { heading: "The Decision Sheet", body: ["Record carpet area, residences per floor, parking, view protection, possession, recurring maintenance and developer delivery evidence for every option.", "Keep a separate risk column for legal review, approach-road reality, construction progress and any premium unsupported by scarcity."] },
    ],
    listings: ["/luxury-4bhk-ahmedabad", "/luxury-5bhk-ahmedabad", "/properties"],
    related: ["under-construction-vs-ready-to-move", "carpet-area-vs-built-up-area"],
  }),
  decisionPage({
    slug: "luxury-properties-ahmedabad-5-to-10-crore",
    prefix: "invest",
    h1: "Best Luxury Properties in Ahmedabad Between ₹5 Crore and ₹10 Crore",
    title: "Luxury Properties in Ahmedabad: ₹5–10 Crore",
    description: "A private-buyer framework for large apartments, penthouses, duplexes and landed homes in Ahmedabad’s ₹5–10 crore segment.",
    intro: "At ₹5–10 crore, buyers can demand genuine privacy, spatial quality and address strength. The danger is paying a scarcity premium for a property whose floor plan, building management or resale audience is weaker than its presentation.",
    takeaways: ["Demand property-level evidence, not a generic luxury label.", "Test privacy, usable area and resale audience together.", "Include taxes, interiors and holding costs in the decision."],
    sections: [
      { heading: "What the Band Can Include", body: ["Depending on corridor and possession, the band can include entire-floor apartments, large 5 BHK residences, selected penthouses and duplexes, or bungalow and villa opportunities.", "Iscon-Ambli, Sindhu Bhavan, Bodakdev, Thaltej and selected SG Highway projects are principal comparison markets, but live suitability is building-specific."] },
      { heading: "PIKORUA View", body: ["The best acquisition is rarely the largest quoted area. It is the residence whose arrival, light, circulation, privacy, parking and ownership burden remain convincing after the brochure is removed.", "A dated shortlist should show reasons to decline alongside reasons to proceed."] },
    ],
    listings: ["/properties", "/p/iscon-ambli-road/luxury-flats", "/p/sindhubhavan-road/penthouses"],
    related: ["luxury-flats-vs-villas-ahmedabad", "new-launch-vs-resale-ahmedabad"],
  }),
  decisionPage({
    slug: "ahmedabad-penthouses-above-15-crore",
    prefix: "invest",
    h1: "Ahmedabad Penthouses Above ₹15 Crore",
    description: "Private acquisition guidance for Ahmedabad penthouses above ₹15 crore, covering scarcity, terrace rights, privacy, delivery and resale risk.",
    intro: "A penthouse above ₹15 crore must be evaluated as a scarce residence, not as a standard apartment with a larger area. Legal terrace rights, core privacy, view protection and long-term building quality determine whether the premium is defensible.",
    takeaways: ["Verify terrace and exclusive-use rights in documents.", "Inspect lift, service and fire circulation—not only interiors.", "Model the much smaller future resale audience."],
    sections: [
      { heading: "What Justifies the Premium", body: ["Protected outlook, a genuinely private arrival, irreplaceable usable scale, low tower density and a strong ownership community can justify the premium.", "A pool, terrace or double-height space adds value only when waterproofing, maintenance responsibility and legal rights are clear."] },
      { heading: "Private-Market Discipline", body: ["Some suitable penthouses are introduced selectively, but off-market status is not evidence of value. Every opportunity still requires title, condition, comparable and transaction review.", "PIKORUA restricts tours and information sharing while coordinating the buyer’s lawyer, architect and other appointed professionals."] },
    ],
    listings: ["/penthouses-ahmedabad", "/properties"],
    related: ["new-launch-vs-resale-ahmedabad", "carpet-area-vs-built-up-area"],
    hero: "private",
  }),
  decisionPage({
    slug: "thaltej-vs-shilaj",
    prefix: "compare",
    h1: "Thaltej versus Shilaj: Which Luxury Location Fits Better?",
    title: "Thaltej vs Shilaj for Luxury Homes",
    description: "Compare Thaltej and Shilaj for established connectivity, newer supply, plots, apartments, family infrastructure and long-term ownership.",
    intro: "Thaltej is the more established, infrastructure-rich choice; Shilaj offers more land-backed formats, newer development and room for larger residential planning. Neither wins without the household brief.",
    takeaways: ["Choose Thaltej for mature daily infrastructure.", "Choose Shilaj for landed formats and newer scale.", "Test peak-hour access and neighbourhood completion personally."],
    comparison: [
      { label: "Market character", a: "Established urban residential", b: "Growth and landed-property corridor" },
      { label: "Typical fit", a: "Managed apartments and family access", b: "Villas, plots and larger newer homes" },
      { label: "Primary risk", a: "Congestion and ageing stock", b: "Infrastructure and neighbourhood completion" },
    ],
    sections: [
      { heading: "Daily Life Difference", body: ["Thaltej offers shorter access to mature schools, healthcare, retail and established western business districts.", "Shilaj can reward buyers who accept a developing context in exchange for space, lower density or custom-home potential."] },
      { heading: "Investment Difference", body: ["Thaltej has deeper present-day end-user recognition. Shilaj’s outcome depends more heavily on specific access, surrounding occupation and the quality of delivered supply.", "Compare completed neighbourhood evidence rather than relying on corridor-wide appreciation narratives."] },
    ],
    listings: ["/locations/thaltej", "/locations/shilaj", "/properties"],
    related: ["thaltej-investment-guide", "under-construction-vs-ready-to-move"],
  }),
  decisionPage({
    slug: "bodakdev-vs-vastrapur",
    prefix: "compare",
    h1: "Bodakdev versus Vastrapur for Luxury Homebuyers",
    description: "A location-specific comparison of Bodakdev and Vastrapur for apartments, bungalows, connectivity, lifestyle and resale.",
    intro: "Bodakdev is stronger for quiet premium residential depth and bungalow-led address value; Vastrapur is stronger for lake-area lifestyle, institutional access and a more active urban environment.",
    takeaways: ["Bodakdev suits privacy-led residential briefs.", "Vastrapur suits walkable urban access and institutional proximity.", "Street, building age and redevelopment context matter block by block."],
    comparison: [
      { label: "Character", a: "Quieter premium residential", b: "Active mixed urban neighbourhood" },
      { label: "Formats", a: "Large apartments and bungalows", b: "Apartments and selected redevelopment stock" },
      { label: "Watch", a: "Lane access and ageing buildings", b: "Traffic, activity and plot-by-plot context" },
    ],
    sections: [
      { heading: "Who Usually Chooses Each", body: ["Business families often shortlist Bodakdev for privacy, social infrastructure and established residential identity.", "Professionals and families who value Vastrapur Lake, universities, retail and central-west access may prefer Vastrapur despite its busier character."] },
      { heading: "Resale and Replacement", body: ["Bodakdev’s scarcity is strongest in genuinely quiet lanes and well-managed low-density buildings.", "Vastrapur demand is broad, but future construction and building age must be evaluated carefully before paying a location premium."] },
    ],
    listings: ["/locations/bodakdev", "/locations/vastrapur", "/properties"],
    related: ["thaltej-vs-bodakdev-investment", "new-launch-vs-resale-ahmedabad"],
  }),
  decisionPage({
    slug: "nehrunagar-vs-western-ahmedabad",
    prefix: "compare",
    h1: "Nehrunagar versus Western Ahmedabad for Luxury Buyers",
    title: "Nehrunagar vs Western Ahmedabad",
    description: "Compare central Nehrunagar with Ahmedabad’s western luxury corridors for commute, building formats, neighbourhood maturity and future flexibility.",
    intro: "Nehrunagar is a central-access decision; western Ahmedabad is a format-and-lifestyle decision. Buyers should compare actual daily journeys and property quality rather than assuming newer or more central is automatically better.",
    takeaways: ["Nehrunagar can reduce cross-city travel.", "Western corridors offer deeper new luxury supply.", "Redevelopment, access and parking are property-specific risks."],
    comparison: [
      { label: "Primary advantage", a: "Central city access", b: "Luxury inventory depth" },
      { label: "Typical stock", a: "Mature and redevelopment-led", b: "Newer towers, villas and plots" },
      { label: "Main diligence", a: "Age, parking and redevelopment", b: "Density, delivery and corridor access" },
    ],
    sections: [
      { heading: "Central Convenience", body: ["Nehrunagar can fit families with business, school or healthcare routines spread across central Ahmedabad.", "The best central home may outperform a western address when commute time and established family networks dominate the brief."] },
      { heading: "Western Choice", body: ["Iscon-Ambli, Sindhu Bhavan, Bodakdev, Thaltej and Shilaj offer greater depth across large apartments, penthouses and landed formats.", "That choice comes with peak-hour variability and meaningful differences between micro-pockets that broad western-Ahmedabad labels conceal."] },
    ],
    listings: ["/locations/nehru-nagar", "/locations/sindhu-bhavan", "/locations/iskon-ambli"],
    related: ["sg-highway-vs-iscon-ambli-road", "under-construction-vs-ready-to-move"],
  }),
  decisionPage({
    slug: "sg-highway-luxury-investment-guide",
    prefix: "invest",
    h1: "SG Highway Luxury Property Investment Guide",
    description: "How to assess SG Highway luxury property by micro-location, access, employment demand, supply, possession and exit depth.",
    intro: "SG Highway is an axis, not one homogeneous property market. Investment quality changes sharply by junction, service-road access, surrounding employment, neighbourhood occupation and competing supply.",
    takeaways: ["Underwrite the exact junction and access route.", "Separate tenant demand from speculative infrastructure stories.", "Compare future competing supply before projecting resale."],
    sections: [
      { heading: "Micro-Market Before Macro Story", body: ["A project near established offices, schools, hospitals and occupied neighbourhoods has a different demand base from one relying on future announcements.", "Drive the approach at office and school peaks; straight-line map distance does not reveal service-road friction or turning constraints."] },
      { heading: "Investment Tests", body: ["Review possession certainty, usable layout, maintenance, realistic rent, vacant competing inventory and the future buyer pool.", "PIKORUA treats infrastructure as supporting evidence and rejects appreciation claims that cannot be connected to actual accessibility and end-user demand."] },
    ],
    listings: ["/locations/sg-highway", "/investment-property-ahmedabad", "/properties"],
    related: ["high-roi-luxury-property-ahmedabad", "sg-highway-vs-iscon-ambli-road"],
  }),
  decisionPage({
    slug: "luxury-homes-business-families-ahmedabad",
    prefix: "learn",
    h1: "Luxury Homes for Business Families in Ahmedabad",
    description: "A residential brief for Ahmedabad business families comparing privacy, multigenerational planning, office access, staff flow and long-term stewardship.",
    intro: "A business-family home must support several generations, formal entertaining, private family life, staff movement, security and succession. Bedroom count alone is a poor proxy for that complexity.",
    takeaways: ["Map people and circulation before choosing format.", "Test office and school journeys together.", "Plan ownership and stewardship with qualified advisors."],
    sections: [
      { heading: "The Household Brief", body: ["Document resident generations, guests, prayer, work, entertaining, accessibility, staff, parking and future family changes before comparing properties.", "Entire-floor apartments reduce external upkeep; bungalows and plots provide control but demand more active stewardship."] },
      { heading: "Location and Governance", body: ["Sindhu Bhavan, Iscon-Ambli, Bodakdev and Thaltej offer mature access; Shilaj and other landed corridors broaden the custom-home choice.", "Legal, tax and succession structures belong with qualified professionals; the property search should supply them with accurate asset and use information."] },
    ],
    listings: ["/private-client-advisory", "/private-client-advisory/entire-floor-residences-ahmedabad", "/properties"],
    related: ["luxury-flats-vs-villas-ahmedabad", "carpet-area-vs-built-up-area"],
    hero: "private",
  }),
  decisionPage({
    slug: "multigenerational-luxury-residences-ahmedabad",
    prefix: "learn",
    h1: "Multi-Generational Luxury Residences in Ahmedabad",
    title: "Multigenerational Luxury Homes in Ahmedabad",
    description: "How Ahmedabad families should assess zoning, accessibility, privacy, staff circulation, parking and long-term adaptability.",
    intro: "A multi-generational residence succeeds when family members can live together without sacrificing autonomy. The plan must work for today’s household and remain adaptable as mobility, care and privacy requirements change.",
    takeaways: ["Separate shared and private zones.", "Plan lift and step-free access before it is needed.", "Check staff, service and parking circulation independently."],
    sections: [
      { heading: "Plan for Parallel Routines", body: ["Bedrooms are only the start. Kitchens, living rooms, work areas, prayer, guest access and acoustic separation determine whether multiple generations can maintain distinct routines.", "A duplex may create separation but can become restrictive for ageing residents; a large single-level floor plate may offer better long-term accessibility."] },
      { heading: "Ownership Horizon", body: ["Consider whether future branches of the family will share, divide, retain or sell the home. Highly personalised layouts can narrow resale demand.", "PIKORUA evaluates usable planning and market replacement while lawyers and tax professionals advise on ownership and succession."] },
    ],
    listings: ["/luxury-5bhk-ahmedabad", "/private-client-advisory/entire-floor-residences-ahmedabad", "/luxury-bungalows-ahmedabad"],
    related: ["luxury-flats-vs-villas-ahmedabad", "carpet-area-vs-built-up-area"],
    hero: "private",
  }),
  decisionPage({
    slug: "luxury-homes-near-corporate-offices-ahmedabad",
    prefix: "learn",
    h1: "Luxury Homes near Corporate Offices in Ahmedabad",
    description: "A commute-led guide to homes near SG Highway, Prahlad Nagar, Sindhu Bhavan, GIFT City routes and western Ahmedabad business districts.",
    intro: "A home near an office is valuable only when the real peak-hour route is reliable. Senior leaders should combine workplace access with schools, airport travel, security, family routines and relocation timing.",
    takeaways: ["Test peak-hour travel in both directions.", "Prioritise ready managed homes for urgent relocation.", "Do not confuse highway frontage with easy access."],
    sections: [
      { heading: "Match the Employment Node", body: ["Prahlad Nagar, SG Highway, SBR-area offices and GIFT City routes create different residential shortlists.", "A slightly longer but predictable journey can be better than a nearby project with difficult service-road access or recurring junction delay."] },
      { heading: "Relocation Practicalities", body: ["Ready possession, maintenance quality, security, pets, staff and school admissions may outweigh an architectural preference during a time-bound move.", "Remote video preparation can reduce the inspection list before the executive or family travels."] },
    ],
    listings: ["/private-client-advisory/corporate-leader-relocation-ahmedabad", "/locations/prahlad-nagar", "/locations/sg-highway"],
    related: ["sg-highway-luxury-investment-guide", "under-construction-vs-ready-to-move"],
  }),
  decisionPage({
    slug: "luxury-properties-near-schools-ahmedabad",
    prefix: "learn",
    h1: "Luxury Properties near Leading Schools in Ahmedabad",
    title: "Luxury Homes Near Top Schools in Ahmedabad",
    description: "How families should compare Ahmedabad homes using school routes, peak-hour reliability, child age, activities and long-term residential fit.",
    intro: "School proximity should be measured in reliable door-to-door time, not kilometres. Admission certainty, sibling needs, activities and office travel must be considered before a family pays a school-location premium.",
    takeaways: ["Test the route during school peak.", "Never assume admission from residential proximity.", "Choose a home that remains suitable after school years."],
    sections: [
      { heading: "Build the Family Timetable", body: ["Map drop-off, pickup, activities, office travel and backup caregiver routes for each shortlisted home.", "A property may be geographically close but operationally difficult because of U-turns, junctions, school queues or restricted access."] },
      { heading: "Avoid a Single-Purpose Purchase", body: ["School requirements change. The residence should retain neighbourhood, healthcare, social and resale value after the current school stage ends.", "PIKORUA can compare routes and neighbourhoods, while families must confirm admissions and transport directly with each institution."] },
    ],
    listings: ["/locations/thaltej", "/locations/bodakdev", "/locations/sindhu-bhavan"],
    related: ["thaltej-vs-bodakdev-investment", "bodakdev-vs-vastrapur"],
  }),
  decisionPage({
    slug: "apartment-vs-bungalow-ahmedabad",
    prefix: "compare",
    h1: "Luxury Apartment versus Bungalow in Ahmedabad",
    description: "Compare managed luxury apartments and independent bungalows for privacy, land control, security, maintenance, accessibility and resale.",
    intro: "An apartment externalises much of the ownership burden; a bungalow maximises control. The correct format depends on how much independence the household wants and how much maintenance, staffing and security it is prepared to manage.",
    takeaways: ["Apartments simplify security and maintenance.", "Bungalows provide land and modification control.", "Compare recurring effort as well as purchase price."],
    comparison: [
      { label: "Control", a: "Shared building governance", b: "Independent land and structure" },
      { label: "Maintenance", a: "Professionally pooled", b: "Owner managed" },
      { label: "Primary risk", a: "Society and density", b: "Title, condition and upkeep" },
    ],
    sections: [
      { heading: "Lifestyle Decision", body: ["Large apartments can deliver privacy, accessibility, amenities and lock-and-leave convenience without independent-property upkeep.", "Bungalows allow gardens, private arrival, staff planning and architectural change but demand active security and physical management."] },
      { heading: "Financial Decision", body: ["Apartment value depends heavily on building management and replacement supply. Bungalow value separates land quality from the condition and usefulness of the structure.", "Professional title, survey, condition and redevelopment review should match the chosen format."] },
    ],
    listings: ["/luxury-apartments-ahmedabad", "/luxury-bungalows-ahmedabad", "/properties"],
    related: ["luxury-flats-vs-villas-ahmedabad", "new-launch-vs-resale-ahmedabad"],
    hero: "landed",
  }),
  decisionPage({
    slug: "penthouse-vs-duplex-ahmedabad",
    prefix: "compare",
    h1: "Penthouse versus Duplex Home in Ahmedabad",
    description: "Compare Ahmedabad penthouses and duplex residences for views, terraces, internal stairs, privacy, accessibility and resale.",
    intro: "Penthouse describes position; duplex describes internal organisation. A residence can be both, but buyers must evaluate terrace rights and top-floor conditions separately from the benefits and limitations of a two-level plan.",
    takeaways: ["Verify terrace rights and waterproofing.", "Test the internal stair for daily family use.", "Single-level accessibility generally broadens resale demand."],
    comparison: [
      { label: "Defining feature", a: "Top-floor position and possible terrace", b: "Two internally connected levels" },
      { label: "Strength", a: "Views, light and scarcity", b: "Separation of household zones" },
      { label: "Primary risk", a: "Heat, waterproofing and rights", b: "Stairs, split circulation and resale" },
    ],
    sections: [
      { heading: "Do Not Compare Labels", body: ["Some penthouses have compromised cores or unclear terrace rights; some duplexes create excellent separation between formal and private floors.", "Compare usable area, lift arrival, ceiling heights, staff movement and the daily route between kitchen, bedrooms and living spaces."] },
      { heading: "Long-Term Fit", body: ["Internal stairs can become inconvenient for older residents, young children or service routines. Lift access to both levels materially changes usability.", "PIKORUA tests the premium against actual scarcity and the future audience rather than relying on brochure terminology."] },
    ],
    listings: ["/penthouses-ahmedabad", "/properties"],
    related: ["carpet-area-vs-built-up-area", "new-launch-vs-resale-ahmedabad"],
  }),
  decisionPage({
    slug: "evaluate-luxury-property-developer-ahmedabad",
    prefix: "learn",
    h1: "How to Evaluate a Luxury Property Developer in Ahmedabad",
    title: "How to Evaluate a Luxury Developer in Ahmedabad",
    description: "A practical developer-review framework covering delivery history, GujRERA disclosures, specifications, finances, after-sales and completed projects.",
    intro: "Developer quality is demonstrated by completed outcomes and disclosure behaviour, not launch presentation. Review what was promised, what was delivered and how the developer responded when timelines or specifications changed.",
    takeaways: ["Inspect completed projects, not only sample spaces.", "Compare GujRERA filings with site reality.", "Speak to existing owners about handover and after-sales."],
    sections: [
      { heading: "Evidence to Collect", body: ["Review entity identity, title structure, GujRERA registration and updates, approvals, construction progress, delivery history, litigation checks and the agreement’s treatment of delay or specification change.", "Visit older delivered projects to inspect ageing, facility management, waterproofing, lifts, landscaping and whether promised common areas remain operational."] },
      { heading: "Commercial Behaviour", body: ["Compare payment demands with construction milestones and ask how changes, cancellations, defects and handover documentation are handled.", "PIKORUA coordinates property evidence; the buyer’s lawyer, engineer and financial professionals should independently review their respective risks."] },
    ],
    listings: ["/properties", "/learn/rera-gujarat-guide", "/contact"],
    related: ["rera-gujarat-guide", "under-construction-vs-ready-to-move"],
  }),
  decisionPage({
    slug: "inspect-luxury-sample-apartment",
    prefix: "learn",
    h1: "How to Inspect a Luxury Sample Apartment",
    description: "A room-by-room framework for separating sample-apartment styling from actual space, specification, light, services and deliverables.",
    intro: "A sample apartment is a sales environment. Inspect it to understand planning, but verify every finish, dimension, view and service assumption against sanctioned drawings, specifications and the actual unit being purchased.",
    takeaways: ["Measure clear room dimensions and circulation.", "Mark every non-standard display upgrade.", "Compare sample orientation with the actual unit."],
    sections: [
      { heading: "Look Past Styling", body: ["Check door swings, furniture scale, storage depth, passage width, ceiling drops, daylight, privacy between rooms and the relationship between kitchen, dining and service areas.", "Ask which flooring, sanitaryware, automation, kitchen, wardrobes, lighting and air-conditioning items are included in the agreement."] },
      { heading: "Translate to the Real Unit", body: ["Confirm stack, orientation, floor, balcony depth, columns, shafts, views and neighbouring construction for the unit under consideration.", "Photographs and notes should become a written deviation list for legal and technical review before booking."] },
    ],
    listings: ["/properties", "/luxury-apartments-ahmedabad", "/contact"],
    related: ["carpet-area-vs-built-up-area", "under-construction-vs-ready-to-move"],
  }),
  decisionPage({
    slug: "compare-two-luxury-projects-ahmedabad",
    prefix: "learn",
    h1: "How to Compare Two Luxury Projects in Ahmedabad",
    description: "A weighted comparison method for location, usable area, density, developer, delivery, ownership cost, risks and resale.",
    intro: "Two luxury projects should be compared through one written decision model. Marketing presentations hide trade-offs by changing the order and units of information; a common scorecard forces like-for-like evaluation.",
    takeaways: ["Use one definition of area and total cost.", "Weight criteria before seeing the final shortlist.", "Record unresolved risks instead of averaging them away."],
    sections: [
      { heading: "Create the Common Dataset", body: ["Record total cost, carpet and usable area, density, parking, possession, developer evidence, access, views, maintenance, legal status and expected rectification for both projects.", "Separate non-negotiable rejection conditions from weighted preferences so a serious legal or access risk cannot be hidden by amenities."] },
      { heading: "Make the Decision Reversible", body: ["Write the strongest reason to buy, strongest reason to decline and missing evidence for each option. Revisit the score after a second inspection and professional review.", "PIKORUA’s role is to make the trade-offs visible and negotiate the whole transaction—not to make two unsuitable projects appear comparable."] },
    ],
    listings: ["/properties", "/contact", "/ahmedabad-luxury-property-market-report"],
    related: ["evaluate-luxury-property-developer-ahmedabad", "inspect-luxury-sample-apartment"],
  }),
];
