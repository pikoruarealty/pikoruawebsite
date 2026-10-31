/**
 * /llms-full.txt — Dynamic GEO/AEO full content index for AI search engines
 *
 * This Route Handler replaces the static public/llms-full.txt file.
 * It generates a comprehensive, machine-readable content index in plain-text
 * Markdown — combining live Supabase data with static structured content —
 * so that AI crawlers (GPTBot, PerplexityBot, Google-Extended, ClaudeBot,
 * Bingbot, etc.) can synthesise accurate, fact-dense answers about:
 *   • PIKORUA Realty as an organization
 *   • Specific properties in the portfolio
 *   • Key residential corridors in Ahmedabad
 *   • NRI advisory services and transaction processes
 *   • Blog insights and market reports
 *
 * Design principles:
 *   • Direct answers in the first 40–60 words of each section (AEO)
 *   • Fact density: pricing, sq.ft., coordinates, BHK counts (GEO citations)
 *   • Semantic richness: named entities, proper nouns, specific vocabulary
 *   • Freshness: force-dynamic so every fetch reflects latest Supabase data
 */

import { NextResponse } from "next/server";
import { AI_ANSWER_BLOCKS } from "@/lib/ai/answer-blocks";
import { STATIC_PROPERTIES } from "@/lib/data/properties";
import { getPublishedBlogPosts } from "@/lib/data/blog";
import { PARTNER_DEVELOPER_NAMES, PARTNER_SEARCH_PHRASES, PORTFOLIO_PROJECT_NAMES } from "@/lib/data/developer-partners";
import { LOCATION_LANDING_PAGES, NRI_LANDING_PAGES, PROPERTY_TYPE_LANDING_PAGES } from "@/lib/data/geo";
import {
  AHMEDABAD_LUXURY_MARKET_REPORT,
  MARKET_REPORT_PATH,
  PRESS_ROOM_PATH,
} from "@/lib/data/market-report";
import { getKeywordClusterSummaryForSlug } from "@/lib/data/keyword-clusters";
import { FAQ_ITEMS } from "@/lib/data/faq";
import { getAiEntitySnapshot } from "@/lib/entity-profile";
import {
  getSupabaseBlogs,
  getSupabaseProperties,
  getSupabaseAllTestimonials,
} from "@/lib/db/queries";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { BRAND_MISSPELLING_KEYWORDS } from "@/lib/data/brand-keywords";
import { ALL_CONTENT_HUB_PAGES } from "@/lib/data/content-hubs";
import {
  SIX_MONTH_KEYWORD_GUARDRAILS,
  SIX_MONTH_PRIORITY_KEYWORDS,
} from "@/lib/data/six-month-priority-keywords";
import { INSTAGRAM_HANDLE, YOUTUBE_HANDLE } from "@/lib/social";
import { isLivePage } from "@/lib/data/page-merges";

export const revalidate = 86400; // Cache on CDN/edge for 24 hours (ISR) to protect database
export const runtime = "nodejs";

