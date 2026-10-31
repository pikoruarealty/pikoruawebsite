/**
 * /llms.txt — Dynamic GEO/AEO index for AI search engines
 *
 * This Route Handler replaces the static public/llms.txt file.
 * It generates a live, machine-readable site overview in plain-text Markdown
 * that AI crawlers (GPTBot, PerplexityBot, Google-Extended, ClaudeBot, etc.)
 * can ingest to understand PIKORUA Realty's site structure and key pages.
 *
 * Re-generated on every request (force-dynamic) so it reflects the latest
 * Supabase property and blog data without a deploy.
 */

import { NextResponse } from "next/server";
import { AI_ANSWER_BLOCKS } from "@/lib/ai/answer-blocks";
import { STATIC_PROPERTIES } from "@/lib/data/properties";
import { getPublishedBlogPosts } from "@/lib/data/blog";
import { PARTNER_DEVELOPER_NAMES, PORTFOLIO_PROJECT_NAMES } from "@/lib/data/developer-partners";
import { LOCATION_LANDING_PAGES, NRI_LANDING_PAGES, PROPERTY_TYPE_LANDING_PAGES } from "@/lib/data/geo";
import {
  AHMEDABAD_LUXURY_MARKET_REPORT,
  MARKET_REPORT_PATH,
  PRESS_ROOM_PATH,
} from "@/lib/data/market-report";
import { getKeywordClusterSummaryForSlug } from "@/lib/data/keyword-clusters";
import { getAiEntitySnapshot } from "@/lib/entity-profile";
import { getSupabaseBlogs, getSupabaseProperties } from "@/lib/db/queries";
import { SITE_URL } from "@/lib/seo";
import { ALL_CONTENT_HUB_PAGES } from "@/lib/data/content-hubs";
import { SIX_MONTH_PRIORITY_KEYWORDS } from "@/lib/data/six-month-priority-keywords";
import { BRAND_MISSPELLING_KEYWORDS } from "@/lib/data/brand-keywords";
import { isLivePage } from "@/lib/data/page-merges";

export const revalidate = 86400; // Cache on CDN/edge for 24 hours (ISR) to protect database
export const runtime = "nodejs";

