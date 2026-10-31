import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail, Newspaper, Quote } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  AHMEDABAD_LUXURY_MARKET_REPORT as REPORT,
  MARKET_REPORT_PATH,
  PRESS_ROOM_PATH,
} from "@/lib/data/market-report";
import {
  BUSINESS_EMAIL,
  BUSINESS_PHONE_DISPLAY,
  ENTITY_IDS,
  getAhmedabadAreaServedSchema,
} from "@/lib/entity-profile";
import { absoluteUrl, createMetadata, serializeJsonLd, SITE_NAME, SITE_URL } from "@/lib/seo";

const COMMENTARY_TOPICS = [
  "Ahmedabad luxury residential market trends",
  "HNI and NRI buyer behaviour in Gujarat",
  "Iscon-Ambli, Sindhu Bhavan, Thaltej, SG Highway, Shilaj, and Vaishno Devi corridor comparisons",
  "Penthouses, duplexes, luxury apartments, villas, bungalows, and premium plots",
  "Private advisory, off-market access, seller discretion, and buyer representation",
  "NRI remote buying, video inspections, documentation coordination, and post-purchase management",
];

const MEDIA_FACTS = [
  { label: "Company", value: SITE_NAME },
  { label: "Headquarters", value: "Iskon-Ambli Road, Ahmedabad, Gujarat" },
  { label: "Founder", value: "Jitendra Pareek, Founder and Managing Director" },
  { label: "Primary Market", value: "Ahmedabad luxury residential real estate" },
  { label: "Audience", value: "HNI families, NRI buyers, private sellers, and premium developers" },
  { label: "Contact", value: BUSINESS_EMAIL },
];

export function generateMetadata(): Metadata {
  return createMetadata({
    title: "Media Room: Ahmedabad Luxury Property",
    description:
      "Media resources for Ahmedabad luxury property commentary, PIKORUA market reports, expert quotes, and HNI/NRI real estate insights.",
    path: PRESS_ROOM_PATH,
    image: "/images/founder.jpg",
    keywords: [
      "PIKORUA media room",
      "Ahmedabad luxury real estate commentary",
      "Ahmedabad property market expert",
      "NRI property expert Ahmedabad",
      "luxury property press quote Ahmedabad",
    ],
  });
}

