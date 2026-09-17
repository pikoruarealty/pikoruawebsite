export const revalidate = 86400;

import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { getTotalComboBatches } from "@/lib/data/combo-seeder";

/**
 * Sitemap index — lists all sub-sitemaps.
 *
 * Google accepts sitemap index files at /sitemap.xml.
 * Each sub-sitemap contains up to 2,500 URLs (well under the 50,000 limit).
 *
 * Sub-sitemaps:
 *   /sitemap/geo.xml        — 90+ GEO landing pages
 *   /sitemap/properties.xml — property detail pages
 *   /sitemap/p-0.xml        — first 2,500 combo pages (highest priority)
 *   /sitemap/p-1.xml …      — remaining combo batches
 *
 * The actual URL lists are generated in /sitemap/[id]/route.ts.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date("2026-07-21T12:00:00Z");
  const totalBatches = getTotalComboBatches(2500);

  const sitemapUrls: MetadataRoute.Sitemap = [
    // Core pages
    { url: absoluteUrl(""), lastModified, changeFrequency: "weekly", priority: 1.0 },
    { url: absoluteUrl("/properties"), lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/about"), lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/testimonials"), lastModified, changeFrequency: "monthly", priority: 0.75 },
    { url: absoluteUrl("/contact"), lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/blog"), lastModified, changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/locations"), lastModified, changeFrequency: "weekly", priority: 0.88 },
    { url: absoluteUrl("/property-types"), lastModified, changeFrequency: "weekly", priority: 0.88 },
    { url: absoluteUrl("/gift-city"), lastModified, changeFrequency: "weekly", priority: 0.88 },
    { url: absoluteUrl("/nri"), lastModified, changeFrequency: "weekly", priority: 0.95 },
    { url: absoluteUrl("/nri-property-investment-ahmedabad"), lastModified, changeFrequency: "weekly", priority: 0.90 },
    { url: absoluteUrl("/nri-property-consultant-ahmedabad"), lastModified, changeFrequency: "weekly", priority: 0.90 },
    { url: absoluteUrl("/compare"), lastModified, changeFrequency: "monthly", priority: 0.72 },
    { url: absoluteUrl("/invest"), lastModified, changeFrequency: "monthly", priority: 0.75 },
    { url: absoluteUrl("/learn"), lastModified, changeFrequency: "monthly", priority: 0.72 },
    {
      url: absoluteUrl("/private-client-advisory"),
      lastModified: new Date("2026-07-23T12:00:00Z"),
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: absoluteUrl("/private-property-advisory-public-figures"),
      lastModified: new Date("2026-07-23T12:00:00Z"),
      changeFrequency: "monthly",
      priority: 0.78,
    },
    {
      url: absoluteUrl("/ahmedabad-luxury-property-market-report"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    { url: absoluteUrl("/press"), lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/privacy"), lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/terms"), lastModified, changeFrequency: "yearly", priority: 0.3 },
    // Sub-sitemap references (helps some crawlers discover split sitemaps)
    {
      url: absoluteUrl("/sitemap/index.xml"),
      lastModified,
      changeFrequency: "daily",
      priority: 0.5,
    },
    {
      url: absoluteUrl("/sitemap/geo.xml"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: absoluteUrl("/sitemap/properties.xml"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    ...Array.from({ length: totalBatches }, (_, i) => ({
      url: absoluteUrl(`/sitemap/p-${i}.xml`),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];

  return sitemapUrls;
}
