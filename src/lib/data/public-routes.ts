/**
 * public-routes.ts
 *
 * Which data-defined landing pages actually render at their `href`.
 *
 * Several data files define pages whose `href` doesn't match how the route
 * that serves them looks the page up (e.g. a long-tail page with
 * slug "ahmedabad-best-areas-to-invest" but href
 * "/ahmedabad/best-areas-to-invest-in-real-estate", or "/ahmedabad/thaltej/…"
 * hrefs when the route lives at /ahmedabad/locations/[location]/[type]).
 * Those hrefs 404 — so the sitemap and any generated internal link must be
 * built from this resolver, which mirrors each route's own lookup, rather
 * than from the raw data lists.
 */

import {
  ALL_GEO_LANDING_PAGES,
  getAhmedabadLocationPage,
  getAhmedabadTypePage,
  getLocationLandingPage,
  getNriGeoPage,
  getNriLandingPage,
  getPropertyTypeLandingPage,
  getRootLandingPage,
  type GeoLandingPage,
} from "@/lib/data/geo";
import { getPrivateClientPageByUrlSlug } from "@/lib/data/private-client-advisory";
import { ALL_CONTENT_HUB_PAGES } from "@/lib/data/content-hubs";

/** Hand-built public pages (not generated from data). */
export const STATIC_PUBLIC_PATHS = [
  "/",
  "/about",
  "/ahmedabad-luxury-property-market-report",
  "/blog",
  "/compare",
  "/contact",
  "/gift-city",
  "/invest",
  "/learn",
  "/locations",
  "/nri",
  "/press",
  "/private-client-advisory",
  "/private-property-advisory-public-figures",
  "/privacy",
  "/properties",
  "/property-types",
  "/terms",
  "/testimonials",
] as const;

/** The page the route serving `href` would look up, or undefined if it 404s. */
function lookupGeoRoute(href: string): GeoLandingPage | undefined {
  const s = href.split("/").filter(Boolean);
  if (s.length === 1) return getRootLandingPage(s[0]);
  if (s[0] === "locations" && s.length === 2) return getLocationLandingPage(s[1]);
  if (s[0] === "property-types" && s.length === 2) return getPropertyTypeLandingPage(s[1]);
  if (s[0] === "private-client-advisory" && s.length === 2) return getPrivateClientPageByUrlSlug(s[1]);
  if (s[0] === "nri" && s.length === 2) return getNriLandingPage(s[1]);
  if (s[0] === "nri" && s.length === 3) return getNriGeoPage(`${s[1]}-${s[2]}`);
  if (s[0] === "ahmedabad" && s[1] === "locations" && s.length === 4) {
    return getAhmedabadLocationPage(`${s[2]}-${s[3]}`);
  }
  if (s[0] === "ahmedabad" && s.length === 2) return getAhmedabadTypePage(`ahmedabad-${s[1]}`);
  if (s[0] === "ahmedabad" && s.length === 3) return getAhmedabadTypePage(`ahmedabad-${s[1]}-${s[2]}`);
  return undefined;
}

/** True when the route serving `page.href` resolves back to this same page. */
export function isRenderableGeoPage(page: GeoLandingPage): boolean {
  return lookupGeoRoute(page.href)?.href === page.href;
}

/** Geo landing pages that render at their href (de-duplicated by href). */
export function getRenderableGeoPages(): GeoLandingPage[] {
  const seen = new Set<string>();
  return ALL_GEO_LANDING_PAGES.filter((page) => {
    if (seen.has(page.href) || !isRenderableGeoPage(page)) return false;
    seen.add(page.href);
    return true;
  });
}

/**
 * Old property slugs that next.config.ts redirects to a corrected slug. The
 * DB can still hold the old row as active; a redirecting URL must not be
 * submitted. Keep in sync with the /properties/ redirects in next.config.ts.
 */
const REDIRECTED_PROPERTY_SLUGS = new Set(["4-5-bhk-penthouse-duplex-7300-15500-sindhu-bhavan"]);

/**
 * Property slugs to submit in /sitemap/properties.xml: active DB rows, plus
 * static entries with no DB row. The detail route renders the DB row whenever
 * one exists, so an inactive row hides its same-slug static entry too.
 */
export function getSitemapPropertySlugs(
  dbProperties: { slug: string; isActive: boolean }[],
  staticSlugs: string[]
): string[] {
  const dbSlugs = new Set(dbProperties.map((p) => p.slug));
  return Array.from(
    new Set([
      ...dbProperties.filter((p) => p.isActive).map((p) => p.slug),
      ...staticSlugs.filter((slug) => !dbSlugs.has(slug)),
    ])
  ).filter((slug) => !REDIRECTED_PROPERTY_SLUGS.has(slug));
}

/** Every data-defined public path that renders (static + geo + content hubs). */
export function getRenderablePublicPaths(): Set<string> {
  return new Set<string>([
    ...STATIC_PUBLIC_PATHS,
    ...getRenderableGeoPages().map((page) => page.href),
    ...ALL_CONTENT_HUB_PAGES.map((page) => page.href),
  ]);
}
