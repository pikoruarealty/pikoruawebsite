/**
 * page-merges.ts
 *
 * Duplicate pages merged into one page per search intent (keyword
 * cannibalisation, docs/seo/KEYWORD_EXPANSION_2026-10-30.md §5). Each key
 * 301-redirects to its value (next.config.ts), drops out of the sitemaps and
 * generated internal links (public-routes.ts), and must not be linked by hand.
 *
 * Winners were picked from Search Console (28 Jul–28 Oct 2026): the page with
 * the clicks and impressions wins. Groups containing a protected URL
 * (docs/SEO_AEO_MASTER_PLAN.md Appendix C) are not merged here without a
 * separate decision.
 *
 * This file has no imports: next.config.ts reads it directly.
 */
export const PAGE_MERGES: Readonly<Record<string, string>> = {
  // Penthouses (winner: 38 clicks / 2,375 impressions)
  "/ahmedabad/penthouses": "/penthouses-ahmedabad",
  "/ahmedabad/penthouses/3-bhk": "/penthouses-ahmedabad",
  "/ahmedabad/penthouses/4-bhk": "/penthouses-ahmedabad",
  "/ahmedabad/penthouses/5-bhk": "/penthouses-ahmedabad",
  "/ahmedabad/5-bhk-penthouses": "/penthouses-ahmedabad",
  "/private-client-advisory/luxury-penthouses-ahmedabad": "/penthouses-ahmedabad",
  // Luxury flats / apartments (winner: 80 clicks / 11,179 impressions; protected)
  "/ahmedabad/luxury-flats": "/luxury-apartments-ahmedabad",
  // 4 BHK and 5 BHK
  "/ahmedabad/4-bhk-luxury-flats": "/luxury-4bhk-ahmedabad",
  "/ahmedabad/luxury-flats/4-bhk": "/luxury-4bhk-ahmedabad",
  "/ahmedabad/luxury-flats/5-bhk": "/luxury-5bhk-ahmedabad",
  // Villas and bungalows
  "/ahmedabad/villas": "/luxury-villas-ahmedabad",
  "/private-client-advisory/luxury-bungalows-ahmedabad": "/luxury-bungalows-ahmedabad",
  // High-ROI and investment property
  "/ahmedabad/high-roi-investment-properties": "/invest/high-roi-luxury-property-ahmedabad",
  "/ahmedabad/luxury-flats/high-roi": "/invest/high-roi-luxury-property-ahmedabad",
  "/ahmedabad/investment-properties": "/investment-property-ahmedabad",
  "/ahmedabad/luxury-flats/for-investment": "/investment-property-ahmedabad",
  // Market trend
  "/ahmedabad/real-estate-trends-2026": "/ahmedabad-luxury-property-market-report",
  "/invest/ahmedabad-luxury-market-outlook-2026": "/ahmedabad-luxury-property-market-report",
  // Ready-to-move vs under-construction (near-identical pages)
  "/ahmedabad/ready-to-move-vs-under-construction": "/compare/under-construction-vs-ready-to-move",
  // Luxury homes umbrella
  "/luxury-homes-ahmedabad": "/luxury-real-estate-ahmedabad",
  "/ahmedabad/luxury-homes": "/luxury-real-estate-ahmedabad",
  "/ahmedabad/premium-properties": "/luxury-real-estate-ahmedabad",
  // NRI buying process (winner: 7 clicks, position 5.4; the others had 0 clicks).
  // The winner gained short sections covering the retired pages' topics.
  "/nri-home-buying-process-india": "/learn/how-to-buy-property-as-nri-ahmedabad",
  "/nri-buying-property-in-ahmedabad": "/learn/how-to-buy-property-as-nri-ahmedabad",
  // Ultra-luxury: the full guide (~630 words) is kept; the thin private-client
  // page (~250 words, 1 click in 3 months) redirects into it.
  "/private-client-advisory/ultra-luxury-property-ahmedabad": "/ultra-luxury-properties-ahmedabad",
  // Plots (winner: 9 clicks / 576 impressions vs 2 / 98); villa-plot guidance moved in.
  "/private-client-advisory/villa-plots-ahmedabad": "/luxury-plots-ahmedabad",
};

/** The page `href` now lives at (itself when it was not merged). */
export function mergedHref(href: string): string {
  return PAGE_MERGES[href] ?? href;
}

/** False for a page that now redirects to another one. */
export function isLivePage(page: { href: string }): boolean {
  return !PAGE_MERGES[page.href];
}