export async function GET() {
  const entity = getAiEntitySnapshot();

  // Fetch live properties from Supabase; fall back to static list
  let liveProperties = STATIC_PROPERTIES;
  try {
    const dbProps = await getSupabaseProperties({ onlyActive: true });
    if (dbProps.length > 0) liveProperties = dbProps;
  } catch {
    // Supabase unavailable — use static fallback
  }

  // Same publication rule as the post pages and /sitemap/blog.xml.
  const liveBlogPosts = getPublishedBlogPosts(await getSupabaseBlogs(false));

  const propertyLines = liveProperties.map((p) => {
    const priceInfo = p.price && !p.priceOnRequest ? ` (Price: ${p.price})` : " (Price on Request)";
    const sizeInfo = p.sizeRange ? `, Size: ${p.sizeRange}` : "";
    const locInfo = p.locationLabel ? ` in ${p.locationLabel}` : "";
    const desc = p.description?.[0] ? ` - ${p.description[0].substring(0, 160).trim()}...` : "";
    return `- [${p.name || p.configuration}](${SITE_URL}/properties/${p.slug}): ${p.configuration}${sizeInfo}${locInfo}${priceInfo}${desc}`;
  });

  const blogLines = liveBlogPosts.map((post) => {
    const category = post.categoryLabel ? ` [Category: ${post.categoryLabel}]` : "";
    return `- [${post.title}](${SITE_URL}/blog/${post.slug}): ${post.excerpt}${category}`;
  });

  const lines: string[] = [
    `# PIKORUA Realty`,
    ``,
    `> PIKORUA Realty is Ahmedabad's private luxury residential real estate advisory. We curate exclusive apartments, penthouses, duplexes, villas, bungalows, and residential plots for HNI and NRI buyers across Ahmedabad's premier western corridors.`,
    ``,
    `## Site Overview`,
    ``,
    `- [Full content index](${SITE_URL}/llms-full.txt)`,
    `- [Structured AI facts](${SITE_URL}/ai/facts.json)`,
    `- [${AHMEDABAD_LUXURY_MARKET_REPORT.title}](${SITE_URL}${MARKET_REPORT_PATH})`,
    `- [Media room](${SITE_URL}${PRESS_ROOM_PATH})`,
    ``,
    `## Entity Identity`,
    ``,
    `- **Canonical Entity:** ${entity.name}`,
    `- **Brand Search Aliases:** ${BRAND_MISSPELLING_KEYWORDS.join(" | ")}`,
    `- **Entity ID:** ${entity.entityId}`,
    `- **Type:** ${entity.type.join(", ")}`,
    `- **Founder:** ${entity.founder.name} (${entity.founder.url})`,
    `- **Address:** ${entity.address.streetAddress}, ${entity.address.addressLocality}, ${entity.address.addressRegion} ${entity.address.postalCode}, India`,
    `- **Contact:** ${entity.contact.email}; ${entity.contact.telephone}`,
    `- **RERA disclosure:** ${entity.reraRegistration.disclosure}`,
    `- **Languages:** ${entity.contact.languages.join(", ")}`,
    `- **SameAs:** ${entity.sameAs.join(" | ")}`,
    `- **Core Services:** ${entity.services.map((service) => service.name).join(" | ")}`,
    ``,
    `## Developer And Project Entity Coverage`,
    ``,
    `- **Developer Alliances:** ${PARTNER_DEVELOPER_NAMES.join(" | ")}`,
    `- **Project Entities:** ${PORTFOLIO_PROJECT_NAMES.join(" | ")}`,
    `- **Relevant Query Classes:** Ahmedabad developer projects | luxury residential projects Ahmedabad | trusted builder projects Ahmedabad | NRI investment in developer-led Ahmedabad projects`,
    ``,
    `## Direct Answer Topics`,
    ``,
    ...AI_ANSWER_BLOCKS.map(
      (block) => `- ${block.question} Key fact: ${block.citationFacts[0]} Source: ${SITE_URL}${block.sourcePath}`
    ),
    ``,
    `## Decision Guides`,
    ``,
    ...ALL_CONTENT_HUB_PAGES.map(
      (page) => `- [${page.h1}](${SITE_URL}${page.href}): ${page.intro}`
    ),
    ``,
    `## Six-Month Priority Query Map`,
    ``,
    ...SIX_MONTH_PRIORITY_KEYWORDS.map(
      (target) => `- ${target.keyword} -> ${SITE_URL}${target.canonicalPath} (${target.window})`
    ),
    ``,
    `## Key Pages`,
    ``,
    `- [Properties](${SITE_URL}/properties): Curated luxury property listings — 4 BHK & 5 BHK apartments, penthouses, villas, duplexes, and residential plots`,
    `- [Locations Network](${SITE_URL}/locations): Comprehensive directory and market breakdown of 23 Ahmedabad luxury corridors`,
    `- [Property Types Hub](${SITE_URL}/property-types): Authority index for residential and commercial real estate categories in Ahmedabad`,
    `- [GIFT City Hub](${SITE_URL}/gift-city): GIFT City commercial office, residential options, and NRI investment guides`,
    `- [Insights](${SITE_URL}/blog): Market reports, NRI advisory guides, and corridor analysis`,
    `- [${AHMEDABAD_LUXURY_MARKET_REPORT.title}](${SITE_URL}${MARKET_REPORT_PATH}): ${AHMEDABAD_LUXURY_MARKET_REPORT.description}`,
    `- [Media Room](${SITE_URL}${PRESS_ROOM_PATH}): Press resources, expert commentary topics, quote bank, and citation guidance`,
    `- [About](${SITE_URL}/about): About PIKORUA Realty and founder Jitendra`,
    `- [Testimonials](${SITE_URL}/testimonials): Client reviews from HNI buyers, NRI investors, and sellers`,
    `- [Contact](${SITE_URL}/contact): Private enquiry and advisory request`,
    ``,
    `## NRI Advisory Pages`,
    ``,
    ...NRI_LANDING_PAGES.map((p) => `- [${p.label}](${SITE_URL}${p.href}): ${p.description}`),
    ``,
    `## Location Corridors`,
    ``,
    ...LOCATION_LANDING_PAGES.map((p) => `- [${p.label}](${SITE_URL}${p.href}): ${p.description}`),
    ``,
    `## Property Types`,
    ``,
    ...PROPERTY_TYPE_LANDING_PAGES.filter(isLivePage).map((p) => {
      const cluster = getKeywordClusterSummaryForSlug(p.slug);
      const primaryTerms = cluster ? ` Target keywords: ${cluster.primary.slice(0, 4).join(" | ")}` : "";
      return `- [${p.label}](${SITE_URL}${p.href}): ${p.description}${primaryTerms}`;
    }),
    ``,
    `## Properties (${liveProperties.length} listings)`,
    ``,
    ...propertyLines,
    ``,
    `## Insights (${liveBlogPosts.length} articles)`,
    ``,
    ...blogLines,
    ``,
    `## Do Not Index`,
    ``,
    `- /studio/`,
    `- /api/`,
    `- /admin/`,
    `- /demo/`,
    ``,
  ];

  return new NextResponse(lines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      // Allow AI crawlers to cache for 10 minutes
      "Cache-Control": "public, max-age=600, stale-while-revalidate=3600",
    },
  });
}
