import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PROPERTY_TYPE_LANDING_PAGES } from "@/lib/data/geo";
import { ENTITY_IDS } from "@/lib/entity-profile";
import { absoluteUrl, createMetadata, serializeJsonLd, SITE_URL } from "@/lib/seo";
import { isLivePage } from "@/lib/data/page-merges";

export async function generateMetadata(): Promise<Metadata> {
  return createMetadata({
    title: "Luxury Property Types in Ahmedabad",
    description:
      "Explore curated luxury property categories across Ahmedabad — 4 & 5 BHK luxury apartments, penthouses, duplexes, independent villas, bungalows, residential plots, and preleased commercial offices.",
    path: "/property-types",
  });
}

export default function PropertyTypesIndexPage() {
  const pageUrl = absoluteUrl("/property-types");

  const collectionPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: "Luxury Property Types in Ahmedabad",
    description:
      "Explore curated luxury residential and advisory commercial property categories across Ahmedabad's premier western corridors.",
    about: { "@id": ENTITY_IDS.realEstateAgent },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: PROPERTY_TYPE_LANDING_PAGES.filter(isLivePage).map((page, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(page.href),
        name: page.label,
      })),
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Property Types", item: pageUrl },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(collectionPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }}
      />
      <Header alwaysSolid />
      <main id="main-content">
        {/* Hero Section */}
        <section className="bg-lux-black pt-24 pb-10 lg:pt-32 lg:pb-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="w-6 h-px bg-champagne-gold/40 mb-4" aria-hidden="true" />
            <p className="text-[9px] uppercase tracking-[0.25em] text-champagne-gold font-sans mb-3">
              Portfolio Categories
            </p>
            <h1 className="font-display text-[clamp(1.5rem,3vw,2.25rem)] font-normal text-ivory leading-tight uppercase tracking-wider">
              Luxury Property Types in Ahmedabad
            </h1>
            <p className="mt-4 max-w-2xl text-ivory/50 font-sans text-sm leading-relaxed">
              Curated access to western Ahmedabad&rsquo;s most sought-after residential and commercial formats — from skyline penthouses and sprawling villas to prime investment plots and Grade-A strata office space.
            </p>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="bg-soft-black py-14 lg:py-20 border-t border-white/[0.06]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {PROPERTY_TYPE_LANDING_PAGES.filter(isLivePage).map((page) => (
                <Link
                  key={page.slug}
                  href={page.href}
                  className="group bg-lux-black p-6 sm:p-8 border border-white/[0.08] hover:border-champagne-gold/50 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-6 h-px bg-champagne-gold/30 mb-4 group-hover:w-10 group-hover:bg-champagne-gold/70 transition-all duration-300" aria-hidden="true" />
                    <p className="text-[10px] uppercase tracking-[0.2em] text-champagne-gold font-sans mb-2">
                      {page.eyebrow}
                    </p>
                    <h2 className="font-display text-xl text-ivory mb-3 group-hover:text-champagne-gold transition-colors duration-200">
                      {page.label}
                    </h2>
                    <p className="text-xs font-sans text-ivory/50 leading-relaxed line-clamp-3">
                      {page.description}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-xs font-sans text-ivory/40 group-hover:text-ivory/70 transition-colors">
                      View curated listings
                    </span>
                    <span className="text-champagne-gold/50 group-hover:text-champagne-gold group-hover:translate-x-1 transition-all duration-200 text-sm" aria-hidden="true">
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
