"use client";

import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import type { ProgrammaticPage } from "@/lib/data/combo-content-engine";
import type { RelatedLinksCluster } from "@/lib/data/combo-linker";
import type { StaticProperty } from "@/lib/data/properties";
import { RESIDENTIAL_CATEGORY_LABELS } from "@/types";
import { buildWhatsAppUrl } from "@/lib/utils";
import { env } from "@/lib/env";
import {
  ArrowRight,
  MapPin,
  TrendingUp,
  Banknote,
  Building2,
  PhoneCall,
  ChevronRight,
} from "lucide-react";

interface ProgrammaticPageTemplateProps {
  page: ProgrammaticPage;
  properties: StaticProperty[];
  relatedLinks: RelatedLinksCluster[];
  /** Parent /p/ URLs that are indexable; other parent /p/ URLs are not linked. */
  linkableParentHrefs?: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTER PILL — shows active dimension with link to remove it
// ─────────────────────────────────────────────────────────────────────────────
function FilterPill({ label, href, nofollow }: { label: string; href: string; nofollow?: boolean }) {
  return (
    <Link
      href={href}
      rel={nofollow ? "nofollow" : undefined}
      className="filter-pill"
      aria-label={`Remove filter: ${label}`}
    >
      {label}
      <span className="filter-pill__remove" aria-hidden="true">×</span>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROPERTY CARD (compact)
// ─────────────────────────────────────────────────────────────────────────────
function PropertyCard({ property }: { property: StaticProperty }) {
  const href = `/properties/${property.slug}`;
  const categoryLabel =
    RESIDENTIAL_CATEGORY_LABELS[
      property.category as keyof typeof RESIDENTIAL_CATEGORY_LABELS
    ] ?? property.category;

  return (
    <Link href={href} className="prog-property-card group" aria-label={`View ${property.configuration} at ${property.locationLabel}`}>
      <div className="prog-property-card__image">
        {property.images?.[0] && (
          <Image
            src={property.images[0]}
            alt={`${property.configuration} in ${property.locationLabel}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
        <span className="prog-property-card__badge">{categoryLabel}</span>
      </div>
      <div className="prog-property-card__body">
        <p className="prog-property-card__config">{property.configuration}</p>
        <p className="prog-property-card__location">
          <MapPin size={13} aria-hidden="true" />
          {property.locationLabel}
        </p>
        {property.price && (
          <p className="prog-property-card__price">{property.price}</p>
        )}
        <span className="prog-property-card__cta">
          View details <ArrowRight size={13} aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PRICE INSIGHTS STRIP
// ─────────────────────────────────────────────────────────────────────────────
function PriceInsightsStrip({ page }: { page: ProgrammaticPage }) {
  const loc = page.combo.location!;
  const bhk = page.combo.bhk;
  const type = page.combo.type;

  const insights = [
    {
      icon: Banknote,
      label: "Price Range",
      value: loc.priceContext,
    },
    {
      icon: TrendingUp,
      label: "Market Trend",
      value:
        loc.corridor === "west" || loc.corridor === "sg-highway"
          ? "7–12% p.a. appreciation"
          : loc.corridor === "gift-city"
          ? "8–14% p.a. GIFT City premium"
          : "6–9% p.a. growth",
    },
    ...(bhk && type?.bhkApplicable
      ? [{ icon: Building2, label: "Carpet Area", value: bhk.sizeRangeResidential }]
      : []),
    {
      icon: MapPin,
      label: "Area",
      value: loc.area,
    },
  ];

  return (
    <div className="prog-insights-strip" role="region" aria-label="Price insights">
      {insights.map(({ icon: Icon, label, value }) => (
        <div key={label} className="prog-insights-strip__item">
          <Icon size={20} className="prog-insights-strip__icon" aria-hidden="true" />
          <div>
            <p className="prog-insights-strip__label">{label}</p>
            <p className="prog-insights-strip__value">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RELATED LINKS CLUSTER
// ─────────────────────────────────────────────────────────────────────────────
function RelatedLinksSection({ clusters }: { clusters: RelatedLinksCluster[] }) {
  if (clusters.length === 0) return null;
  return (
    <section className="prog-related" aria-labelledby="related-heading">
      <h2 id="related-heading" className="prog-related__heading">
        Explore Related Listings
      </h2>
      <div className="prog-related__clusters">
        {clusters.map((cluster) => (
          <div key={cluster.heading} className="prog-related__cluster">
            <h3 className="prog-related__cluster-heading">{cluster.heading}</h3>
            <ul className="prog-related__list" role="list">
              {cluster.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="prog-related__link">
                    <ChevronRight size={14} className="prog-related__chevron" aria-hidden="true" />
                    <span>
                      <strong>{link.label}</strong>
                      {link.description && (
                        <span className="prog-related__desc"> — {link.description}</span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NO-RESULTS CTA
// ─────────────────────────────────────────────────────────────────────────────
function NoResultsCta({ page }: { page: ProgrammaticPage }) {
  const loc = page.combo.location!;
  const type = page.combo.type;
  const whatsappUrl = buildWhatsAppUrl(
    env.WHATSAPP_NUMBER,
    `Hi PIKORUA, I am looking for ${type ? type.pluralLabel.toLowerCase() : "property"} in ${loc.label}. Please share available options.`
  );

  return (
    <div className="prog-no-results" role="status" aria-live="polite">
      <Building2 size={48} className="prog-no-results__icon" aria-hidden="true" />
      <h2 className="prog-no-results__heading">
        No listings currently available
      </h2>
      <p className="prog-no-results__body">
        Our portal shows verified, RERA-compliant inventory only. New
        {type ? ` ${type.pluralLabel.toLowerCase()}` : " properties"} in{" "}
        {loc.label} arrive regularly — contact us for an off-market shortlist.
      </p>
      <div className="prog-no-results__actions">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="prog-no-results__whatsapp"
          aria-label="WhatsApp PIKORUA Realty"
        >
          <PhoneCall size={18} aria-hidden="true" />
          WhatsApp for Inventory
        </a>
        <Link href="/contact" className="prog-no-results__contact">
          Send an Enquiry
        </Link>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVE FILTER BAR
// ─────────────────────────────────────────────────────────────────────────────
function ActiveFilterBar({ page, linkable }: { page: ProgrammaticPage; linkable: (href: string) => boolean }) {
  const { location, type, bhk, budget, intent } = page.combo;

  // Build parent hrefs by dropping trailing segments
  const segments: string[] = [];
  if (location) segments.push(location.slug);
  const locHref = `/p/${segments.join("/")}`;

  const typeSegments = type ? [...segments, type.slug] : segments;
  const typeHref = `/p/${typeSegments.join("/")}`;

  const bhkSegments = bhk ? [...typeSegments, bhk.slug] : typeSegments;
  const bhkHref = `/p/${bhkSegments.join("/")}`;

  const budgetSegments = budget ? [...bhkSegments, budget.slug] : bhkSegments;
  const budgetHref = `/p/${budgetSegments.join("/")}`;

  const pills = [
    location && { label: location.label, href: "/p" },
    type && { label: type.pluralLabel, href: locHref },
    bhk && type?.bhkApplicable && { label: bhk.label, href: typeHref },
    budget && { label: budget.label, href: bhkHref },
    intent && { label: intent.label, href: budgetHref },
  ].filter(Boolean) as { label: string; href: string }[];

  if (pills.length === 0) return null;

  return (
    <nav
      className="prog-filter-bar"
      aria-label="Active search filters"
    >
      <span className="prog-filter-bar__label">Filtered by:</span>
      <div className="prog-filter-bar__pills" role="list">
        {pills.map((pill) => (
          <div role="listitem" key={pill.label}>
            <FilterPill label={pill.label} href={pill.href} nofollow={!linkable(pill.href)} />
          </div>
        ))}
      </div>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BREADCRUMB ITEMS
// ─────────────────────────────────────────────────────────────────────────────
function buildBreadcrumbs(page: ProgrammaticPage, linkable: (href: string) => boolean) {
  const { location, type, bhk, budget, intent } = page.combo;
  const items: { label: string; href?: string }[] = [
    { label: "Home", href: "/" },
    { label: "Properties", href: "/properties" },
    { label: "Search", href: "/p" },
  ];

  if (location) items.push({ label: location.label, href: `/p/${location.slug}` });
  if (type) items.push({ label: type.pluralLabel, href: `/p/${location!.slug}/${type.slug}` });
  if (bhk && type?.bhkApplicable) {
    items.push({ label: bhk.label, href: `/p/${location!.slug}/${type!.slug}/${bhk.slug}` });
  }
  if (budget) {
    const prev = [location!.slug, type?.slug, bhk?.slug].filter(Boolean);
    items.push({ label: budget.label, href: `/p/${[...prev, budget.slug].join("/")}` });
  }
  if (intent) items.push({ label: intent.label, href: page.href });

  // A parent combo page that is noindex is shown as plain text, not a link.
  return items.map((item) => (item.href && !linkable(item.href) ? { label: item.label } : item));
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN TEMPLATE
// ─────────────────────────────────────────────────────────────────────────────
export function ProgrammaticPageTemplate({
  page,
  properties,
  relatedLinks,
  linkableParentHrefs = [],
}: ProgrammaticPageTemplateProps) {
  // Non-combo links (/, /properties, /p) and this page itself are always fine.
  const linkable = (href: string) =>
    !href.startsWith("/p/") || href === page.href || linkableParentHrefs.includes(href);
  const breadcrumbs = buildBreadcrumbs(page, linkable);
  const whatsappUrl = buildWhatsAppUrl(
    env.WHATSAPP_NUMBER,
    `Hi PIKORUA, I found your listing for ${page.h1}. I am interested in more details.`
  );

  return (
    <>
      <Header alwaysSolid />
      <main id="main-content" className="bg-lux-black text-ivory min-h-screen">
        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section className="relative min-h-[55vh] overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24 border-b border-champagne-gold/15" aria-labelledby="prog-h1">
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

          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <Breadcrumb items={breadcrumbs} />
            </div>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-8 bg-champagne-gold/60" aria-hidden="true" />
              <p className="font-sans text-[11px] uppercase tracking-[0.25em] text-champagne-gold font-medium">
                {page.eyebrow}
              </p>
            </div>

            <h1 id="prog-h1" className="font-display text-[clamp(2rem,4.5vw,3.8rem)] font-light uppercase tracking-wider text-ivory leading-[1.08] mb-6 max-w-4xl">
              {page.h1}
            </h1>
            <p className="font-sans text-base sm:text-lg text-ivory/75 leading-relaxed max-w-3xl mb-8">
              {page.intro}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[48px] items-center justify-center rounded-sm bg-champagne-gold px-6 py-3 font-sans text-xs uppercase tracking-[0.16em] text-lux-black transition-colors hover:bg-antique-gold"
                aria-label="WhatsApp PIKORUA for this search"
              >
                <PhoneCall size={16} className="mr-2" aria-hidden="true" />
                Shortlist on WhatsApp
              </a>
              <Link
                href="/contact"
                className="inline-flex min-h-[48px] items-center justify-center rounded-sm border border-white/20 bg-white/[0.03] px-6 py-3 font-sans text-xs uppercase tracking-[0.16em] text-ivory transition-colors hover:border-champagne-gold/50 hover:text-champagne-gold"
              >
                Send Enquiry
              </Link>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-12">
          {/* ── Active Filters ───────────────────────────────────────── */}
          <ActiveFilterBar page={page} linkable={linkable} />

          {/* ── Price Insights Strip ─────────────────────────────────── */}
          <PriceInsightsStrip page={page} />

          {/* ── Listings ─────────────────────────────────────────────── */}
          <section className="space-y-6" aria-labelledby="listings-heading">
            <h2 id="listings-heading" className="font-display text-2xl uppercase tracking-wider text-ivory font-light border-b border-white/10 pb-3">
              {properties.length > 0
                ? `${properties.length} Verified ${page.combo.type?.pluralLabel ?? "Properties"} in ${page.combo.location?.label}`
                : `${page.combo.type?.pluralLabel ?? "Properties"} in ${page.combo.location?.label}`}
            </h2>

            {properties.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((p) => (
                  <PropertyCard key={p.slug} property={p} />
                ))}
              </div>
            ) : (
              <NoResultsCta page={page} />
            )}
          </section>

          {/* ── Market Signals ───────────────────────────────────────── */}
          <section className="space-y-4" aria-labelledby="signals-heading">
            <h2 id="signals-heading" className="font-display text-2xl uppercase tracking-wider text-ivory font-light">
              Market Intelligence
            </h2>
            <ul className="grid grid-cols-1 gap-3" role="list">
              {page.marketSignals.map((signal, i) => (
                <li key={i} className="flex items-start gap-3 rounded-sm border border-white/10 bg-soft-black/40 p-4 font-sans text-sm text-ivory/80">
                  <TrendingUp size={18} className="text-champagne-gold shrink-0 mt-0.5" aria-hidden="true" />
                  <p>{signal}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* ── Body Content ─────────────────────────────────────────── */}
          <section className="space-y-6 pt-4 border-t border-white/10" aria-labelledby="body-heading">
            <h2 id="body-heading" className="font-display text-2xl sm:text-3xl uppercase tracking-wider text-ivory font-light">
              {`${page.combo.type?.pluralLabel ?? "Property"} Guide — ${page.combo.location?.label}`}
            </h2>
            <div className="mx-auto max-w-4xl space-y-5 font-sans text-base text-ivory/75 leading-relaxed">
              {page.bodyContent.map((para, i) => {
                if (para.startsWith("### ")) {
                  return (
                    <h3 key={i} className="font-display text-xl uppercase tracking-wider text-champagne-gold pt-3">
                      {para.replace("### ", "")}
                    </h3>
                  );
                }
                return <p key={i}>{para}</p>;
              })}
            </div>
          </section>

          {/* ── Ideal For ────────────────────────────────────────────── */}
          <section className="space-y-4" aria-labelledby="ideal-heading">
            <h2 id="ideal-heading" className="font-display text-2xl uppercase tracking-wider text-ivory font-light">
              Who Is This For?
            </h2>
            <ul className="grid grid-cols-1 gap-2.5" role="list">
              {page.idealFor.map((item, i) => (
                <li key={i} className="flex items-start gap-3 font-sans text-sm text-ivory/80">
                  <span className="text-champagne-gold font-bold shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* ── FAQs ─────────────────────────────────────────────────── */}
          <section className="space-y-6 pt-4 border-t border-white/10" aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="font-display text-2xl uppercase tracking-wider text-ivory font-light">
              Frequently Asked Questions
            </h2>
            <FaqAccordion items={page.faqs} />
          </section>

          {/* ── Related Internal Links ───────────────────────────────── */}
          <div className="pt-4 border-t border-white/10">
            <RelatedLinksSection clusters={relatedLinks} />
          </div>
        </div>

        {/* ── Bottom CTA ───────────────────────────────────────────── */}
        <section className="border-t border-champagne-gold/20 bg-gradient-to-b from-lux-black via-soft-black to-lux-black py-16 sm:py-20" aria-labelledby="bottom-cta-heading">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <h2 id="bottom-cta-heading" className="font-display text-2xl sm:text-4xl uppercase tracking-wider text-ivory font-light max-w-2xl mx-auto">
              Need a curated shortlist?
            </h2>
            <p className="font-sans text-sm sm:text-base text-ivory/65 leading-relaxed max-w-xl mx-auto">
              PIKORUA Realty&rsquo;s advisory team maintains private access to
              off-market inventory in {page.combo.location?.label}. Share your
              requirements — we respond within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-sm bg-champagne-gold px-8 py-3.5 font-sans text-xs uppercase tracking-[0.18em] text-lux-black font-medium transition-all hover:bg-antique-gold"
              >
                <PhoneCall size={16} aria-hidden="true" />
                WhatsApp PIKORUA
              </a>
              <Link href="/contact" className="inline-flex items-center justify-center gap-2 rounded-sm border border-white/20 bg-white/[0.03] px-8 py-3.5 font-sans text-xs uppercase tracking-[0.18em] text-ivory transition-all hover:border-champagne-gold/50 hover:text-champagne-gold">
                Send Enquiry <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