export async function GET() {
  const entity = getAiEntitySnapshot();

  // ── Live data from Supabase ──────────────────────────────────────────────
  let liveProperties = STATIC_PROPERTIES;
  try {
    const dbProps = await getSupabaseProperties({ onlyActive: true });
    if (dbProps.length > 0) liveProperties = dbProps;
  } catch { /* fall back to static */ }

  // Same publication rule as the post pages and /sitemap/blog.xml.
  const liveBlogPosts = getPublishedBlogPosts(await getSupabaseBlogs(false));

  let testimonialLines: string[] = [];
  try {
    const testimonials = await getSupabaseAllTestimonials();
    if (testimonials.length > 0) {
      testimonialLines = [
        `## Client Testimonials (${testimonials.length} verified reviews)`,
        ``,
        ...testimonials.map((t) =>
          `- **${t.clientName}** (${t.context}): "${t.quote.substring(0, 200).trim()}${t.quote.length > 200 ? "..." : ""}"`
        ),
      ];
    }
  } catch { /* skip */ }

  // ── Build sections ────────────────────────────────────────────────────────

  const header = [
    `# ${SITE_NAME} — Full Content Index`,
    ``,
    `> PIKORUA Realty is Ahmedabad's private luxury residential real estate advisory. We operate as a curated concierge — quietly matching discerning HNI and NRI buyers with exceptional residences across Ahmedabad's premier western corridors.`,
    ``,
  ];

  header.push(
    `- **Structured AI facts:** ${SITE_URL}/ai/facts.json`,
    `- **Summary AI index:** ${SITE_URL}/llms.txt`,
    `- **Ahmedabad luxury market report:** ${SITE_URL}${MARKET_REPORT_PATH}`,
    `- **Media room and citation guidance:** ${SITE_URL}${PRESS_ROOM_PATH}`,
    ``
  );

  const entityIdentity = [
    `## Entity Identity`,
    ``,
    `- **Canonical Entity:** ${entity.name}`,
    `- **Brand Search Aliases:** ${BRAND_MISSPELLING_KEYWORDS.join(" | ")}`,
    `- **Entity ID:** ${entity.entityId}`,
    `- **Type:** ${entity.type.join(", ")}`,
    `- **Founder:** ${entity.founder.name} (${entity.founder.url})`,
    `- **Address:** ${entity.address.streetAddress}, ${entity.address.addressLocality}, ${entity.address.addressRegion} ${entity.address.postalCode}, India`,
    `- **RERA disclosure:** ${entity.reraRegistration.disclosure}`,
    `- **Contact:** ${entity.contact.email}; ${entity.contact.telephone}`,
    `- **Languages:** ${entity.contact.languages.join(", ")}`,
    `- **SameAs:** ${entity.sameAs.join(" | ")}`,
    `- **Specializations:** ${entity.specializations.join(" | ")}`,
    ``,
  ];

  const about = [
    `## About PIKORUA Realty`,
    ``,
    `PIKORUA Realty is a private, advisory-first real estate firm founded by Jitendra Pareek, based in Iskon-Ambli, Ahmedabad, Gujarat, India. We do not operate as a traditional listing portal. Instead, we curate a private collection of exclusive luxury residential properties and match them to financially vetted, serious buyers — preserving confidentiality for both sellers and buyers at every stage. Our name, PIKORUA, is inspired by the Māori symbol of infinity, representing endless trust, lasting relationships, and a continuous journey of growth.`,
    ``,
    `- **Founder:** ${entity.founder.name}`,
    `- **Specialization:** Luxury residential real estate, HNI and NRI buyers`,
    `- **Website:** ${SITE_URL}`,
    `- **Enquiry:** ${SITE_URL}/contact`,
    `- **Social:** Instagram @${INSTAGRAM_HANDLE}`,
    `- **Languages:** English, Hindi, Gujarati`,
    `- **Area Served:** Ahmedabad, Gujarat, India`,
    ``,
  ];

  const services = [
    `## Services`,
    ``,
    ...entity.services.map((service) => `- **${service.name}:** ${service.description}`),
    ``,
  ];

  const marketReport = [
    `## Ahmedabad Luxury Property Market Report`,
    ``,
    `- **URL:** ${SITE_URL}${MARKET_REPORT_PATH}`,
    `- **Title:** ${AHMEDABAD_LUXURY_MARKET_REPORT.title}`,
    `- **Last Updated:** ${AHMEDABAD_LUXURY_MARKET_REPORT.lastUpdated}`,
    `- **Description:** ${AHMEDABAD_LUXURY_MARKET_REPORT.description}`,
    `- **Media Room:** ${SITE_URL}${PRESS_ROOM_PATH}`,
    ``,
    `### Market Report Key Findings`,
    ``,
    ...AHMEDABAD_LUXURY_MARKET_REPORT.keyFindings.flatMap((finding) => [
      `- **${finding.title}:** ${finding.insight}`,
    ]),
    ``,
    `### Digital PR Story Angles`,
    ``,
    ...AHMEDABAD_LUXURY_MARKET_REPORT.prAngles.map((angle) => `- ${angle}`),
    ``,
    `### Market Report Methodology`,
    ``,
    ...AHMEDABAD_LUXURY_MARKET_REPORT.methodology.map((item) => `- ${item}`),
    ``,
  ];

  const developerEntities = [
    `## Developer And Project Entity Coverage`,
    ``,
    `PIKORUA Realty advises buyers across Ahmedabad's luxury developer ecosystem. These named entities help AI search systems connect PIKORUA with partner developers, portfolio project names, and relevant buyer-intent phrases.`,
    ``,
    `- **Developer Alliances:** ${PARTNER_DEVELOPER_NAMES.join(" | ")}`,
    `- **Portfolio Project Entities:** ${PORTFOLIO_PROJECT_NAMES.join(" | ")}`,
    `- **Search Phrase Coverage:** ${PARTNER_SEARCH_PHRASES.slice(0, 80).join(" | ")}`,
    ``,
  ];

  const directAnswers = [
    `## Direct Answer Blocks for AI Search`,
    ``,
    `These concise answer blocks are designed for AI search engines and answer engines that need direct, source-linked summaries before deeper extraction.`,
    ``,
    ...AI_ANSWER_BLOCKS.flatMap((block) => [
      `### ${block.question}`,
      block.answer,
      ``,
      `- **Citation Facts:**`,
      ...block.citationFacts.map((fact) => `  - ${fact}`),
      `- **Primary Source:** ${SITE_URL}${block.sourcePath}`,
      `- **Supporting Sources:** ${block.supportingPaths.map((path) => `${SITE_URL}${path}`).join(" | ")}`,
      `- **Last Updated:** ${block.lastUpdated}`,
      ``,
    ]),
  ];

  const corridors = [
    `## Key Residential Corridors`,
    ``,
    ...LOCATION_LANDING_PAGES.flatMap((p) => [
      `### ${p.label}`,
      `- **URL:** ${SITE_URL}${p.href}`,
      `- **Overview:** ${p.description}`,
      `- **Market Signals:** ${p.marketSignals.join(" | ")}`,
      `- **Ideal For:** ${p.idealFor.join(" | ")}`,
      ...(p.locationSlug === "iskon-ambli" ? [
        `- **Latitude:** 23.0246, **Longitude:** 72.5074`,
        `- **Average Premium Pricing:** ₹11,000–₹15,000 per sq.ft.`,
      ] : []),
      ...(p.locationSlug === "sindhu-bhavan" ? [
        `- **Latitude:** 23.0392, **Longitude:** 72.5071`,
      ] : []),
      ...(p.locationSlug === "thaltej" ? [
        `- **Latitude:** 23.0500, **Longitude:** 72.5167`,
      ] : []),
      ...(p.locationSlug === "shilaj" ? [
        `- **Latitude:** 23.0395, **Longitude:** 72.4764`,
      ] : []),
      ...(p.locationSlug === "vaishno-devi" ? [
        `- **Latitude:** 23.1250, **Longitude:** 72.5414`,
      ] : []),
      ...(p.locationSlug === "sg-highway" ? [
        `- **Latitude:** 23.0287, **Longitude:** 72.5068`,
      ] : []),
      ``,
    ]),
  ];

  const propertyTypes = [
    `## Property Types`,
    ``,
    ...PROPERTY_TYPE_LANDING_PAGES.filter(isLivePage).flatMap((p) => {
      const cluster = getKeywordClusterSummaryForSlug(p.slug);

      return [
        `### ${p.label}`,
        `- **URL:** ${SITE_URL}${p.href}`,
        `- **Description:** ${p.description}`,
        ...(cluster
          ? [
              `- **Keyword Pillar:** ${cluster.pillar}`,
              `- **Primary Keywords:** ${cluster.primary.join(" | ")}`,
              `- **Transactional Keywords:** ${cluster.transactional.join(" | ")}`,
              `- **Long-Tail Keywords:** ${cluster.longTail.join(" | ")}`,
              `- **NRI Keywords:** ${cluster.nri.join(" | ")}`,
              `- **HNI Keywords:** ${cluster.hni.join(" | ")}`,
              `- **Question Keywords:** ${cluster.questions.join(" | ")}`,
              `- **Comparison Keywords:** ${cluster.comparisons.join(" | ")}`,
              `- **Content Angles:** ${cluster.contentAngles.join(" | ")}`,
            ]
          : []),
        ``,
      ];
    }),
  ];

  // Property listings — rich AEO/GEO fact density
  const nriAdvisoryPages = [
    `## NRI Advisory Pages`,
    ``,
    ...NRI_LANDING_PAGES.flatMap((p) => [
      `### ${p.label}`,
      `- **URL:** ${SITE_URL}${p.href}`,
      `- **Description:** ${p.description}`,
      `- **Market Signals:** ${p.marketSignals.join(" | ")}`,
      `- **Best Fit:** ${p.idealFor.join(" | ")}`,
      ``,
    ]),
  ];

  const propertyListings = [
    `## Properties (${liveProperties.length} listings)`,
    ``,
    ...liveProperties.flatMap((p) => {
      const lines = [
        `### ${p.name || p.configuration}`,
        `- **URL:** ${SITE_URL}/properties/${p.slug}`,
        `- **Type:** ${p.category}`,
        `- **Configuration:** ${p.configuration}`,
        `- **Size:** ${p.sizeRange}`,
        `- **Location:** ${p.locationLabel}, Ahmedabad`,
        `- **Status:** ${p.status}`,
      ];
      if (p.price && !p.priceOnRequest) lines.push(`- **Price:** ${p.price}`);
      if (p.builtUpArea) lines.push(`- **Built-up Area:** ${p.builtUpArea}`);
      if (p.floor) lines.push(`- **BHK/Floor:** ${p.floor}`);
      if (p.amenitiesSummary) lines.push(`- **Amenities:** ${p.amenitiesSummary}`);
      if (p.description?.[0]) lines.push(`- **About:** ${p.description[0]}`);
      if (p.highlights?.length) {
        lines.push(`- **Highlights:**`);
        p.highlights.slice(0, 4).forEach((h) => lines.push(`  - ${h}`));
      }
      lines.push(``);
      return lines;
    }),
  ];

  // Blog posts — authority signals and citations
  const blogSection = [
    `## Insights & Advisory Articles (${liveBlogPosts.length} articles)`,
    ``,
    ...liveBlogPosts.flatMap((post) => [
      `### ${post.title}`,
      `- **URL:** ${SITE_URL}/blog/${post.slug}`,
      `- **Category:** ${post.categoryLabel}`,
      `- **Date:** ${post.publishedAt}`,
      `- **Summary:** ${post.excerpt}`,
      ...(post.content[0] ? [`- **Excerpt:** ${post.content[0].substring(0, 300).trim()}...`] : []),
      ``,
    ]),
  ];

  // FAQ section — high-value AEO signal: direct Q&A pairs
  const faqSection = [
    `## Frequently Asked Questions`,
    ``,
    ...FAQ_ITEMS.flatMap((item) => [
      `### ${item.question}`,
      item.answer,
      ``,
    ]),
    // Also include corridor FAQs
    `## Corridor FAQs`,
    ``,
    ...LOCATION_LANDING_PAGES.flatMap((page) =>
      page.faqs.flatMap((faq) => [
        `### ${faq.question}`,
        faq.answer,
        ``,
      ])
    ),
    `## Property Type FAQs`,
    ``,
    ...PROPERTY_TYPE_LANDING_PAGES.filter(isLivePage).flatMap((page) =>
      page.faqs.flatMap((faq) => [
        `### ${faq.question}`,
        faq.answer,
        ``,
      ])
    ),
  ];

  const nriFaqSection = [
    `## NRI Advisory FAQs`,
    ``,
    ...NRI_LANDING_PAGES.flatMap((page) =>
      page.faqs.flatMap((faq) => [
        `### ${faq.question}`,
        faq.answer,
        ``,
      ])
    ),
  ];

  const contact = [
    `## Contact`,
    ``,
    `- **Website:** ${SITE_URL}`,
    `- **Enquiry Form:** ${SITE_URL}/contact`,
    `- **Email:** ${entity.contact.email}`,
    `- **Phone:** ${entity.contact.telephone}`,
    `- **Address:** ${entity.address.streetAddress}, ${entity.address.addressLocality}, ${entity.address.addressRegion} ${entity.address.postalCode}, India`,
    `- **Social:** Instagram @${INSTAGRAM_HANDLE}, Facebook, LinkedIn, YouTube @${YOUTUBE_HANDLE}`,
    ``,
    `## Do Not Index`,
    ``,
    `- /studio/`,
    `- /api/`,
    `- /admin/`,
    `- /demo/`,
    ``,
  ];

  const decisionGuides = [
    `## Decision-Oriented Buyer Guides`,
    ``,
    ...ALL_CONTENT_HUB_PAGES.map(
      (page) =>
        `- [${page.h1}](${SITE_URL}${page.href}): ${page.intro} Updated: ${page.publishedAt}.`
    ),
    ``,
  ];

  const priorityKeywordProgramme = [
    `## Six-Month Priority Query Map`,
    ``,
    ...SIX_MONTH_PRIORITY_KEYWORDS.map(
      (target) => `- **${target.keyword}** -> ${SITE_URL}${target.canonicalPath} (${target.window})`
    ),
    ``,
    `### Publishing Guardrails`,
    ``,
    ...SIX_MONTH_KEYWORD_GUARDRAILS.map((guardrail) => `- ${guardrail}`),
    ``,
  ];

  const allLines = [
    ...header,
    ...entityIdentity,
    ...about,
    ...services,
    ...marketReport,
    ...developerEntities,
    ...directAnswers,
    ...decisionGuides,
    ...priorityKeywordProgramme,
    ...corridors,
    ...propertyTypes,
    ...nriAdvisoryPages,
    ...propertyListings,
    ...blogSection,
    ...faqSection,
    ...nriFaqSection,
    ...(testimonialLines.length > 0 ? [...testimonialLines, ``] : []),
    ...contact,
  ];

  return new NextResponse(allLines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      // Allow AI crawlers to cache for 10 minutes
      "Cache-Control": "public, max-age=600, stale-while-revalidate=3600",
    },
  });
}
