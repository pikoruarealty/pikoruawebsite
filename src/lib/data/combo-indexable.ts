/**
 * combo-indexable.ts
 *
 * Should another page link to a /p/[...combo] URL? Only when that page is
 * indexable. Most combos have no matching listing, so the /p/ page serves
 * "noindex"; linking to thousands of them made Google crawl pages it was told
 * to skip (Search Console, Oct 2026: 4,844 "Excluded by noindex").
 *
 * Uses the same rule as the page itself and the combo sitemap
 * (matchComboProperties + isComboIndexable), so links, robots tags and
 * sitemaps always agree. Server-side only: it reads the full property list.
 */

import { STATIC_PROPERTIES } from "@/lib/data/properties";
import { parseComboSegments } from "@/lib/data/seo-dimensions";
import {
  isComboIndexable,
  isStrictComboMatching,
  matchComboProperties,
} from "@/lib/data/combo-matching";
import type { RelatedLinksCluster } from "@/lib/data/combo-linker";
import { mergedHref } from "@/lib/data/page-merges";
import { getRenderablePublicPaths } from "@/lib/data/public-routes";

const cache = new Map<string, boolean>();

/** True when `href` is a /p/ combo URL whose page is indexable. */
export function isIndexableComboHref(href: string): boolean {
  const path = href.split(/[?#]/)[0].replace(/\/+$/, "");
  if (!path.startsWith("/p/")) return false;
  const key = `${isStrictComboMatching() ? "strict" : "legacy"}:${path}`;
  const known = cache.get(key);
  if (known !== undefined) return known;

  const parsed = parseComboSegments(path.slice(3).split("/").filter(Boolean));
  const indexable = Boolean(
    parsed?.location && isComboIndexable(parsed, matchComboProperties(parsed, STATIC_PROPERTIES))
  );
  cache.set(key, indexable);
  return indexable;
}

let renderablePaths: Set<string> | null = null;

/**
 * Keeps every non-/p/ link; keeps a /p/ link only if its page is indexable.
 * /ahmedabad/... links must be pages that render (the combo linker builds
 * "/ahmedabad/<type>" for every type, and several of those 404).
 */
export function isLinkableHref(href: string): boolean {
  if (href.startsWith("/p/")) return isIndexableComboHref(href);
  if (href.startsWith("/ahmedabad/")) {
    renderablePaths ??= getRenderablePublicPaths();
    return renderablePaths.has(href);
  }
  return true;
}

/** A hand-written list of links: merged pages point at their winner; dead and noindex links are dropped. */
export function linkableHrefs(hrefs: string[]): string[] {
  return Array.from(new Set(hrefs.map(mergedHref))).filter(isLinkableHref);
}

/** Related-link grid on combo pages, without links to noindex, merged or missing pages. */
export function filterLinkableClusters(clusters: RelatedLinksCluster[]): RelatedLinksCluster[] {
  return clusters
    .map((cluster) => {
      const seen = new Set<string>();
      const links = cluster.links
        .map((link) => ({ ...link, href: mergedHref(link.href) }))
        .filter((link) => !seen.has(link.href) && seen.add(link.href) && isLinkableHref(link.href));
      return { ...cluster, links };
    })
    .filter((cluster) => cluster.links.length > 0);
}

/**
 * The parent combo URLs a combo page shows in its breadcrumbs and filter
 * chips (every prefix of its canonical href) that are indexable.
 */
export function indexableParentComboHrefs(href: string): string[] {
  const segments = href.replace(/^\/p\/?/, "").split("/").filter(Boolean);
  const parents: string[] = [];
  for (let i = 1; i < segments.length; i++) {
    const parent = `/p/${segments.slice(0, i).join("/")}`;
    if (isIndexableComboHref(parent)) parents.push(parent);
  }
  return parents;
}
