import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ALL_CONTENT_HUB_PAGES, type ContentHubPage } from "@/lib/data/content-hubs";
import { ENTITY_IDS } from "@/lib/entity-profile";
import { absoluteUrl, createMetadata, serializeJsonLd, SITE_URL } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return createMetadata({
    title: "GIFT City Real Estate & Commercial Property",
    description:
      "Comprehensive advisory and investment guide for GIFT City real estate — Grade-A commercial office space, residential towers, NRI tax benefits, IFSC regulatory framework, and yield analysis.",
    path: "/gift-city",
  });
}

const GIFT_CITY_HUB_PAGES = ALL_CONTENT_HUB_PAGES.filter((p: ContentHubPage) => p.prefix === "gift-city");

const GIFT_CITY_FAQS = [
  {
    question: "Why is GIFT City a strategic real estate investment destination?",
    answer:
      "GIFT City (Gujarat International Finance Tec-City) is India's first operational International Financial Services Centre (IFSC). It offers 100% tax exemption for 10 consecutive years out of 15 for IFSC units, zero GST on transaction services, and modern infrastructure, driving high commercial office demand and rental yields.",
  },
  {
    question: "Can NRIs buy commercial and residential property in GIFT City?",
    answer:
      "Yes. NRIs can freely invest in GIFT City residential apartments and commercial office units under standard FEMA guidelines, with options to transact in foreign currency through IFSC Banking Units (IBUs).",
  },
  {
    question: "What rental yields can investors expect in GIFT City commercial offices?",
    answer:
      "Preleased Grade-A commercial office spaces in GIFT City command gross rental yields of 6.2% to 7.8% p.a., with multi-year corporate leases and built-in escalations.",
  },
];

export default function GiftCityIndexPage() {
  const pageUrl = absoluteUrl("/gift-city");

  const collectionPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: "GIFT City Real Estate & Investment Advisory",
    description:
      "Guide to GIFT City commercial office, residential, and NRI property investments.",
    about: { "@id": ENTITY_IDS.realEstateAgent },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: GIFT_CITY_HUB_PAGES.map((page: ContentHubPage, index: number) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(page.href),
        name: page.title,
      })),
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "GIFT City Advisory", item: pageUrl },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: GIFT_CITY_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
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
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqSchema) }}
      />
      <Header alwaysSolid />
      <main id="main-content">
        {/* Hero Section */}
        <section className="bg-lux-black pt-24 pb-10 lg:pt-32 lg:pb-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="w-6 h-px bg-champagne-gold/40 mb-4" aria-hidden="true" />
            <p className="text-[9px] uppercase tracking-[0.25em] text-champagne-gold font-sans mb-3">
              IFSC Real Estate Advisory
            </p>
            <h1 className="font-display text-[clamp(1.5rem,3vw,2.25rem)] font-normal text-ivory leading-tight uppercase tracking-wider">
              GIFT City Real Estate &amp; Investment Hub
            </h1>
            <p className="mt-4 max-w-2xl text-ivory/50 font-sans text-sm leading-relaxed">
              India&rsquo;s global financial gateway. Explore high-yield preleased Grade-A office space, luxury IFSC-adjacent residences, and tax-optimized real estate allocation strategies for HNIs and NRIs.
            </p>
          </div>
        </section>

        {/* Guides & Hub Pages */}
        <section className="bg-soft-black py-14 lg:py-20 border-t border-white/[0.06]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 max-w-2xl">
              <h2 className="font-display text-xl sm:text-2xl font-normal text-ivory uppercase tracking-wider">
                GIFT City Intelligence &amp; Decision Guides
              </h2>
              <p className="mt-2 text-ivory/50 font-sans text-sm">
                Detailed advisory, market data, and regulatory breakdowns.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {GIFT_CITY_HUB_PAGES.map((page: ContentHubPage) => (
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
                    <h3 className="font-display text-lg text-ivory mb-3 group-hover:text-champagne-gold transition-colors duration-200">
                      {page.h1}
                    </h3>
                    <p className="text-xs font-sans text-ivory/50 leading-relaxed line-clamp-3">
                      {page.description}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-xs font-sans text-ivory/40 group-hover:text-ivory/70 transition-colors">
                      Read guide
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

        {/* FAQs */}
        <section className="bg-lux-black py-14 lg:py-20 border-t border-white/[0.06]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-xl sm:text-2xl font-normal text-ivory uppercase tracking-wider mb-8">
              Frequently Asked Questions — GIFT City Real Estate
            </h2>
            <div className="space-y-6 max-w-3xl">
              {GIFT_CITY_FAQS.map((faq, i) => (
                <div key={i} className="p-6 bg-soft-black border border-white/[0.06]">
                  <h3 className="font-display text-base text-ivory mb-2">{faq.question}</h3>
                  <p className="font-sans text-xs sm:text-sm text-ivory/60 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