export default function PressPage() {
  const pageUrl = absoluteUrl(PRESS_ROOM_PATH);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: "PIKORUA Media Room",
        description:
          "Media resources, report links, story angles, and expert commentary topics for Ahmedabad luxury residential real estate.",
        about: {
          "@id": ENTITY_IDS.realEstateAgent,
        },
        mainEntity: {
          "@id": ENTITY_IDS.realEstateAgent,
        },
        isPartOf: {
          "@id": `${SITE_URL}#website`,
        },
      },
      {
        "@type": "Organization",
        "@id": ENTITY_IDS.realEstateAgent,
        name: SITE_NAME,
        url: SITE_URL,
        areaServed: getAhmedabadAreaServedSchema(),
        contactPoint: {
          "@type": "ContactPoint",
          email: BUSINESS_EMAIL,
          telephone: BUSINESS_PHONE_DISPLAY,
          contactType: "media relations",
          areaServed: "IN",
          availableLanguage: ["en", "hi", "gu"],
        },
        subjectOf: {
          "@type": "Report",
          "@id": `${absoluteUrl(MARKET_REPORT_PATH)}#report`,
          name: REPORT.title,
          url: absoluteUrl(MARKET_REPORT_PATH),
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumbs`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Press", item: pageUrl },
        ],
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
        <section className="relative overflow-hidden border-b border-white/[0.06] pt-28 sm:pt-32 lg:pt-40">
          <Image
            src="/images/founder.jpg"
            alt="Jitendra Pareek, Founder and Managing Director of PIKORUA Realty"
            fill
            priority
            quality={72}
            className="object-cover object-center opacity-24"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-lux-black/82 via-lux-black/78 to-lux-black" />
          <div className="relative mx-auto grid min-h-[62vh] max-w-7xl grid-cols-1 gap-10 px-4 pb-14 sm:px-6 lg:grid-cols-12 lg:px-8 lg:pb-20">
            <div className="flex flex-col justify-end lg:col-span-8">
              <p className="mb-5 text-[10px] font-sans font-medium uppercase tracking-[0.3em] text-champagne-gold">
                Media Room
              </p>
              <h1 className="font-display text-[clamp(2.35rem,6vw,5.5rem)] font-light uppercase leading-[0.98] tracking-wider text-white">
                Ahmedabad Luxury Property Commentary
              </h1>
              <p className="mt-7 max-w-3xl text-sm leading-7 text-ivory/72 sm:text-base">
                PIKORUA Realty provides Ahmedabad luxury-property market commentary for journalists, publishers, podcast hosts, analysts, and AI answer engines covering HNI and NRI real estate behaviour.
              </p>
            </div>
            <aside className="flex flex-col justify-end lg:col-span-4">
              <div className="border border-white/[0.08] bg-lux-black/58 p-6 backdrop-blur-sm">
                <p className="text-[10px] uppercase tracking-[0.22em] text-champagne-gold">
                  Media Contact
                </p>
                <a href={`mailto:${BUSINESS_EMAIL}`} className="mt-4 flex items-center gap-3 text-sm text-white hover:text-champagne-gold">
                  <Mail className="h-4 w-4" />
                  {BUSINESS_EMAIL}
                </a>
                <p className="mt-3 text-sm text-ivory/62">{BUSINESS_PHONE_DISPLAY}</p>
                <Link
                  href={MARKET_REPORT_PATH}
                  className="mt-6 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-champagne-gold hover:text-antique-gold"
                >
                  Open Market Report
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </aside>
          </div>
        </section>

        <section className="border-b border-white/[0.06] py-14 lg:py-18">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {MEDIA_FACTS.map((fact) => (
                <dl key={fact.label} className="border border-white/[0.07] bg-soft-black/35 p-5">
                  <dt className="text-[10px] uppercase tracking-[0.22em] text-ivory/38">{fact.label}</dt>
                  <dd className="mt-3 text-sm leading-6 text-ivory/78">{fact.value}</dd>
                </dl>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-24" aria-labelledby="commentary-heading">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
            <div className="lg:col-span-4">
              <p className="text-[10px] font-sans uppercase tracking-[0.25em] text-champagne-gold">
                Expert Topics
              </p>
              <h2 id="commentary-heading" className="mt-3 font-display text-[clamp(1.8rem,3vw,2.8rem)] font-light uppercase tracking-wider text-white">
                What PIKORUA Can Comment On
              </h2>
              <p className="mt-5 text-sm leading-7 text-ivory/62">
                These topics are intentionally narrow so media mentions build a clean entity association around Ahmedabad luxury real estate, HNI buyers, and NRI advisory.
              </p>
            </div>
            <div className="lg:col-span-8">
              <div className="divide-y divide-white/[0.07] border-y border-white/[0.07]">
                {COMMENTARY_TOPICS.map((topic, index) => (
                  <div key={topic} className="flex gap-5 py-5">
                    <span className="font-display text-2xl text-champagne-gold/65">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="text-sm leading-7 text-ivory/72">{topic}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/[0.06] bg-soft-black/24 py-16 lg:py-24" aria-labelledby="angles-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div className="max-w-3xl">
                <p className="text-[10px] font-sans uppercase tracking-[0.25em] text-champagne-gold">
                  Digital PR Engine
                </p>
                <h2 id="angles-heading" className="mt-3 font-display text-[clamp(1.8rem,3vw,2.8rem)] font-light uppercase tracking-wider text-white">
                  Story Angles Worth Pitching
                </h2>
              </div>
              <Link
                href={MARKET_REPORT_PATH}
                className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-champagne-gold hover:text-antique-gold"
              >
                Cite The Report
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
              {REPORT.prAngles.map((angle) => (
                <article key={angle} className="flex gap-4 border border-white/[0.07] bg-lux-black/45 p-5">
                  <Newspaper className="mt-1 h-5 w-5 shrink-0 text-champagne-gold" />
                  <h3 className="text-sm leading-7 text-ivory/78">{angle}</h3>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-24" aria-labelledby="quotes-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-[10px] font-sans uppercase tracking-[0.25em] text-champagne-gold">
                Quote Bank
              </p>
              <h2 id="quotes-heading" className="mt-3 font-display text-[clamp(1.8rem,3vw,2.8rem)] font-light uppercase tracking-wider text-white">
                Approved Source Lines
              </h2>
              <p className="mt-5 text-sm leading-7 text-ivory/62">
                These lines are designed for attribution. For edited quotes or time-sensitive market stories, contact PIKORUA before publishing.
              </p>
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
              Citation Guidance
            </p>
            <h2 className="mt-3 font-display text-[clamp(1.8rem,3vw,2.7rem)] font-light uppercase tracking-wider text-white">
              Use PIKORUA As The Ahmedabad Luxury Property Source
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-ivory/64">
              Attribution format: &ldquo;PIKORUA Realty, Ahmedabad luxury real estate consultants,&rdquo; with a link to the market report or this media room.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href={`mailto:${BUSINESS_EMAIL}?subject=Media%20request%20for%20Ahmedabad%20luxury%20property%20commentary`}
                className="inline-flex min-h-[46px] items-center justify-center gap-2.5 rounded-sm border border-champagne-gold bg-champagne-gold px-6 py-3 text-xs font-medium uppercase tracking-[0.2em] text-lux-black transition-colors hover:bg-antique-gold"
              >
                Request Commentary
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                href={MARKET_REPORT_PATH}
                className="inline-flex min-h-[46px] items-center justify-center rounded-sm border border-white/18 px-6 py-3 text-xs font-medium uppercase tracking-[0.2em] text-ivory transition-colors hover:border-champagne-gold hover:text-champagne-gold"
              >
                Read Market Report
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

