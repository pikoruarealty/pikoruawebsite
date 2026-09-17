import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LandingPageTemplate } from "@/components/seo/LandingPageTemplate";
import { STATIC_PROPERTIES } from "@/lib/data/properties";
import {
  getNriGeoPage,
  getLandingProperties,
  NRI_GEO_PAGES,
} from "@/lib/data/geo";
import { getKeywordClusterTermsForSlug } from "@/lib/data/keyword-clusters";
import {
  ENTITY_IDS,
  getNriAdvisoryServiceSchema,
} from "@/lib/entity-profile";
import { absoluteUrl, createMetadata, serializeJsonLd, SITE_URL } from "@/lib/seo";
import { getExchangeRates } from "@/lib/exchange-rates";
import { getPriorityKeywordsForPath } from "@/lib/data/six-month-priority-keywords";

interface NriGeoPageProps {
  params: Promise<{ slug: string; detail: string }>;
}

export const dynamicParams = false;

/**
 * Generates static params for all /nri/[slug]/[detail] pages.
 *
 * The first segment shares the `slug` name used by /nri/[slug]. On these
 * two-segment routes it represents the country, while `detail` represents the
 * country-specific landing-page slug.
 */
export function generateStaticParams() {
  return NRI_GEO_PAGES.map((page) => {
    const withoutPrefix = page.href.replace(/^\/nri\//, "");
    const slashIndex = withoutPrefix.indexOf("/");
    const slug = withoutPrefix.slice(0, slashIndex);
    const detail = withoutPrefix.slice(slashIndex + 1);
    return { slug, detail };
  });
}

export async function generateMetadata({ params }: NriGeoPageProps): Promise<Metadata> {
  const { slug: country, detail } = await params;
  const pageSlug = pageSlugFromSegments(country, detail);
  const page = getNriGeoPage(pageSlug);
  if (!page) return {};

  return createMetadata({
    title: page.title,
    description: page.description,
    path: page.href,
    image: page.heroImage,
    keywords: [
      page.label,
      page.title,
      ...(page.matchKeywords ?? []),
      ...(page.seoKeywords ?? []),
      ...getKeywordClusterTermsForSlug(page.slug, { limit: 80 }),
      ...getPriorityKeywordsForPath(page.href),
    ],
  });
}

function pageSlugFromSegments(country: string, detail: string): string {
  return `${country}-${detail}`;
}

function getCountryLabel(country: string): string {
  const labels: Record<string, string> = {
    usa: "USA",
    uk: "UK",
    dubai: "Dubai / UAE",
    canada: "Canada",
    australia: "Australia",
    singapore: "Singapore",
    global: "Global",
  };
  return labels[country] ?? country.charAt(0).toUpperCase() + country.slice(1);
}

export default async function NriGeoLandingPage({ params }: NriGeoPageProps) {
  const { slug: country, detail } = await params;
  const pageSlug = pageSlugFromSegments(country, detail);
  const page = getNriGeoPage(pageSlug);
  const { rates, isLive } = await getExchangeRates();

  if (!page) notFound();

  const properties = getLandingProperties(page, STATIC_PROPERTIES);
  const pageUrl = absoluteUrl(page.href);
  const countryLabel = getCountryLabel(country);

  const serviceSchema = getNriAdvisoryServiceSchema({
    pageUrl,
    name: page.title,
    description: page.description,
    serviceType: page.label,
  });

  const collectionPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: page.title,
    description: page.description,
    about: [
      { "@id": ENTITY_IDS.realEstateAgent },
      { "@id": `${pageUrl}#service` },
    ],
    mainEntity: {
      "@type": "ItemList",
      itemListElement: properties.slice(0, 12).map((property, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(`/properties/${property.slug}`),
        name: `${property.configuration} in ${property.locationLabel}`,
      })),
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "NRI Advisory",
        item: absoluteUrl("/nri"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `NRI ${countryLabel}`,
        item: absoluteUrl(`/nri/${country}`),
      },
      { "@type": "ListItem", position: 4, name: page.label, item: pageUrl },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(collectionPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqSchema) }}
      />
      <LandingPageTemplate
        page={page}
        properties={properties}
        initialRates={rates}
        initialIsLive={isLive}
      />
    </>
  );
}
