import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LandingPageTemplate } from "@/components/seo/LandingPageTemplate";
import { STATIC_PROPERTIES } from "@/lib/data/properties";
import {
  type GeoLandingPage,
  getLandingProperties,
  getRootLandingPage,
  getRootLandingPages,
} from "@/lib/data/geo";
import { getKeywordClusterTermsForSlug } from "@/lib/data/keyword-clusters";
import {
  BUSINESS_LANGUAGES,
  ENTITY_IDS,
  getAhmedabadAreaServedSchema,
  getNriAdvisoryServiceSchema,
} from "@/lib/entity-profile";
import { absoluteUrl, createMetadata, serializeJsonLd, SITE_URL } from "@/lib/seo";
import { getExchangeRates } from "@/lib/exchange-rates";
import { getPriorityKeywordsForPath } from "@/lib/data/six-month-priority-keywords";

interface RootLandingPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getRootLandingPages().map((page) => ({ slug: page.href.slice(1) }));
}

export async function generateMetadata({ params }: RootLandingPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getRootLandingPage(slug);
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

function getCollectionAbout(page: GeoLandingPage, pageUrl: string) {
  if (page.kind === "location") {
    return [
      {
        "@type": "Place",
        name: page.label,
        ...(page.wikipediaUrl || page.wikidataUrl
          ? {
              sameAs: [page.wikipediaUrl, page.wikidataUrl].filter(Boolean),
            }
          : {}),
        ...(page.coordinates
          ? {
              geo: {
                "@type": "GeoCoordinates",
                latitude: page.coordinates.latitude,
                longitude: page.coordinates.longitude,
              },
            }
          : {}),
      },
      {
        "@id": ENTITY_IDS.realEstateAgent,
      },
    ];
  }

  if (page.kind === "nri") {
    return [
      {
        "@id": ENTITY_IDS.realEstateAgent,
      },
      {
        "@id": `${pageUrl}#service`,
      },
    ];
  }

  if (page.collectionHref?.startsWith("/contact")) {
    return [
      {
        "@id": ENTITY_IDS.realEstateAgent,
      },
      {
        "@id": `${pageUrl}#service`,
      },
    ];
  }

  return {
    "@id": ENTITY_IDS.realEstateAgent,
  };
}

function getServiceSchema(page: GeoLandingPage, pageUrl: string) {
  if (page.kind === "nri") {
    return getNriAdvisoryServiceSchema({
      pageUrl,
      name: page.title,
      description: page.description,
      serviceType: page.label,
    });
  }

  if (!page.collectionHref?.startsWith("/contact")) return null;

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${pageUrl}#service`,
    name: page.title,
    description: page.description,
    url: pageUrl,
    serviceType: page.label,
    provider: {
      "@id": ENTITY_IDS.realEstateAgent,
    },
    areaServed: getAhmedabadAreaServedSchema(),
    audience: {
      "@type": "Audience",
      audienceType: "Luxury property buyers, sellers, NRIs, and real estate investors",
    },
    serviceOutput: [
      "curated Ahmedabad property shortlist",
      "corridor and micro-market comparison",
      "developer and documentation review coordination",
      "private site visit or virtual walkthrough planning",
      "negotiation and transaction coordination",
    ],
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: absoluteUrl("/contact"),
      availableLanguage: [...BUSINESS_LANGUAGES],
    },
  };
}

export default async function RootLandingPage({ params }: RootLandingPageProps) {
  const { slug } = await params;
  const page = getRootLandingPage(slug);
  const { rates, isLive } = await getExchangeRates();

  if (!page) {
    notFound();
  }

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
    about: getCollectionAbout(page, pageUrl),
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
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: page.kind === "nri" ? "NRI Advisory" : "Properties",
        item: page.kind === "nri" ? absoluteUrl("/nri") : absoluteUrl("/properties"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: page.label,
        item: pageUrl,
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      {serviceSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(serviceSchema) }}
        />
      ) : null}
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
