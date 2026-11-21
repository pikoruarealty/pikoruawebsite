/**
 * similar-properties.ts
 *
 * Picks the "similar homes" shown at the foot of each listing page. Listing
 * pages used to link only to their area guide, so Google reached most
 * listings through one or two pages. Linking each listing to a few close
 * matches ties all of them together.
 *
 * Order: same corridor first, then the same kind of home (penthouse, duplex,
 * villa, plot, apartment). Ties go to the next listings in collection order
 * (wrapping round), so neighbouring listings link to different homes and
 * every listing gets picked by some other listing.
 */

import type { StaticProperty } from "@/lib/data/properties";

export type HomeKind = "penthouse" | "duplex" | "villa" | "plot" | "apartment";

/** The kind of home, read from category first and configuration text second. */
export function getHomeKind(property: Pick<StaticProperty, "category" | "configuration">): HomeKind {
  const config = property.configuration.toLowerCase();
  if (property.category === "plot" || /\bplots?\b/.test(config)) return "plot";
  if (property.category === "villa" || property.category === "bungalow" || /villa|bungalow/.test(config)) return "villa";
  if (property.category === "penthouse" || config.includes("penthouse")) return "penthouse";
  if (property.category === "duplex" || config.includes("duplex")) return "duplex";
  return "apartment";
}

/** The type landing page for each kind of home (all are indexed, strong pages). */
export const HOME_KIND_PAGES: Record<HomeKind, { href: string; label: string }> = {
  penthouse: { href: "/penthouses-ahmedabad", label: "Penthouses in Ahmedabad" },
  duplex: { href: "/ahmedabad/duplex-flats", label: "Duplex flats in Ahmedabad" },
  villa: { href: "/luxury-villas-ahmedabad", label: "Villas and bungalows in Ahmedabad" },
  plot: { href: "/luxury-plots-ahmedabad", label: "Residential plots in Ahmedabad" },
  apartment: { href: "/luxury-apartments-ahmedabad", label: "Luxury apartments in Ahmedabad" },
};

export function getSimilarProperties(
  current: StaticProperty,
  all: StaticProperty[],
  limit = 4
): StaticProperty[] {
  const pool = all.filter((p) => p.slug !== current.slug);
  if (pool.length === 0) return [];

  const kind = getHomeKind(current);
  const startIndex = Math.max(0, all.findIndex((p) => p.slug === current.slug));
  // Distance after the current listing in collection order, wrapping round.
  const distance = (p: StaticProperty) => {
    const i = all.indexOf(p);
    return (i - startIndex + all.length) % all.length;
  };
  const score = (p: StaticProperty) =>
    (p.location === current.location && current.location !== "other" ? 2 : 0) +
    (getHomeKind(p) === kind ? 1 : 0);

  return [...pool]
    .sort((a, b) => score(b) - score(a) || distance(a) - distance(b))
    .slice(0, limit);
}
