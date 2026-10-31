import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentHubTemplate } from "@/components/seo/ContentHubTemplate";
import { linkableHrefs } from "@/lib/data/combo-indexable";
import {
  getContentHubsByPrefix,
  getContentHubPage,
  getRelatedContentHubs,
} from "@/lib/data/content-hubs";
import { absoluteUrl, createMetadata, serializeJsonLd, SITE_URL } from "@/lib/seo";
import { ENTITY_IDS } from "@/lib/entity-profile";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getContentHubsByPrefix("learn").map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getContentHubPage(slug);
  if (!page || page.prefix !== "learn") return {};
  return createMetadata({
    title: page.title,
    description: page.description,
    path: page.href,
    image: page.heroImage,
  });
}

export default async function LearnPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getContentHubPage(slug);
  if (!page || page.prefix !== "learn") notFound();

  const relatedPages = getRelatedContentHubs(page);
  const pageUrl = absoluteUrl(page.href);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${pageUrl}#article`,
    headline: page.h1,
    description: page.description,
    url: pageUrl,
    image: absoluteUrl(page.heroImage),
    datePublished: page.publishedAt,
    dateModified: page.publishedAt,
    author: { "@id": ENTITY_IDS.realEstateAgent },
    publisher: { "@id": ENTITY_IDS.realEstateAgent },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Property Education", item: absoluteUrl("/learn") },
      { "@type": "ListItem", position: 3, name: page.h1, item: pageUrl },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }} />
      <ContentHubTemplate
        page={{ ...page, relatedListingHrefs: linkableHrefs(page.relatedListingHrefs) }}
        relatedPages={relatedPages}
      />
    </>
  );
}
