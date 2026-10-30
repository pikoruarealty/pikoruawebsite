"use client";

import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import type { ContentHubPage } from "@/lib/data/content-hubs";
import { parseComboSegments } from "@/lib/data/seo-dimensions";
import { buildWhatsAppUrl } from "@/lib/utils";
import { env } from "@/lib/env";
import {
  ArrowRight,
  TrendingUp,
  BookOpen,
  PhoneCall,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface ContentHubTemplateProps {
  page: ContentHubPage;
  relatedPages: ContentHubPage[];
}

// ─── Short title helper for clean breadcrumbs ─────────────────────────────────
function getShortTitle(h1: string): string {
  const clean = h1
    .replace(/\s*—.*$/, "")
    .replace(/\s*:\s*.*$/, "")
    .replace(/\s+in Ahmedabad.*$/i, "")
    .replace(/\s+2026.*$/i, "")
    .trim();
  return clean.length > 32 ? clean.slice(0, 30) + "…" : clean;
}

// ─── Breadcrumb builder ───────────────────────────────────────────────────────
function buildBreadcrumbs(page: ContentHubPage) {
  const prefixLabels: Record<string, string> = {
    compare: "Comparisons",
    invest: "Investment Guides",
    learn: "Property Education",
    "gift-city": "GIFT City",
  };
  return [
    { label: "Home", href: "/" },
    { label: prefixLabels[page.prefix] ?? page.prefix, href: `/${page.prefix}` },
    { label: getShortTitle(page.h1), href: page.href },
  ];
}

// ─── Clean eyebrow helper ──────────────────────────────────────────────────────
function cleanEyebrow(eyebrow: string): string {
  return eyebrow
    .replace(/\s*·\s*PIKORUA.*/i, "")
    .replace(/\s*·\s*Advisory.*/i, "")
    .trim();
}

// ─── Extract comparison labels from H1 ───────────────────────────────────────
function extractCompareLabels(h1: string): { a: string; b: string } {
  const vsMatch = h1.match(/^(.+?)\s+vs\.?\s+(.+?)(?:\s*[—–-]|:)/i);
  if (vsMatch) return { a: vsMatch[1].trim(), b: vsMatch[2].trim() };
  return { a: "Option A", b: "Option B" };
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN TEMPLATE
// ─────────────────────────────────────────────────────────────────────────────
export function ContentHubTemplate({ page, relatedPages }: ContentHubTemplateProps) {
  const breadcrumbs = buildBreadcrumbs(page);
  // Only link combo URLs the /p/ route can serve (some data hrefs use
  // segments such as "ready-to-move" that don't exist and 404).
  const listingHrefs = page.relatedListingHrefs.filter(
    (href) => !href.startsWith("/p/") || parseComboSegments(href.slice(3).split("/")) !== null
  );
  const compareLabels = extractCompareLabels(page.h1);
  const formattedEyebrow = cleanEyebrow(page.eyebrow);
  const whatsappUrl = buildWhatsAppUrl(
    env.WHATSAPP_NUMBER,
    `Hi PIKORUA, I read your guide on "${page.h1}" and would like to discuss my investment options.`
  );

  return (
    <>
      <Header alwaysSolid />
      <main id="main-content" className="bg-lux-black text-ivory min-h-screen">

        {/* ─── HERO ─── */}
        <section className="relative min-h-[60vh] overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24 border-b border-champagne-gold/15">
          <Image
            src={page.heroImage}
            alt={page.h1}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-lux-black via-lux-black/92 to-lux-black/55 sm:via-lux-black/88 sm:to-lux-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-lux-black via-lux-black/70 to-lux-black/30" />

          {/* Centered PIKORUA Container */}
          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            
            {/* Breadcrumbs */}
            <div className="mb-6">
              <Breadcrumb items={breadcrumbs} />
            </div>

            {/* PIKORUA Standard Eyebrow with gold accent rule */}
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-8 bg-champagne-gold/60" aria-hidden="true" />
              <p className="font-sans text-[11px] uppercase tracking-[0.25em] text-champagne-gold font-medium">
                {formattedEyebrow}
              </p>
            </div>

            {/* PIKORUA Standard Display H1 Header */}
            <h1 className="font-display text-[clamp(2rem,4.8vw,4rem)] font-light uppercase tracking-wider text-ivory leading-[1.08] mb-6 max-w-4xl">
              {page.h1}
            </h1>

            {/* Intro Lead */}
            <p className="font-sans text-base sm:text-lg text-ivory/75 leading-relaxed max-w-3xl mb-8">
              {page.intro}
            </p>

            {/* Meta bar */}
            <div className="flex items-center gap-3 font-sans text-xs text-ivory/50 border-t border-white/10 pt-5">
              <span className="font-medium text-champagne-gold uppercase tracking-wider text-[11px]">
                PIKORUA Research
              </span>
              <span>•</span>
              <time dateTime={page.publishedAt}>
                Updated {new Date(page.publishedAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
              </time>
            </div>

          </div>
        </section>

        {/* ─── PAGE BODY CONTAINER (Centered mx-auto max-w-5xl) ─── */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20 space-y-16 sm:space-y-20">

          {/* ─── Market Signals Ticker ─── */}
          {page.marketSignals && page.marketSignals.length > 0 && (
            <div className="rounded-sm border border-champagne-gold/20 bg-lux-black/60 p-5 sm:p-6 backdrop-blur-md">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={16} className="text-champagne-gold" aria-hidden="true" />
                <span className="font-sans text-[11px] uppercase tracking-[0.2em] font-semibold text-champagne-gold">
                  Market Data Signals
                </span>
              </div>
              <div className="flex flex-wrap gap-4 sm:gap-6">
                {page.marketSignals.map((sig, i) => (
                  <div key={i} className="flex items-center gap-2 font-sans text-xs sm:text-sm text-ivory/80">
                    <span className="h-1.5 w-1.5 rounded-full bg-champagne-gold shrink-0" aria-hidden="true" />
                    <span>{sig}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── Executive Summary Card ─── */}
          <div className="rounded-sm border border-champagne-gold/25 bg-gradient-to-br from-soft-black/90 to-lux-black/95 overflow-hidden shadow-2xl">
            <div className="flex items-center gap-3 px-6 py-5 bg-champagne-gold/[0.06] border-b border-champagne-gold/20">
              <div className="flex items-center justify-center h-8 w-8 rounded-sm bg-champagne-gold/15 border border-champagne-gold/30 shrink-0">
                <Sparkles size={16} className="text-champagne-gold" aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-display text-lg sm:text-xl uppercase tracking-wider text-ivory font-light">
                  Executive Summary &amp; Key Takeaways
                </h2>
                <p className="font-sans text-xs text-champagne-gold/80 mt-0.5">
                  Core insights synthesized by PIKORUA Advisory
                </p>
              </div>
            </div>
            <ul className="divide-y divide-white/[0.06]" role="list">
              {page.keyTakeaways.map((item, i) => (
                <li key={i} className="flex gap-4 sm:gap-6 p-6 sm:p-8 hover:bg-white/[0.015] transition-colors">
                  <span className="font-display text-2xl font-light text-champagne-gold/40 shrink-0 min-w-[2ch]">
                    0{i + 1}
                  </span>
                  <p className="font-sans text-sm sm:text-base text-ivory/85 leading-relaxed">
                    {item}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* ─── Side-by-Side Comparison Table ─── */}
          {page.comparisonTable && page.comparisonTable.length > 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl uppercase tracking-wider text-ivory font-light">
                  Side-by-Side Comparison
                </h2>
                <p className="font-sans text-xs sm:text-sm text-ivory/60 mt-1">
                  Detailed evaluation across key investment metrics
                </p>
              </div>
              <div className="overflow-x-auto rounded-sm border border-white/10 bg-soft-black/40">
                <table className="w-full text-left font-sans text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02]">
                      <th className="p-4 sm:p-5 text-xs font-semibold uppercase tracking-[0.15em] text-ivory/50 w-[30%]">
                        Metric
                      </th>
                      <th className="p-4 sm:p-5 text-xs font-semibold uppercase tracking-[0.15em] text-champagne-gold bg-champagne-gold/[0.06] w-[35%]">
                        {compareLabels.a}
                      </th>
                      <th className="p-4 sm:p-5 text-xs font-semibold uppercase tracking-[0.15em] text-ivory/70 w-[35%]">
                        {compareLabels.b}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {page.comparisonTable.map((row, i) => (
                      <tr key={i} className="hover:bg-white/[0.015] transition-colors">
                        <td className="p-4 sm:p-5 text-xs sm:text-sm font-medium text-ivory/65">
                          {row.label}
                        </td>
                        <td className="p-4 sm:p-5 text-xs sm:text-sm text-ivory/90 bg-champagne-gold/[0.02]">
                          {row.a}
                        </td>
                        <td className="p-4 sm:p-5 text-xs sm:text-sm text-ivory/70">
                          {row.b}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── Main Editorial Article Body ─── */}
          <article className="mx-auto max-w-4xl space-y-12 sm:space-y-16">
            {page.sections.map((section, i) => (
              <section key={i} className="space-y-5">
                <h2 className="font-display text-2xl sm:text-3xl font-light uppercase tracking-wider text-ivory border-b border-champagne-gold/30 pb-3">
                  {section.heading}
                </h2>
                <div className="space-y-5 font-sans text-base sm:text-lg text-ivory/75 leading-[1.85]">
                  {section.body.map((para, j) => (
                    <p key={j}>{para}</p>
                  ))}
                </div>
              </section>
            ))}
          </article>

          {/* ─── Matching Shortlists ─── */}
          {listingHrefs.length > 0 && (
            <div className="rounded-sm border border-white/10 bg-soft-black/30 p-6 sm:p-8 space-y-4">
              <div>
                <h2 className="font-display text-xl sm:text-2xl uppercase tracking-wider text-ivory font-light">
                  Curated Property Shortlists
                </h2>
                <p className="font-sans text-xs sm:text-sm text-ivory/60 mt-1">
                  Explore matching properties in PIKORUA&rsquo;s verified database
                </p>
              </div>
              <div className="flex flex-wrap gap-2.5 pt-2">
                {listingHrefs.map((href) => {
                  const label = href.replace("/p/", "").split("/").map((s) => s.replace(/-/g, " ")).join(" › ");
                  return (
                    <Link
                      key={href}
                      href={href}
                      className="inline-flex items-center gap-2 rounded-full border border-champagne-gold/30 bg-champagne-gold/10 px-4 py-2 font-sans text-xs uppercase tracking-wider text-champagne-gold transition-colors hover:bg-champagne-gold/20 hover:border-champagne-gold"
                    >
                      <ChevronRight size={13} aria-hidden="true" />
                      <span>{label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── FAQ Section ─── */}
          <div className="space-y-6 pt-4 border-t border-white/10">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl uppercase tracking-wider text-ivory font-light">
                Frequently Asked Questions
              </h2>
              <p className="font-sans text-xs sm:text-sm text-ivory/60 mt-1">
                Direct answers from our real estate advisory team
              </p>
            </div>
            <FaqAccordion items={page.faqs} />
          </div>

          {/* ─── Related Guides ─── */}
          {relatedPages.length > 0 && (
            <div className="space-y-6 pt-6 border-t border-white/10">
              <div className="flex items-center gap-2">
                <BookOpen size={20} className="text-champagne-gold" aria-hidden="true" />
                <h2 className="font-display text-2xl uppercase tracking-wider text-ivory font-light">
                  Related Market Intelligence
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedPages.map((rPage) => (
                  <Link
                    key={rPage.slug}
                    href={rPage.href}
                    className="group flex flex-col rounded-sm border border-white/10 bg-soft-black overflow-hidden transition-all duration-300 hover:border-champagne-gold/40 hover:-translate-y-1"
                  >
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-lux-black/50">
                      <Image
                        src={rPage.heroImage}
                        alt={rPage.h1}
                        fill
                        sizes="(max-width:640px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-lux-black via-transparent to-transparent opacity-80" />
                    </div>
                    <div className="p-5 flex flex-col flex-1 justify-between gap-3">
                      <div>
                        <p className="font-sans text-[9px] uppercase tracking-[0.2em] text-champagne-gold mb-1.5">
                          {cleanEyebrow(rPage.eyebrow)}
                        </p>
                        <h3 className="font-display text-sm font-normal uppercase tracking-wide text-ivory group-hover:text-champagne-gold transition-colors line-clamp-2">
                          {rPage.h1}
                        </h3>
                      </div>
                      <span className="inline-flex items-center gap-1.5 font-sans text-xs uppercase tracking-wider text-champagne-gold/70 group-hover:text-champagne-gold">
                        Read Guide <ArrowRight size={12} aria-hidden="true" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ─── ADVISORY CTA (Matches PIKORUA site footer CTA style) ─── */}
        <section className="border-t border-champagne-gold/20 bg-gradient-to-b from-lux-black via-soft-black to-lux-black py-16 sm:py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <p className="font-sans text-[10px] uppercase tracking-[0.28em] text-champagne-gold font-medium">
              PIKORUA Private Advisory
            </p>
            <h2 className="font-display text-2xl sm:text-4xl uppercase tracking-wider text-ivory font-light max-w-2xl mx-auto">
              Tailored Real Estate Advisory for HNIs &amp; NRIs
            </h2>
            <p className="font-sans text-sm sm:text-base text-ivory/65 leading-relaxed max-w-xl mx-auto">
              Our team provides confidential, high-touch advisory for premium property acquisitions in Ahmedabad — from off-market search to title &amp; FEMA compliance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-sm bg-champagne-gold px-8 py-3.5 font-sans text-xs uppercase tracking-[0.18em] text-lux-black font-medium transition-all hover:bg-antique-gold"
              >
                <PhoneCall size={16} aria-hidden="true" />
                WhatsApp Advisory
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-white/20 bg-white/[0.03] px-8 py-3.5 font-sans text-xs uppercase tracking-[0.18em] text-ivory transition-all hover:border-champagne-gold/50 hover:text-champagne-gold"
              >
                Schedule Private Consultation <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
