import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  PRIVATE_CLIENT_AUDIENCES,
  PRIVATE_CLIENT_PAGES,
  PRIVATE_CLIENT_SERVICE_PROMISE,
  PUBLIC_FIGURES_ADVISORY_PAGE,
} from "@/lib/data/private-client-advisory";
import { absoluteUrl, createMetadata, serializeJsonLd, SITE_URL } from "@/lib/seo";
import { ENTITY_IDS, getAhmedabadAreaServedSchema } from "@/lib/entity-profile";
import { isLivePage } from "@/lib/data/page-merges";

export const metadata: Metadata = createMetadata({
  title: "Private Client Advisory in Ahmedabad",
  description:
    "Discreet real estate advisory for HNIs, UHNIs, business families, founders, CXOs, global Indians and family offices in Ahmedabad.",
  path: "/private-client-advisory",
  image: "/properties/capstone/capstone-1-courtyard.jpg",
  keywords: [
    "private client advisory Ahmedabad",
    "private real estate advisory Ahmedabad",
    "HNI property advisory Ahmedabad",
    "UHNI property Ahmedabad",
    "family office property advisory",
  ],
});

export default function PrivateClientAdvisoryPage() {
  const pageUrl = absoluteUrl("/private-client-advisory");
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${pageUrl}#service`,
    name: "Private Client Real Estate Advisory",
    description: PRIVATE_CLIENT_SERVICE_PROMISE,
    url: pageUrl,
    provider: { "@id": ENTITY_IDS.realEstateAgent },
    areaServed: getAhmedabadAreaServedSchema(),
    audience: {
      "@type": "Audience",
      audienceType: PRIVATE_CLIENT_AUDIENCES.join(", "),
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Private Client Advisory Mandates",
      itemListElement: PRIVATE_CLIENT_PAGES.filter(isLivePage).map((page) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: page.label,
          url: absoluteUrl(page.href),
        },
      })),
    },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Private Client Advisory", item: pageUrl },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }} />
      <Header alwaysSolid />
      <main id="main-content" className="min-h-screen bg-lux-black text-ivory">
        <section className="border-b border-white/[0.06] pb-20 pt-32 sm:pt-40 lg:pb-28 lg:pt-48">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl">
              <div className="mb-7 flex items-center gap-4">
                <span className="h-px w-8 bg-champagne-gold/55" />
                <p className="font-sans text-[10px] uppercase tracking-[0.28em] text-champagne-gold">
                  By Private Mandate
                </p>
              </div>
              <h1 className="max-w-3xl font-display text-[clamp(2.4rem,6vw,5.5rem)] font-light uppercase leading-[1.02] tracking-wider">
                Private Client Advisory
              </h1>
              <p className="mt-8 max-w-2xl font-sans text-base leading-relaxed text-ivory/60 sm:text-lg">
                {PRIVATE_CLIENT_SERVICE_PROMISE}
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/contact?purpose=private-client"
                  className="inline-flex min-h-[52px] items-center justify-center bg-champagne-gold px-7 font-sans text-[11px] uppercase tracking-[0.18em] text-lux-black transition-colors hover:bg-antique-gold"
                >
                  Request a Private Conversation
                </Link>
                <Link
                  href="/properties"
                  className="inline-flex min-h-[52px] items-center justify-center border border-white/15 px-7 font-sans text-[11px] uppercase tracking-[0.18em] text-ivory/75 transition-colors hover:border-champagne-gold/50 hover:text-champagne-gold"
                >
                  View Selected Residences
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-white/[0.06] py-16 lg:py-20" aria-labelledby="private-client-audience">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
            <div className="lg:col-span-4">
              <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-champagne-gold">
                Client Context
              </p>
              <h2 id="private-client-audience" className="mt-4 font-display text-2xl uppercase tracking-wider">
                Designed Around the Mandate
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-3">
              {PRIVATE_CLIENT_AUDIENCES.map((audience) => (
                <div key={audience} className="flex items-center gap-3 border border-white/[0.07] px-4 py-4">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-champagne-gold/60" />
                  <span className="font-sans text-sm text-ivory/65">{audience}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 lg:py-28" aria-labelledby="private-client-mandates">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-champagne-gold">
                Advisory Mandates
              </p>
              <h2 id="private-client-mandates" className="mt-4 font-display text-3xl font-light uppercase tracking-wider">
                Select the Relevant Brief
              </h2>
              <p className="mt-5 font-sans text-sm leading-relaxed text-ivory/50">
                Each mandate has a distinct purpose, diligence profile and decision process. The work is scoped before properties or counterparties are introduced.
              </p>
            </div>
            <div className="mt-12 grid gap-px bg-white/[0.06] md:grid-cols-2 lg:grid-cols-3">
              {[...PRIVATE_CLIENT_PAGES.filter(isLivePage), PUBLIC_FIGURES_ADVISORY_PAGE].map((page) => (
                <Link
                  key={page.href}
                  href={page.href}
                  className="group min-h-56 bg-lux-black p-6 transition-colors hover:bg-soft-black sm:p-8"
                >
                  <p className="font-sans text-[9px] uppercase tracking-[0.2em] text-champagne-gold/60">
                    {page.eyebrow}
                  </p>
                  <h3 className="mt-5 font-display text-xl uppercase leading-snug tracking-wide text-ivory transition-colors group-hover:text-champagne-gold">
                    {page.label}
                  </h3>
                  <p className="mt-4 line-clamp-3 font-sans text-xs leading-relaxed text-ivory/45">
                    {page.description}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 font-sans text-[10px] uppercase tracking-[0.16em] text-champagne-gold/55">
                    View mandate
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
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
