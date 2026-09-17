import type { Metadata } from "next";
import { LandingPageTemplate } from "@/components/seo/LandingPageTemplate";
import { STATIC_PROPERTIES } from "@/lib/data/properties";
import { NRI_MAIN_INDEX_PAGE, NRI_COUNTRY_INDEX_PAGES } from "@/lib/data/nri-index-pages";
import { getLandingProperties } from "@/lib/data/geo";
import { getExchangeRates } from "@/lib/exchange-rates";
import { ENTITY_IDS, getNriAdvisoryServiceSchema } from "@/lib/entity-profile";
import { absoluteUrl, createMetadata, serializeJsonLd, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: NRI_MAIN_INDEX_PAGE.title,
  description: NRI_MAIN_INDEX_PAGE.description,
  path: NRI_MAIN_INDEX_PAGE.href,
  image: NRI_MAIN_INDEX_PAGE.heroImage,
  keywords: [
    NRI_MAIN_INDEX_PAGE.label,
    NRI_MAIN_INDEX_PAGE.title,
    ...(NRI_MAIN_INDEX_PAGE.matchKeywords ?? []),
    ...(NRI_MAIN_INDEX_PAGE.seoKeywords ?? []),
  ],
});

export default async function NriIndexPage() {
  const page = NRI_MAIN_INDEX_PAGE;
  const properties = getLandingProperties(page, STATIC_PROPERTIES);
  const { rates, isLive } = await getExchangeRates();
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
    about: [{ "@id": ENTITY_IDS.realEstateAgent }, { "@id": `${pageUrl}#service` }],
    mainEntity: {
      "@type": "ItemList",
      itemListElement: NRI_COUNTRY_INDEX_PAGES.map((countryPage, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(countryPage.href),
        name: countryPage.label,
      })),
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "NRI Property Centre", item: pageUrl },
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(collectionPageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqSchema) }} />
      <LandingPageTemplate page={page} properties={properties} initialRates={rates} initialIsLive={isLive} />
    </>
  );
}

export const revalidate = 86400;
