/**
 * returns-disclaimer.ts
 *
 * Management decided (25 Nov 2026) to keep the return, yield and price-rise
 * figures already on the site and in blog posts, and to show a visible
 * "not guaranteed" note wherever they appear. `mentionsReturnFigures` finds
 * those pages from their own text when they render, so new pages and new
 * blog posts get the note automatically.
 *
 * A disclaimer qualifies a figure; it does not make a false claim true (CCPA
 * Guidelines for Prevention of Misleading Advertisements, 2022). Figures we
 * know are wrong should still be corrected.
 */

const RETURN_WORDS =
  "(?:returns?|yields?|apprecia\\w*|gains?|growth|grew|rises?|rose|increases?|increased|roi|cagr|upside|irr|jump\\w*|benefits?|profits?|surg\\w*|hikes?|projections?|projected|premium)";
const PERCENT = "\\d+(?:\\.\\d+)?\\s*(?:[–-]\\s*\\d+(?:\\.\\d+)?\\s*)?%";
const RETURN_FIGURE_RE = new RegExp(
  `${PERCENT}[^.%]{0,60}?\\b${RETURN_WORDS}\\b|\\b${RETURN_WORDS}\\b[^.%]{0,60}?${PERCENT}`,
  "gi"
);
/** Tax rates ("gains are taxed at 12.5%") are not return figures. */
const TAX_CONTEXT_RE = /\btax\w*|\bltcg\b|\bstcg\b|capital gains/i;

/** True when the text quotes a percentage return, yield, gain or price rise. */
export function mentionsReturnFigures(text: string): boolean {
  for (const match of text.matchAll(RETURN_FIGURE_RE)) {
    if (!TAX_CONTEXT_RE.test(match[0])) return true;
  }
  return false;
}

export const RETURNS_DISCLAIMER = {
  heading: "Returns are not guaranteed",
  text:
    "Any return, rental yield, price rise or growth figure on this page is an estimate, an example or past data. It is not a promise or a forecast for any particular property. Property prices and rents can fall as well as rise, and past performance does not guarantee future results. Check the numbers for a specific property with your own advisers before you decide.",
} as const;
