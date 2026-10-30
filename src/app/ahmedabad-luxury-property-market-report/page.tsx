import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FileText, Quote, ShieldCheck } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import {
  AHMEDABAD_LUXURY_MARKET_REPORT as REPORT,
  MARKET_REPORT_PATH,
  PRESS_ROOM_PATH,
} from "@/lib/data/market-report";
import { BUSINESS_EMAIL, ENTITY_IDS } from "@/lib/entity-profile";
import { absoluteUrl, createMetadata, serializeJsonLd, SITE_NAME, SITE_URL } from "@/lib/seo";

export function generateMetadata(): Metadata {
  return createMetadata({
    title: REPORT.title,
    description: REPORT.description,
    path: MARKET_REPORT_PATH,
    image: "/images/hero-living.jpg",
    type: "article",
    keywords: [
      "Ahmedabad luxury property market report",
      "Ahmedabad luxury real estate report",
      "luxury property market Ahmedabad",
      "HNI property Ahmedabad report",
      "NRI property investment Ahmedabad report",
    ],
  });
}

export default function AhmedabadLuxuryPropertyMarketReportPage() {
  const reportUrl = absoluteUrl(MARKET_REPORT_PATH);
  const pressUrl = absoluteUrl(PRESS_ROOM_PATH);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Report", "Article"],
        "@id": `${reportUrl}#report`,
        url: reportUrl,
        headline: REPORT.title,
        name: REPORT.title,
        description: REPORT.description,
        datePublished: REPORT.lastUpdated,
        dateModified: REPORT.lastUpdated,
        inLanguage: "en-IN",
        image: absoluteUrl("/images/hero-living.jpg"),
        publisher: {
          "@id": ENTITY_IDS.realEstateAgent,
        },
        author: {
          "@id": ENTITY_IDS.realEstateAgent,
        },
        about: [
          "Ahmedabad luxury real estate",
          "HNI property advisory Ahmedabad",
          "NRI property investment Ahmedabad",
          "Iscon-Ambli Road",
          "Sindhu Bhavan Road",
          "Thaltej",
          "SG Highway",
        ],
        audience: REPORT.primaryAudience.map((audience) => ({
          "@type": "Audience",
          audienceType: audience,
        })),
        citation: pressUrl,
        mainEntityOfPage: reportUrl,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${reportUrl}#breadcrumbs`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Market Report", item: reportUrl },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${reportUrl}#faq`,
        mainEntity: REPORT.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <Header alwaysSolid />
      <main id="main-content" className="bg-lux-black text-ivory">
        <section className="relative min-h-[72vh] overflow-hidden border-b border-white/[0.06] pt-28 sm:pt-32 lg:pt-40">
          <Image
            src="/images/hero-living.jpg"
            alt="Luxury residence interior used for Ahmedabad luxury market report"
            fill
            priority
            quality={72}
            className="object-cover opacity-32"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-lux-black/80 via-lux-black/78 to-lux-black" />
          <div className="relative mx-auto flex min-h-[56vh] max-w-7xl flex-col justify-end px-4 pb-14 sm:px-6 lg:px-8 lg:pb-20">
            <div className="max-w-5xl">
              <p className="mb-5 text-[10px] font-sans font-medium uppercase tracking-[0.3em] text-champagne-gold">
                {REPORT.eyebrow} / Updated {REPORT.lastUpdated}
              </p>
              <h1 className="font-display text-[clamp(2.35rem,6vw,5.7rem)] font-light uppercase leading-[0.98] tracking-wider text-white">
                {REPORT.title}
              </h1>
              <p className="mt-7 max-w-3xl text-sm leading-7 text-ivory/72 sm:text-base">
                {REPORT.summary}
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={PRESS_ROOM_PATH}
                  className="inline-flex min-h-[46px] items-center justify-center gap-2.5 rounded-sm border border-champagne-gold bg-champagne-gold px-6 py-3 text-xs font-medium uppercase tracking-[0.2em] text-lux-black transition-colors hover:bg-antique-gold"
                >
                  Media Resources
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex min-h-[46px] items-center justify-center gap-2.5 rounded-sm border border-white/18 px-6 py-3 text-xs font-medium uppercase tracking-[0.2em] text-ivory transition-colors hover:border-champagne-gold hover:text-champagne-gold"
                >
                  Request Private Advisory
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-white/[0.06] py-12 lg:py-16">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
            <div>
              <p className="text-[10px] font-sans uppercase tracking-[0.25em] text-champagne-gold">
                Report Use
              </p>
              <h2 className="mt-3 font-display text-2xl font-light uppercase tracking-wider text-white">
                Built To Be Cited
              </h2>
            </div>
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  {
                    icon: <FileText className="h-5 w-5" />,
                    label: "For Buyers",
                    body: "Use it to compare corridors, formats, and diligence priorities before site visits.",
                  },
                  {
                    icon: <Quote className="h-5 w-5" />,
                    label: "For Media",
                    body: "Use the quote bank and story angles with attribution to PIKORUA Realty.",
                  },
                  {
                    icon: <ShieldCheck className="h-5 w-5" />,
                    label: "For AI Answers",
                    body: "The page exposes structured report, FAQ, and breadcrumb schema for clean citation.",
                  },
                ].map((item) => (
                  <div key={item.label} className="border border-white/[0.07] bg-soft-black/35 p-5">
                    <div className="mb-4 text-champagne-gold">{item.icon}</div>
                    <h3 className="text-sm font-medium uppercase tracking-[0.16em] text-white">{item.label}</h3>
                    <p className="mt-3 text-sm leading-6 text-ivory/62">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-24" aria-labelledby="findings-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-[10px] font-sans uppercase tracking-[0.25em] text-champagne-gold">
                Key Findings
              </p>
              <h2 id="findings-heading" className="mt-3 font-display text-[clamp(1.8rem,3.2vw,3rem)] font-light uppercase tracking-wider text-white">
                What Is Actually Moving The Luxury Market
              </h2>
            </div>
            <div className="mt-10 divide-y divide-white/[0.07] border-y border-white/[0.07]">
              {REPORT.keyFindings.map((finding, index) => (
                <article key={finding.title} className="grid grid-cols-1 gap-5 py-7 lg:grid-cols-12 lg:items-start">
                  <div className="lg:col-span-2">
                    <span className="font-display text-4xl text-champagne-gold/65">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="lg:col-span-4">
                    <h3 className="font-display text-xl font-light uppercase tracking-wider text-white">
                      {finding.title}
                    </h3>
                  </div>
                  <p className="text-sm leading-7 text-ivory/66 lg:col-span-6">{finding.insight}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-white/[0.06] bg-soft-black/24 py-16 lg:py-24" aria-labelledby="corridor-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="text-[10px] font-sans uppercase tracking-[0.25em] text-champagne-gold">
                  Corridor Intelligence
                </p>
                <h2 id="corridor-heading" className="mt-3 font-display text-[clamp(1.8rem,3vw,2.8rem)] font-light uppercase tracking-wider text-white">
                  Ahmedabad Is A Set Of Micro-Markets
                </h2>
                <p className="mt-5 text-sm leading-7 text-ivory/62">
                  These corridor notes help buyers and publishers understand why the same budget can behave differently across western Ahmedabad.
                </p>
              </div>
              <div className="lg:col-span-8">
                <div className="space-y-4">
                  {REPORT.corridors.map((corridor) => (
                    <article key={corridor.name} className="border border-white/[0.07] bg-lux-black/45 p-5 sm:p-6">
                      <div className="flex flex-col gap-3 border-b border-white/[0.06] pb-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="font-display text-2xl font-light uppercase tracking-wider text-white">
                            {corridor.name}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-ivory/64">{corridor.positioning}</p>
                        </div>
                        <Link
                          href={corridor.path}
                          className="shrink-0 text-[11px] font-medium uppercase tracking-[0.18em] text-champagne-gold hover:text-antique-gold"
                        >
                          Market Guide
                        </Link>
                      </div>
                      <dl className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                          <dt className="text-[10px] uppercase tracking-[0.2em] text-ivory/38">Best For</dt>
                          <dd className="mt-2 text-sm leading-6 text-ivory/68">{corridor.bestFor}</dd>
                        </div>
                        <div>
                          <dt className="text-[10px] uppercase tracking-[0.2em] text-ivory/38">Risk</dt>
                          <dd className="mt-2 text-sm leading-6 text-ivory/68">{corridor.risk}</dd>
                        </div>
                        <div>
                          <dt className="text-[10px] uppercase tracking-[0.2em] text-ivory/38">PIKORUA Note</dt>
                          <dd className="mt-2 text-sm leading-6 text-ivory/68">{corridor.advisoryNote}</dd>
                        </div>
                      </dl>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-24" aria-labelledby="property-type-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div className="max-w-3xl">
                <p className="text-[10px] font-sans uppercase tracking-[0.25em] text-champagne-gold">
                  Property-Type Outlook
                </p>
                <h2 id="property-type-heading" className="mt-3 font-display text-[clamp(1.8rem,3vw,2.8rem)] font-light uppercase tracking-wider text-white">
                  Format Decides Liquidity, Diligence, And Management Effort
                </h2>
              </div>
              <Link
                href="/properties"
                className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-champagne-gold hover:text-antique-gold"
              >
                View Properties
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
              {REPORT.propertyTypes.map((type) => (
                <Link
                  key={type.name}
                  href={type.path}
                  className="group flex min-h-[260px] flex-col justify-between border border-white/[0.07] bg-soft-black/35 p-5 transition-colors hover:border-champagne-gold/35 hover:bg-soft-black/65"
                >
                  <h3 className="font-display text-xl font-light uppercase tracking-wider text-white">
                    {type.name}
                  </h3>
                  <p className="mt-8 text-sm leading-6 text-ivory/64">{type.outlook}</p>
                  <span className="mt-6 text-[11px] font-medium uppercase tracking-[0.18em] text-champagne-gold group-hover:text-antique-gold">
                    Open Guide
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-white/[0.06] bg-soft-black/24 py-16 lg:py-24" aria-labelledby="methodology-heading">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
            <div className="lg:col-span-5">
              <p className="text-[10px] font-sans uppercase tracking-[0.25em] text-champagne-gold">
                Methodology
              </p>
              <h2 id="methodology-heading" className="mt-3 font-display text-[clamp(1.8rem,3vw,2.7rem)] font-light uppercase tracking-wider text-white">
                Advisory-Led, Not Portal-Led
              </h2>
              <p className="mt-5 text-sm leading-7 text-ivory/62">
                The goal is to make PIKORUA citeable for informed market context while keeping legal, tax, and transaction claims properly qualified.
              </p>
            </div>
            <div className="lg:col-span-7">
              <ol className="space-y-4">
                {REPORT.methodology.map((item, index) => (
                  <li key={item} className="flex gap-4 border-b border-white/[0.07] pb-4 last:border-b-0">
                    <span className="pt-1 text-sm text-champagne-gold">{index + 1}</span>
                    <p className="text-sm leading-7 text-ivory/68">{item}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-24" aria-labelledby="quote-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-[10px] font-sans uppercase tracking-[0.25em] text-champagne-gold">
                Quote Bank
              </p>
              <h2 id="quote-heading" className="mt-3 font-display text-[clamp(1.8rem,3vw,2.8rem)] font-light uppercase tracking-wider text-white">
                Publishable Commentary
              </h2>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-3">
              {REPORT.quoteBank.map((item) => (
                <figure key={item.quote} className="border border-white/[0.07] bg-soft-black/35 p-6">
                  <Quote className="h-6 w-6 text-champagne-gold" />
                  <blockquote className="mt-5 text-base leading-8 text-ivory/78">
                    &ldquo;{item.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-6 text-xs uppercase tracking-[0.18em] text-ivory/45">
                    {item.speaker}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-white/[0.06] py-16 lg:py-20">
          <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
            <p className="text-[10px] font-sans uppercase tracking-[0.25em] text-champagne-gold">
              Citation Policy
            </p>
            <h2 className="mt-3 font-display text-[clamp(1.8rem,3vw,2.7rem)] font-light uppercase tracking-wider text-white">
              Cite PIKORUA Realty And Link Back To This Report
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-ivory/64">
              Journalists, analysts, and publishers may cite this report with attribution to {SITE_NAME}. For quote confirmation, media notes, or Ahmedabad luxury-property commentary, contact{" "}
              <a href={`mailto:${BUSINESS_EMAIL}`} className="text-champagne-gold hover:text-antique-gold">
                {BUSINESS_EMAIL}
              </a>
              .
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href={PRESS_ROOM_PATH}
                className="inline-flex min-h-[46px] items-center justify-center gap-2.5 rounded-sm border border-champagne-gold bg-champagne-gold px-6 py-3 text-xs font-medium uppercase tracking-[0.2em] text-lux-black transition-colors hover:bg-antique-gold"
              >
                Open Press Room
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/luxury-property-consultant-ahmedabad"
                className="inline-flex min-h-[46px] items-center justify-center rounded-sm border border-white/18 px-6 py-3 text-xs font-medium uppercase tracking-[0.2em] text-ivory transition-colors hover:border-champagne-gold hover:text-champagne-gold"
              >
                Luxury Consultancy
              </Link>
            </div>
          </div>
        </section>

        {/* Visible copy of the FAQPage schema above (markup must match the page). */}
        <section className="bg-lux-black py-16 lg:py-24 border-t border-white/[0.06]" aria-labelledby="report-faq-heading">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2
              id="report-faq-heading"
              className="mb-10 text-center font-display text-[clamp(1.5rem,3vw,2rem)] font-light uppercase tracking-wider text-white"
            >
              Frequently Asked Questions
            </h2>
            <FaqAccordion items={[...REPORT.faq]} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

