export const revalidate = 86400;

import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

/**
 * Core-page sitemap (/sitemap.xml) — hand-built hub pages only.
 *
 * Generated pages live in the sub-sitemaps listed by /sitemap/index.xml
 * (content, blog, geo, properties, p-N), served by
 * src/app/xml-sitemap/[id]/route.ts. Both sitemaps are declared in
 * robots.txt. Sub-sitemap files are not listed here: a <urlset> may only
 * contain page URLs.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date("2026-07-21T12:00:00Z");

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
    // /nri-property-investment-ahmedabad and /nri-property-consultant-ahmedabad
    // are geo landing pages, listed in /sitemap/geo.xml — not repeated here.
    { url: absoluteUrl("/compare"), lastModified, changeFrequency: "monthly", priority: 0.72 },
    { url: absoluteUrl("/invest"), lastModified, changeFrequency: "monthly", priority: 0.75 },
    { url: absoluteUrl("/invest/rental-yield-calculator-ahmedabad"), lastModified: new Date("2026-10-30T12:00:00Z"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/nri/property-budget-currency-converter"), lastModified: new Date("2026-10-30T12:00:00Z"), changeFrequency: "daily", priority: 0.75 },
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
  ];

  return sitemapUrls;
}
