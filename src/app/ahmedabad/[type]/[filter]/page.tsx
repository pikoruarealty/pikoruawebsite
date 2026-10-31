import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LandingPageTemplate } from "@/components/seo/LandingPageTemplate";
import { STATIC_PROPERTIES } from "@/lib/data/properties";
import {
  getAhmedabadTypePage,
  getLandingProperties,
  AHMEDABAD_FILTER_PAGES,
  type GeoLandingPage,
} from "@/lib/data/geo";
import { getKeywordClusterTermsForSlug } from "@/lib/data/keyword-clusters";
import {
  ENTITY_IDS,
  getAhmedabadAreaServedSchema,
} from "@/lib/entity-profile";
import { absoluteUrl, createMetadata, serializeJsonLd, SITE_URL } from "@/lib/seo";
import { getExchangeRates } from "@/lib/exchange-rates";
import { mergedHref } from "@/lib/data/page-merges";

interface AhmedabadFilterPageProps {
  params: Promise<{ type: string; filter: string }>;
}

export const dynamicParams = false;

/**
 * Generates static params for /ahmedabad/[type]/[filter] pages.
 *
 * AHMEDABAD_FILTER_PAGES have hrefs of the form:
 *   /ahmedabad/luxury-flats/4-bhk       → type=luxury-flats, filter=4-bhk
 *   /ahmedabad/penthouses/for-investment → type=penthouses, filter=for-investment
 *
 * We split the href after "/ahmedabad/" on "/" to get [type, filter].
 * Pages with only one segment after /ahmedabad/ are excluded (served by [type]/page.tsx).
 */
export function generateStaticParams() {
  return AHMEDABAD_FILTER_PAGES
    .filter((page) => {
      const parts = page.href.replace(/^\/ahmedabad\//, "").split("/");
      return parts.length === 2;
    })
    .map((page) => {
      const [type, filter] = page.href.replace(/^\/ahmedabad\//, "").split("/");
      return { type, filter };
    });
}

export async function generateMetadata({ params }: AhmedabadFilterPageProps): Promise<Metadata> {
  const { type, filter } = await params;
  const slug = slugFromSegments(type, filter);
  const page = getAhmedabadTypePage(slug);
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
    ],
  });
}

/** Build the page slug from two URL segments. */
function slugFromSegments(type: string, filter: string): string {
  return `ahmedabad-${type}-${filter}`;
}

function getServiceSchema(page: GeoLandingPage, pageUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${pageUrl}#service`,
    name: page.title,
    description: page.description,
    url: pageUrl,
    serviceType: page.label,
    provider: { "@id": ENTITY_IDS.realEstateAgent },
    areaServed: getAhmedabadAreaServedSchema(),
    audience: {
      "@type": "Audience",
      audienceType: "Luxury property buyers, NRIs, and real estate investors in Ahmedabad",
    },
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: absoluteUrl("/contact"),
    },
  };
}

export default async function AhmedabadFilterPage({ params }: AhmedabadFilterPageProps) {
  const { type, filter } = await params;
  const slug = slugFromSegments(type, filter);
  const page = getAhmedabadTypePage(slug);
  const { rates, isLive } = await getExchangeRates();

  if (!page) notFound();

  const properties = getLandingProperties(page, STATIC_PROPERTIES);
  const pageUrl = absoluteUrl(page.href);
  const serviceSchema = getServiceSchema(page, pageUrl);

  const collectionPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: page.title,
    description: page.description,
    about: { "@id": ENTITY_IDS.realEstateAgent },
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
      { "@type": "ListItem", position: 2, name: "Properties", item: absoluteUrl("/properties") },
      { "@type": "ListItem", position: 3, name: "Ahmedabad", item: absoluteUrl("/ahmedabad") },
      {
        "@type": "ListItem",
        position: 4,
        name: type.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
        item: absoluteUrl(mergedHref(`/ahmedabad/${type}`)),
      },
      { "@type": "ListItem", position: 5, name: page.label, item: pageUrl },
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
      <LandingPageTemplate page={page} properties={properties} initialRates={rates} initialIsLive={isLive} />
    </>
  );
}
