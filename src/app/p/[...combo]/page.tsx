import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { STATIC_PROPERTIES } from "@/lib/data/properties";
import {
  parseComboSegments,
  buildComboHref,
  LOCATION_MAP,
  PROPERTY_TYPE_MAP,
  BHK_MAP,
  BUDGET_MAP,
  INTENT_MAP,
  type ParsedCombo,
} from "@/lib/data/seo-dimensions";
import { generateComboPage } from "@/lib/data/combo-content-engine";
import { getRelatedCombos } from "@/lib/data/combo-linker";
import { ALL_STATIC_COMBO_PARAMS } from "@/lib/data/combo-seeder";
import { isComboIndexable, matchComboProperties } from "@/lib/data/combo-matching";
import { filterLinkableClusters, indexableParentComboHrefs } from "@/lib/data/combo-indexable";
import { ProgrammaticPageTemplate } from "@/components/seo/ProgrammaticPageTemplate";
import { absoluteUrl, createMetadata, serializeJsonLd, SITE_URL } from "@/lib/seo";
import { ENTITY_IDS } from "@/lib/entity-profile";

interface ComboPageProps {
  params: Promise<{ combo: string[] }>;
}

// ISR: render on first request, cache for 24 hours.
// SSG top-500 seeded combos are pre-rendered at build time.
export const dynamicParams = true;
export const revalidate = 604800;

export function generateStaticParams() {
  return ALL_STATIC_COMBO_PARAMS;
}

export async function generateMetadata({ params }: ComboPageProps): Promise<Metadata> {
  const { combo } = await params;
  const parsed = parseComboSegments(combo);
  if (!parsed?.location) return {};

  const page = generateComboPage(parsed);
  const properties = matchComboProperties(parsed, STATIC_PROPERTIES);

  return createMetadata({
    title: page.title,
    description: page.description,
    path: page.href,
    image: page.heroImage,
    keywords: [
      page.h1,
      ...(parsed.location ? [parsed.location.label, `${parsed.location.label} Ahmedabad`] : []),
      ...(parsed.type ? [parsed.type.pluralLabel, `${parsed.type.pluralLabel} Ahmedabad`] : []),
      ...(parsed.bhk ? [parsed.bhk.label] : []),
      ...(parsed.budget ? [parsed.budget.label] : []),
      ...(parsed.intent ? [parsed.intent.label] : []),
    ],
    noIndex: !isComboIndexable(parsed, properties),
  });
}

function buildSchemas(parsed: ParsedCombo, page: ReturnType<typeof generateComboPage>, pageUrl: string) {
  const loc = parsed.location!;

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${pageUrl}#service`,
    name: page.title,
    description: page.description,
    url: pageUrl,
    serviceType: page.combo.type?.pluralLabel ?? "Real Estate Advisory",
    provider: { "@id": ENTITY_IDS.realEstateAgent },
    areaServed: {
      "@type": "Place",
      name: `${loc.label}, Ahmedabad`,
      address: {
        "@type": "PostalAddress",
        addressLocality: loc.label,
        addressRegion: "Gujarat",
        addressCountry: "IN",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: loc.coordinates.lat,
        longitude: loc.coordinates.lng,
      },
    },
  };

  const breadcrumbItems: { name: string; item: string }[] = [
    { name: "Home", item: SITE_URL },
    { name: "Properties", item: absoluteUrl("/properties") },
    { name: "Search", item: absoluteUrl("/p") },
    { name: loc.label, item: absoluteUrl(`/p/${loc.slug}`) },
  ];
  if (parsed.type) {
    breadcrumbItems.push({ name: parsed.type.pluralLabel, item: absoluteUrl(`/p/${loc.slug}/${parsed.type.slug}`) });
  }
  if (parsed.bhk && parsed.type?.bhkApplicable) {
    breadcrumbItems.push({ name: parsed.bhk.label, item: absoluteUrl(`/p/${loc.slug}/${parsed.type!.slug}/${parsed.bhk.slug}`) });
  }
  if (parsed.budget) {
    const prev = [loc.slug, parsed.type?.slug, parsed.bhk?.slug].filter(Boolean);
    breadcrumbItems.push({ name: parsed.budget.label, item: absoluteUrl(`/p/${[...prev, parsed.budget.slug].join("/")}`) });
  }
  if (parsed.intent) {
    breadcrumbItems.push({ name: parsed.intent.label, item: absoluteUrl(page.href) });
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.item,
    })),
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return { serviceSchema, breadcrumbSchema, faqSchema };
}

export default async function ComboPage({ params }: ComboPageProps) {
  const { combo } = await params;

  // Validate and parse segments
  const parsed = parseComboSegments(combo);
  if (!parsed) notFound();

  const page = generateComboPage(parsed);
  const properties = matchComboProperties(parsed, STATIC_PROPERTIES);
  // Link only to combo pages that are indexable (see combo-indexable.ts).
  const relatedLinks = filterLinkableClusters(getRelatedCombos(parsed));
  const linkableParentHrefs = indexableParentComboHrefs(page.href);
  const pageUrl = absoluteUrl(page.href);

  if (!isComboIndexable(parsed, properties)) {
    page.noindex = true;
  }

  const { serviceSchema, breadcrumbSchema, faqSchema } = buildSchemas(parsed, page, pageUrl);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqSchema) }}
      />
      <ProgrammaticPageTemplate
        page={page}
        properties={properties}
        relatedLinks={relatedLinks}
        linkableParentHrefs={linkableParentHrefs}
      />
    </>
  );
}
