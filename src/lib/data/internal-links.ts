/**
 * internal-links.ts
 *
 * "Explore further" link groups shown near the foot of landing pages
 * (LandingPageTemplate). Google's URL Inspection on 20–21 Nov 2026 showed most
 * filter pages (/ahmedabad/luxury-flats/...), NRI country pages and smaller
 * area guides as "Discovered – currently not indexed": they were linked from
 * one to five pages each. These groups link them from the pages Google already
 * indexes and ranks (luxury apartments, penthouses, villas, NRI consultant,
 * the main area guides) and from each other.
 *
 * Every link is checked against getRenderablePublicPaths() and PAGE_MERGES,
 * so a merged, redirected or removed page drops out instead of becoming a
 * broken or redirecting link.
 */

import type { GeoLandingPage } from "@/lib/data/geo";
import { LUXURY_LIVING_AREAS } from "@/lib/data/location-network";
import { getRenderablePublicPaths } from "@/lib/data/public-routes";
import { PAGE_MERGES } from "@/lib/data/page-merges";

export interface ExploreLink {
  href: string;
  label: string;
}

export interface ExploreLinkGroup {
  heading: string;
  links: ExploreLink[];
}

// ─── Link sets (anchor text written to read naturally) ───────────────────

const FLAT_FILTERS: ExploreLink[] = [
  { href: "/ahmedabad/luxury-flats/under-2-cr", label: "Luxury flats under ₹2 Cr" },
  { href: "/ahmedabad/luxury-flats/under-3-cr", label: "Luxury flats under ₹3 Cr" },
  { href: "/ahmedabad/luxury-flats/under-5-cr", label: "Luxury flats under ₹5 Cr" },
  { href: "/ahmedabad/luxury-flats/above-5-cr", label: "Luxury flats above ₹5 Cr" },
  { href: "/ahmedabad/luxury-flats/2-bhk", label: "2 BHK luxury flats" },
  { href: "/ahmedabad/luxury-flats/3-bhk", label: "3 BHK luxury flats" },
  { href: "/ahmedabad/duplex-flats", label: "Duplex flats" },
  { href: "/ahmedabad/luxury-flats/ready-to-move", label: "Ready-to-move luxury flats" },
  { href: "/ahmedabad/luxury-flats/under-construction", label: "Under-construction luxury flats" },
  { href: "/ahmedabad/luxury-flats/new-launch", label: "New-launch luxury flats" },
  { href: "/ahmedabad/luxury-flats/for-self-use", label: "Luxury flats for self-use" },
  { href: "/ahmedabad/luxury-flats/rental-income", label: "Luxury flats for rental income" },
];

const BUYER_GUIDES: ExploreLink[] = [
  { href: "/ahmedabad/property-buying-guide", label: "Ahmedabad property buying guide" },
  { href: "/ahmedabad/best-location-for-investment", label: "Best areas to invest in Ahmedabad" },
  { href: "/ahmedabad/villas-vs-penthouses", label: "Villas vs penthouses" },
  { href: "/ahmedabad/residential-projects", label: "Residential projects in Ahmedabad" },
  { href: "/invest/commonwealth-games-2030-ahmedabad-property", label: "Commonwealth Games 2030 and Ahmedabad property" },
  { href: "/invest/ahmedabad-olympics-2036-property", label: "Ahmedabad's 2036 Olympic bid and property" },
];

const NRI_COUNTRY_HUBS: ExploreLink[] = [
  { href: "/nri/usa", label: "NRIs in the USA" },
  { href: "/nri/uk", label: "NRIs in the UK" },
  { href: "/nri/dubai", label: "NRIs in Dubai and the UAE" },
  { href: "/nri/canada", label: "NRIs in Canada" },
  { href: "/nri/australia", label: "NRIs in Australia" },
  { href: "/nri/singapore", label: "NRIs in Singapore" },
  { href: "/nri/gcc", label: "NRIs in the Gulf (GCC)" },
  { href: "/nri/east-africa", label: "East African Gujaratis" },
  { href: "/nri/global", label: "NRIs elsewhere" },
];

