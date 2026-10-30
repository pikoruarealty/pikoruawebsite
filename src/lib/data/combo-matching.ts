/**
 * combo-matching.ts
 *
 * Decides which properties a /p/[...combo] page lists and whether the page
 * may be indexed. Shared by the page itself and by the combo sitemap, so a
 * URL is only ever submitted to search engines if the page would serve it
 * as indexable.
 *
 * Two modes:
 *  - Legacy (default): the original loose matching — location matched by
 *    any slug word ("road" matches every "... Road" listing), budget and
 *    intent ignored. Kept as the default so deploying this file does not
 *    change which pages are indexed.
 *  - Strict (SEO_COMBO_STRICT_MATCHING=true): exact location aliases, real
 *    BHK and budget filters, intent pages and non-allowed commercial types
 *    noindexed, and a minimum number of genuine matches before a page is
 *    indexable. See docs/SEO_AEO_MASTER_PLAN.md §4.2 (Stage 1) — enable
 *    after exporting /p/ page data from Search Console (Stage 0).
 */

import type { StaticProperty } from "@/lib/data/properties";
import type { ParsedCombo, SeoDimBudget, SeoDimLocation } from "@/lib/data/seo-dimensions";

export function isStrictComboMatching(): boolean {
  return process.env.SEO_COMBO_STRICT_MATCHING === "true";
}

/**
 * Combo types outside the residential-first rule (CLAUDE.md). Office space
 * is the allowed commercial add-on; retail, warehouse and commercial plots
 * are not, so they are never submitted in sitemaps and are noindexed in
 * strict mode.
 */
export const NON_INDEXABLE_COMBO_TYPES = new Set(["retail-space", "warehouse", "commercial-plots"]);

/** Strict mode: fewer genuine matches than this and the page is noindex. */
export const STRICT_MIN_MATCHES = 2;

const TYPE_CATEGORIES: Record<string, string[]> = {
  "luxury-flats": ["apartment", "condo", "condominium"],
  "penthouses": ["penthouse", "penthouse-suite"],
  "villas": ["villa", "bungalow", "townhouse", "townhome", "row-house", "estate"],
  "duplex": ["duplex", "duplex-condo"],
  "office-space": ["commercial-office", "office", "office-condo"],
  "retail-space": ["commercial-retail", "retail", "showroom"],
  "commercial-plots": ["commercial-plot", "plot"],
  "warehouse": ["warehouse"],
};

/** Combo location slug → property `location` slugs that are the same place. */
const LOCATION_ALIASES: Record<string, string[]> = {
  "iscon-ambli-road": ["iskon-ambli"],
  "sindhubhavan-road": ["sindhu-bhavan"],
  "sg-highway": ["sg-highway"],
  "thaltej": ["thaltej"],
  "shilaj": ["shilaj"],
};

function normalizePlace(value: string): string {
  return value.toLowerCase().replace(/\broad\b/g, "").replace(/[^a-z]/g, "");
}

function matchesLocationStrict(p: StaticProperty, loc: SeoDimLocation): boolean {
  if (LOCATION_ALIASES[loc.slug]?.includes(p.location)) return true;
  const label = normalizePlace(p.locationLabel ?? "");
  return label !== "" && (label === normalizePlace(loc.label) || label === normalizePlace(loc.slug));
}

function matchesLocationLegacy(p: StaticProperty, loc: SeoDimLocation): boolean {
  const locSlug = loc.slug.toLowerCase();
  const propLoc = (p.locationLabel ?? "").toLowerCase();
  const propSlug = (p.location ?? "").toLowerCase();
  return propLoc.includes(locSlug) || propSlug.includes(locSlug) ||
    locSlug.split("-").some((word) => propLoc.includes(word) || propSlug.includes(word));
}

/** Bedroom counts in a configuration string, e.g. "4 & 5 BHK | 6 BHK" → {4,5,6}. */
export function parseBhkCounts(configuration: string): Set<number> {
  const counts = new Set<number>();
  for (const match of configuration.matchAll(/((?:\d+\s*(?:,|&|and|\|)?\s*)+)BHK/gi)) {
    for (const n of match[1].match(/\d+/g) ?? []) counts.add(Number(n));
  }
  return counts;
}

/** Price string → [min, max] in crore, e.g. "₹5.50 Cr – ₹8.25 Cr" → [5.5, 8.25]. */
export function parsePriceRangeCr(price: string | undefined): [number, number] | null {
  if (!price) return null;
  const values = [...price.matchAll(/(\d+(?:\.\d+)?)\s*(cr|crore|l|lac|lakh)\b/gi)].map((m) =>
    /^c/i.test(m[2]) ? Number(m[1]) : Number(m[1]) / 100
  );
  if (values.length === 0) return null;
  return [Math.min(...values), Math.max(...values)];
}

function overlapsBudget(price: string | undefined, budget: SeoDimBudget): boolean {
  const range = parsePriceRangeCr(price);
  if (!range) return false;
  return range[0] < budget.maxCr && range[1] >= budget.minCr;
}

/** Properties a combo page lists (max 12). */
export function matchComboProperties(parsed: ParsedCombo, properties: StaticProperty[]): StaticProperty[] {
  const strict = isStrictComboMatching();
  const { location: loc, type, bhk, budget } = parsed;

  return properties.filter((p) => {
    if (loc && !(strict ? matchesLocationStrict(p, loc) : matchesLocationLegacy(p, loc))) return false;

    if (type && p.category) {
      const valid = TYPE_CATEGORIES[type.slug] ?? [];
      if (valid.length > 0 && !valid.some((c) => p.category?.includes(c))) return false;
    }

    if (bhk && type?.bhkApplicable && p.configuration) {
      if (strict) {
        if (!parseBhkCounts(p.configuration).has(bhk.bedroomCount)) return false;
      } else if (!p.configuration.includes(bhk.shortLabel)) {
        return false;
      }
    }

    if (strict && budget && !overlapsBudget(p.price, budget)) return false;

    return true;
  }).slice(0, 12);
}

/** Whether a combo page with these matches should be indexable. */
export function isComboIndexable(parsed: ParsedCombo, matches: StaticProperty[]): boolean {
  if (!isStrictComboMatching()) return matches.length > 0;
  if (parsed.type && NON_INDEXABLE_COMBO_TYPES.has(parsed.type.slug)) return false;
  // Intent ("for-investment", "high-roi"…) changes only template copy, never
  // the listings, so those pages duplicate their parent combo.
  if (parsed.intent) return false;
  return matches.length >= STRICT_MIN_MATCHES;
}
