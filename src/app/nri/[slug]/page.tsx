import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { LandingPageTemplate } from "@/components/seo/LandingPageTemplate";
import { STATIC_PROPERTIES } from "@/lib/data/properties";
import {
  NRI_LANDING_PAGES,
  getLandingProperties,
  getNriLandingPage,
} from "@/lib/data/geo";
import { ENTITY_IDS, getNriAdvisoryServiceSchema } from "@/lib/entity-profile";
import { absoluteUrl, createMetadata, serializeJsonLd, SITE_URL } from "@/lib/seo";
import { getExchangeRates } from "@/lib/exchange-rates";
import { getKeywordClusterTermsForSlug } from "@/lib/data/keyword-clusters";
import { getPriorityKeywordsForPath } from "@/lib/data/six-month-priority-keywords";

interface NriPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return NRI_LANDING_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: NriPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getNriLandingPage(slug);
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

export default async function NriLandingPage({ params }: NriPageProps) {
  const { slug } = await params;
  const page = getNriLandingPage(slug);
  const { rates, isLive } = await getExchangeRates();

  if (!page) {
    notFound();
  }

  if (page.href !== `/nri/${slug}`) {
    permanentRedirect(page.href);
  }

  const properties = getLandingProperties(page, STATIC_PROPERTIES);
  const pageUrl = absoluteUrl(page.href);

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
      {
        "@id": ENTITY_IDS.realEstateAgent,
      },
      {
        "@id": `${pageUrl}#service`,
      },
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
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "NRI Advisory",
        item: absoluteUrl("/nri"),
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