/** Country detail pages, keyed by the country words that appear in hrefs. */
const NRI_COUNTRY_DETAILS: { match: RegExp; links: ExploreLink[] }[] = [
  {
    match: /usa|america/,
    links: [
      { href: "/nri/usa/luxury-flats-ahmedabad", label: "Luxury flats for US-based NRIs" },
      { href: "/nri/usa/property-investment-ahmedabad", label: "Property investment from the USA" },
    ],
  },
  {
    match: /\buk\b|britain/,
    links: [
      { href: "/nri/uk/luxury-properties-ahmedabad", label: "Luxury homes for UK-based NRIs" },
      { href: "/nri/uk/buy-property-ahmedabad", label: "Buying property from the UK" },
    ],
  },
  {
    match: /dubai|uae/,
    links: [
      { href: "/nri/dubai/luxury-flats-ahmedabad", label: "Luxury flats for Dubai-based NRIs" },
      { href: "/nri/dubai/property-investment-ahmedabad", label: "Property investment from Dubai" },
    ],
  },
  {
    match: /canada/,
    links: [{ href: "/nri/canada/luxury-properties-ahmedabad", label: "Luxury homes for Canada-based NRIs" }],
  },
  {
    match: /australia/,
    links: [{ href: "/nri/australia/property-investment-ahmedabad", label: "Property investment from Australia" }],
  },
  {
    match: /singapore/,
    links: [{ href: "/nri/singapore/luxury-flats-ahmedabad", label: "Luxury flats for Singapore-based NRIs" }],
  },
];

const NRI_TOPICS: ExploreLink[] = [
  { href: "/nri/nri-property-eligibility-fema", label: "What NRIs and OCIs can buy (FEMA)" },
  { href: "/nri/buying-home-for-parents-ahmedabad", label: "Buying a home for parents" },
  { href: "/nri/best-properties-in-ahmedabad-under-2-crore-for-nris", label: "NRI options under ₹2 Cr" },
  { href: "/nri/high-rental-yield-properties-in-ahmedabad-for-nris", label: "Rental yield for NRIs" },
  { href: "/nri/ahmedabad-vs-dubai-real-estate-investment", label: "Ahmedabad vs Dubai" },
  { href: "/nri/india-vs-usa-property-roi-for-nris", label: "India vs USA property returns" },
  { href: "/nri/non-resident-gujarati-property-ahmedabad", label: "Non-resident Gujaratis" },
  { href: "/invest/commonwealth-games-2030-ahmedabad-property", label: "Commonwealth Games 2030: what it means for NRI buyers" },
];

const LANDMARK_GUIDES: ExploreLink[] = [
  { href: "/locations/rajpath-club", label: "Homes near Rajpath Club" },
  { href: "/locations/karnavati-club", label: "Homes near Karnavati Club" },
  { href: "/locations/zydus-hospital", label: "Homes near Zydus Hospital" },
  { href: "/locations/palladium-mall", label: "Homes near Palladium Mall" },
  { href: "/locations/ahmedabad-airport", label: "Homes near Ahmedabad Airport" },
];

const BEFORE_YOU_BUY: ExploreLink[] = [
  { href: "/learn/jantri-rates-ahmedabad", label: "Jantri rates in Ahmedabad" },
  { href: "/learn/rera-gujarat-guide", label: "GujRERA checks before you buy" },
  { href: "/learn/carpet-area-vs-built-up-area", label: "Carpet area vs built-up area" },
  { href: "/learn/evaluate-luxury-property-developer-ahmedabad", label: "How to judge a developer" },
];

/** Head-to-head comparisons, shown only on the pages they compare. */
const COMPARISONS: { hosts: string[]; link: ExploreLink }[] = [
  {
    hosts: ["/locations/sindhu-bhavan", "/locations/iskon-ambli", "/sindhu-bhavan-road-properties"],
    link: { href: "/compare/sindhu-bhavan-road-vs-iscon-ambli-road", label: "Sindhu Bhavan Road vs Iscon–Ambli Road" },
  },
  {
    hosts: ["/locations/thaltej", "/locations/shilaj", "/luxury-villas-ahmedabad"],
    link: { href: "/compare/thaltej-vs-shilaj", label: "Thaltej vs Shilaj" },
  },
  {
    hosts: ["/locations/bodakdev", "/locations/vastrapur"],
    link: { href: "/compare/bodakdev-vs-vastrapur", label: "Bodakdev vs Vastrapur" },
  },
  {
    hosts: ["/locations/nehru-nagar", "/locations/satellite", "/locations/ambawadi"],
    link: { href: "/compare/nehrunagar-vs-western-ahmedabad", label: "Nehrunagar vs western Ahmedabad" },
  },
  {
    hosts: ["/penthouses-ahmedabad", "/ahmedabad/duplex-flats"],
    link: { href: "/compare/penthouse-vs-duplex-ahmedabad", label: "Penthouse vs duplex" },
  },
  {
    hosts: ["/luxury-apartments-ahmedabad", "/luxury-villas-ahmedabad"],
    link: { href: "/compare/apartment-vs-bungalow-ahmedabad", label: "Apartment vs bungalow" },
  },
];

// ─── Which pages show which groups ───────────────────────────────────────

