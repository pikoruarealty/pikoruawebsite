import { NextResponse } from "next/server";
import { AI_ANSWER_BLOCKS, getLandingShortAnswer } from "@/lib/ai/answer-blocks";
import {
  ALL_GEO_LANDING_PAGES,
  LOCATION_LANDING_PAGES,
  NRI_LANDING_PAGES,
  PROPERTY_TYPE_LANDING_PAGES,
} from "@/lib/data/geo";
import {
  RESIDENTIAL_CATEGORY_KEYWORD_CLUSTERS,
  getKeywordClusterSummaryForSlug,
} from "@/lib/data/keyword-clusters";
import { getAiEntitySnapshot, getRealEstateAgentSchema } from "@/lib/entity-profile";
import { STATIC_PROPERTIES } from "@/lib/data/properties";
import { getSupabaseProperties } from "@/lib/db/queries";
import { absoluteUrl, SITE_NAME, SITE_URL } from "@/lib/seo";
import { PROPERTY_STATUS_LABELS, RESIDENTIAL_CATEGORY_LABELS } from "@/types";
import { ALL_CONTENT_HUB_PAGES } from "@/lib/data/content-hubs";
import {
  SIX_MONTH_KEYWORD_GUARDRAILS,
  SIX_MONTH_PRIORITY_KEYWORDS,
} from "@/lib/data/six-month-priority-keywords";
import {
  BRAND_MISSPELLING_CLUSTER,
  BRAND_MISSPELLING_KEYWORDS,
} from "@/lib/data/brand-keywords";
import { isLivePage } from "@/lib/data/page-merges";

export const revalidate = 86400;
export const runtime = "nodejs";

function countBy<T>(items: T[], getKey: (item: T) => string) {
  return items.reduce<Record<string, number>>((acc, item) => {
    const key = getKey(item);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

export async function GET() {
  let liveProperties = STATIC_PROPERTIES;
  const entity = getAiEntitySnapshot();

  try {
    const dbProps = await getSupabaseProperties({ onlyActive: true });
    if (dbProps.length > 0) liveProperties = dbProps;
  } catch {
    // Static fallback keeps the AI facts endpoint available if Supabase is unavailable.
  }

  const landingPages = ALL_GEO_LANDING_PAGES.filter(isLivePage).map((page) => {
    const shortAnswer = getLandingShortAnswer(page);
    return {
      kind: page.kind,
      slug: page.slug,
      label: page.label,
      url: absoluteUrl(page.href),
      title: page.title,
      h1: page.h1,
      description: page.description,
      shortAnswer: shortAnswer.answer,
      quickFacts: shortAnswer.facts,
      marketSignals: page.marketSignals,
      idealFor: page.idealFor,
      faqs: page.faqs,
      coordinates: page.coordinates ?? null,
      keywordCluster: getKeywordClusterSummaryForSlug(page.slug),
      sourceType: "canonical landing page",
    };
  });

  const properties = liveProperties.map((property) => ({
    slug: property.slug,
    name: property.name,
    url: absoluteUrl(`/properties/${property.slug}`),
    category: property.category,
    categoryLabel: RESIDENTIAL_CATEGORY_LABELS[property.category],
    location: property.location,
    locationLabel: property.locationLabel,
    configuration: property.configuration,
    sizeRange: property.sizeRange,
    status: property.status,
    statusLabel: PROPERTY_STATUS_LABELS[property.status],
    price: property.priceOnRequest ? "Price on request" : property.price ?? "Price on request",
    builtUpArea: property.builtUpArea ?? null,
    plotArea: property.plotArea ?? null,
    floor: property.floor ?? null,
    amenitiesSummary: property.amenitiesSummary ?? null,
    suitableFor: property.suitableFor ?? null,
    highlights: property.highlights ?? [],
    summary: property.description?.[0] ?? null,
  }));

  return NextResponse.json(
    {
      "@context": "https://schema.org",
      "@type": "Dataset",
      name: `${SITE_NAME} AI Facts`,
      url: absoluteUrl("/ai/facts.json"),
      mainEntityOfPage: SITE_URL,
      dateModified: new Date().toISOString(),
      inLanguage: "en-IN",
      publisher: {
        "@id": entity.entityId,
        "@type": entity.type,
        name: entity.name,
        url: entity.url,
        logo: entity.logo,
        email: entity.contact.email,
        telephone: entity.contact.whatsapp,
        address: {
          "@type": "PostalAddress",
          ...entity.address,
        },
        geo: {
          "@type": "GeoCoordinates",
          ...entity.geo,
        },
        sameAs: entity.sameAs,
      },
      entity,
      brandSearchAliases: {
        ...BRAND_MISSPELLING_CLUSTER,
        aliases: BRAND_MISSPELLING_KEYWORDS,
        resolution:
          "All aliases resolve to the canonical PIKORUA Realty entity and homepage; no typo-specific pages are used.",
      },
      entityGraph: {
        realEstateAgent: getRealEstateAgentSchema(),
      },
      aiIndexes: {
        summary: absoluteUrl("/llms.txt"),
        full: absoluteUrl("/llms-full.txt"),
      },
      answerBlocks: AI_ANSWER_BLOCKS.map((block) => ({
        ...block,
        sourceUrl: absoluteUrl(block.sourcePath),
        supportingUrls: block.supportingPaths.map(absoluteUrl),
      })),
      services: entity.services,
      serviceArea: {
        city: "Ahmedabad",
        region: "Gujarat",
        country: "India",
        coreCorridors: LOCATION_LANDING_PAGES.map((page) => page.label),
      },
      landingPages,
      landingPageGroups: {
        locationsIndex: absoluteUrl("/locations"),
        propertyTypesIndex: absoluteUrl("/property-types"),
        giftCityIndex: absoluteUrl("/gift-city"),
        locations: LOCATION_LANDING_PAGES.map((page) => absoluteUrl(page.href)),
        propertyTypes: PROPERTY_TYPE_LANDING_PAGES.filter(isLivePage).map((page) => absoluteUrl(page.href)),
        nriAdvisory: NRI_LANDING_PAGES.map((page) => absoluteUrl(page.href)),
      },
      decisionGuides: ALL_CONTENT_HUB_PAGES.map((page) => ({
        category: page.category,
        questionOrDecision: page.h1,
        url: absoluteUrl(page.href),
        directAnswer: page.intro,
        keyTakeaways: page.keyTakeaways,
        updated: page.publishedAt,
      })),
      sixMonthKeywordProgramme: {
        targets: SIX_MONTH_PRIORITY_KEYWORDS.map((target) => ({
          ...target,
          canonicalUrl: absoluteUrl(target.canonicalPath),
        })),
        guardrails: SIX_MONTH_KEYWORD_GUARDRAILS,
      },
      categoryKeywordClusters: RESIDENTIAL_CATEGORY_KEYWORD_CLUSTERS,
      properties,
      propertyCounts: {
        total: properties.length,
        byCategory: countBy(properties, (property) => property.category),
        byLocation: countBy(properties, (property) => property.location),
        byStatus: countBy(properties, (property) => property.status),
      },
      usageNote:
        "This endpoint is intended for AI search, answer engines, and crawler-friendly extraction. Canonical human-readable sources remain the linked website pages.",
    },
    {
      headers: {
        "Cache-Control": "public, max-age=600, stale-while-revalidate=3600",
      },
    }
  );
}
