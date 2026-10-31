import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PropertiesGrid } from "@/components/properties/PropertiesGrid";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { LOCATION_LANDING_PAGES, PROPERTY_TYPE_LANDING_PAGES } from "@/lib/data/geo";
import { STATIC_PROPERTIES } from "@/lib/data/properties";
import { getSupabaseProperties, getPageSeoData, getSupabaseGeneralFaqs } from "@/lib/db/queries";
import { ENTITY_IDS } from "@/lib/entity-profile";
import { absoluteUrl, createMetadata, serializeJsonLd } from "@/lib/seo";
import type { GeneralFaq } from "@/types";
import { getPriorityKeywordsForPath } from "@/lib/data/six-month-priority-keywords";
import { isLivePage } from "@/lib/data/page-merges";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeoData("properties");
  const defaultTitle = "Luxury Properties in Ahmedabad";
  const defaultDesc = "Explore curated luxury homes in Ahmedabad across Iscon-Ambli, Sindhu Bhavan, Thaltej, and SG Highway. Private advisory for HNI and NRI buyers.";

  return createMetadata({
    title: seo?.seoTitle || defaultTitle,
    description: seo?.seoDescription || defaultDesc,
    path: "/properties",
    keywords: getPriorityKeywordsForPath("/properties"),
  });
}

const FALLBACK_PROPERTY_FAQ_ITEMS = [
  {
    question: "Which Ahmedabad areas does PIKORUA Realty focus on for luxury homes?",
    answer:
      "PIKORUA Realty focuses on premium residential corridors such as Sindhu Bhavan Road, Iskon-Ambli, Thaltej, Shilaj, SG Highway, Vaishno Devi, and other high-value Ahmedabad micro-markets.",
  },
  {
    question: "Can I filter the collection by apartment, villa, bungalow, or plot?",
    answer:
      "Yes. Use the category filters on this page to view curated luxury apartments, villas, bungalows, and premium residential plots. Some private inventory is shared only after consultation.",
  },
  {
    question: "Are all listed properties publicly available?",
    answer:
      "No. PIKORUA Realty operates as a private advisory, so selected details, seller identities, pricing context, and walkthrough access may be shared only with qualified buyers.",
  },
  {
    question: "Does PIKORUA Realty help NRI buyers evaluate Ahmedabad properties?",
    answer:
      "Yes. NRI buyers can request shortlist curation, document guidance, remote walkthrough coordination, and transaction support for residential purchases in Ahmedabad.",
  },
];

export default async function PropertiesPage() {
  const dbProperties = await getSupabaseProperties({ onlyActive: true });
  const properties = dbProperties.length > 0 ? dbProperties : STATIC_PROPERTIES;

  let dbFaqs: GeneralFaq[] = [];
  try {
    dbFaqs = await getSupabaseGeneralFaqs();
  } catch (err) {
    console.error("Error fetching general FAQs for properties page:", err);
  }

  const categoryFaqs = dbFaqs.filter((f) => f.category === "properties");
  const finalFaqs = categoryFaqs.length > 0 ? categoryFaqs : FALLBACK_PROPERTY_FAQ_ITEMS;

  const pageDescription =
    "Curated luxury residential properties in Ahmedabad, including 4/5 BHK apartments, penthouses, villas, bungalows, plots, and investment-led residences.";
  const collectionPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": absoluteUrl("/properties#webpage"),
    url: absoluteUrl("/properties"),
    name: "Luxury Properties in Ahmedabad",
    description: pageDescription,
    about: {
      "@id": ENTITY_IDS.realEstateAgent,
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: properties.slice(0, 24).map((property, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(`/properties/${property.slug}`),
        name: `${property.configuration} in ${property.locationLabel}`,
      })),
    },
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: finalFaqs.map((item) => ({
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
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(collectionPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqSchema) }}
      />
      <Header alwaysSolid />
      <main id="main-content">
        {/* Page hero */}
        <section className="bg-lux-black pt-24 pb-8 lg:pt-32 lg:pb-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="w-6 h-px bg-champagne-gold/40 mb-4" aria-hidden="true" />
            <p className="text-[9px] uppercase tracking-[0.25em] text-champagne-gold font-sans mb-3">
              Private Inventory
            </p>
            <h1 className="font-display text-[clamp(1.25rem,2.2vw,1.75rem)] font-normal text-ivory leading-tight uppercase tracking-wider">
              The Collection
            </h1>
            <p className="mt-3 text-ivory/50 font-sans text-xs max-w-sm leading-relaxed">
              A refined shortlist of Ahmedabad&rsquo;s premier residences and land parcels, curated for architectural distinction.
            </p>
          </div>
        </section>

        <PropertiesGrid properties={properties} />
        <section className="bg-lux-black py-16 lg:py-20 border-t border-white/[0.06]" aria-labelledby="browse-guides-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-10">
              <p className="text-[10px] uppercase tracking-[0.25em] text-champagne-gold font-sans mb-3">
                Browse Guides
              </p>
              <h2
                id="browse-guides-heading"
                className="font-display text-[clamp(1.4rem,2.6vw,2rem)] font-light text-white uppercase tracking-wider"
              >
                Explore by Corridor and Property Type
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xs uppercase tracking-[0.22em] text-ivory/40 font-sans mb-4">
                  Prime Corridors
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {LOCATION_LANDING_PAGES.map((page) => (
                    <Link
                      key={page.href}
                      href={page.href}
                      className="border border-white/[0.07] rounded-sm px-4 py-3 text-sm font-sans text-ivory/65 hover:text-champagne-gold hover:border-champagne-gold/35 transition-colors"
                    >
                      {page.label}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-[0.22em] text-ivory/40 font-sans mb-4">
                  Property Types
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PROPERTY_TYPE_LANDING_PAGES.filter(isLivePage).map((page) => (
                    <Link
                      key={page.href}
                      href={page.href}
                      className="border border-white/[0.07] rounded-sm px-4 py-3 text-sm font-sans text-ivory/65 hover:text-champagne-gold hover:border-champagne-gold/35 transition-colors"
                    >
                      {page.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="bg-lux-black py-16 lg:py-24 border-t border-white/[0.06]" aria-labelledby="properties-faq-heading">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-2 flex flex-col items-center mb-10">
              <p className="text-[10px] uppercase tracking-[0.3em] text-champagne-gold font-sans font-medium">
                Advisory FAQ
              </p>
              <div className="w-8 h-px bg-champagne-gold/50" aria-hidden="true" />
              <h2
                id="properties-faq-heading"
                className="font-display text-[clamp(1.5rem,3vw,2rem)] font-light text-white uppercase tracking-wider text-center mt-2"
              >
                Ahmedabad&rsquo;s Luxury Property Questions
              </h2>
            </div>
            <FaqAccordion items={finalFaqs} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