/** Pages that show the flat filters (apartment-led pages). */
const FLAT_FILTER_HOSTS = new Set([
  "/luxury-apartments-ahmedabad",
  "/luxury-real-estate-ahmedabad",
  "/luxury-4bhk-ahmedabad",
  "/luxury-5bhk-ahmedabad",
  "/luxury-homes-ahmedabad",
  "/ultra-luxury-properties-ahmedabad",
  "/penthouses-ahmedabad",
  "/investment-property-ahmedabad",
]);

/** Pages that show the Ahmedabad buyer guides. */
const BUYER_GUIDE_HOSTS = new Set([
  "/luxury-apartments-ahmedabad",
  "/luxury-real-estate-ahmedabad",
  "/penthouses-ahmedabad",
  "/luxury-villas-ahmedabad",
  "/luxury-bungalows-ahmedabad",
  "/luxury-plots-ahmedabad",
  "/investment-property-ahmedabad",
  "/real-estate-consultant-ahmedabad",
  "/luxury-property-consultant-ahmedabad",
  "/ultra-luxury-properties-ahmedabad",
]);

function areaLinks(group: string, selfHref: string): ExploreLink[] {
  return LUXURY_LIVING_AREAS.filter((area) => area.group === group && area.href !== selfHref).map((area) => ({
    href: area.href,
    label: area.label,
  }));
}

/** NRI hub pages that link every country detail page. */
const NRI_ALL_COUNTRY_HOSTS = new Set([
  "/nri",
  "/nri-property-consultant-ahmedabad",
  "/nri-property-investment-ahmedabad",
]);

const AREA_GROUP_HEADINGS: Record<string, string> = {
  "Established luxury area": "Other established luxury areas",
  "Growth and landed-property corridor": "Other growth and villa corridors",
};

export function getExploreLinkGroups(page: GeoLandingPage, alreadyLinked: string[] = []): ExploreLinkGroup[] {
  const href = page.href;
  const isAhmedabadSeries = href.startsWith("/ahmedabad/");
  const isNri = page.kind === "nri" || href.startsWith("/nri");
  const groups: ExploreLinkGroup[] = [];

  if (FLAT_FILTER_HOSTS.has(href) || isAhmedabadSeries) {
    groups.push({ heading: "Luxury flats in Ahmedabad by budget, size and stage", links: FLAT_FILTERS });
  }
  if (BUYER_GUIDE_HOSTS.has(href) || isAhmedabadSeries) {
    groups.push({ heading: "Ahmedabad buyer guides", links: BUYER_GUIDES });
  }

  if (isNri) {
    // Country pages show their own detail pages; the NRI hubs show them all.
    const countryLinks = NRI_ALL_COUNTRY_HOSTS.has(href)
      ? NRI_COUNTRY_DETAILS.flatMap(({ links }) => links)
      : NRI_COUNTRY_DETAILS.filter(({ match }) => match.test(href)).flatMap(({ links }) => links);
    groups.push({ heading: "NRI property guides by country", links: [...countryLinks, ...NRI_COUNTRY_HUBS] });
    groups.push({ heading: "Common NRI buying questions", links: NRI_TOPICS });
  }

  const comparisons = COMPARISONS.filter(({ hosts }) => hosts.includes(href)).map(({ link }) => link);
  if (comparisons.length > 0) {
    groups.push({ heading: "Compare before you choose", links: comparisons });
  }

  if (page.kind === "location") {
    const ownArea = LUXURY_LIVING_AREAS.find((area) => area.href === href);
    if (ownArea) {
      groups.push({
        heading: AREA_GROUP_HEADINGS[ownArea.group] ?? "Other area guides",
        links: areaLinks(ownArea.group, href),
      });
    } else {
      // Landmark pages (near a club, hospital, mall or the airport).
      groups.push({ heading: "Established luxury area guides", links: areaLinks("Established luxury area", href) });
    }
    groups.push({ heading: "Homes near Ahmedabad landmarks", links: LANDMARK_GUIDES });
  }

  if (page.kind === "location" || BUYER_GUIDE_HOSTS.has(href)) {
    groups.push({ heading: "Before you buy", links: BEFORE_YOU_BUY });
  }

  // Drop self-links, links already shown as Related Guides, and anything
  // that no longer renders; then drop groups left empty.
  const renderable = getRenderablePublicPaths();
  const seen = new Set<string>([href, ...alreadyLinked]);
  return groups
    .map((group) => ({
      heading: group.heading,
      links: group.links.filter((link) => {
        if (seen.has(link.href) || !renderable.has(link.href) || PAGE_MERGES[link.href]) return false;
        seen.add(link.href);
        return true;
      }),
    }))
    .filter((group) => group.links.length > 0);
}
