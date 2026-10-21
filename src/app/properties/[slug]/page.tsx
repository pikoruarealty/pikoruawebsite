import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PropertyGallery } from "@/components/property/PropertyGallery";
import { PropertyEnquiryForm } from "@/components/property/PropertyEnquiryForm";
import { STATIC_PROPERTIES } from "@/lib/data/properties";
import { getNriPropertyAdvisory } from "@/lib/data/nri-property-advisory";
import { getLocationLandingPage } from "@/lib/data/geo";
import { getSupabasePropertyBySlug, getSupabaseAllPropertySlugs } from "@/lib/db/queries";
import { PROPERTY_STATUS_LABELS, RESIDENTIAL_CATEGORY_LABELS } from "@/types";
import { ArrowLeft, ArrowRight, Building2, CalendarCheck, IndianRupee, MapPin, Ruler, ShieldCheck } from "lucide-react";
import { renderFormattedText } from "@/lib/utils";
import { ENTITY_IDS } from "@/lib/entity-profile";
import { absoluteUrl, createMetadata, generatePropertySchema, serializeJsonLd, SITE_URL } from "@/lib/seo";

// Note: LOCATION_COORDINATES and getResidenceSchemaType have been moved to @/lib/seo
// and are used via generatePropertySchema(). This keeps schema logic centralised.

interface PropertyPageProps {
  params: Promise<{ slug: string }>;
}

// Parses "₹5.50 Cr" or "₹5.50 Cr – ₹8.25 Cr" into INR values for structured
// data. Returns null on anything that doesn't match — we'd rather omit a
// numeric price from schema than emit one that doesn't match the visible copy.
function parsePriceCrore(priceStr?: string): { low: number; high: number } | null {
  if (!priceStr) return null;
  const match = priceStr.match(/₹\s*([\d.]+)\s*Cr(?:\s*[–-]\s*₹?\s*([\d.]+)\s*Cr)?/i);
  if (!match) return null;
  const low = parseFloat(match[1]);
  const high = match[2] ? parseFloat(match[2]) : low;
  if (Number.isNaN(low) || Number.isNaN(high)) return null;
  return { low: low * 10000000, high: high * 10000000 }; // Crore -> INR
}

export async function generateStaticParams() {
  let dbSlugs: string[] = [];
  try {
    dbSlugs = await getSupabaseAllPropertySlugs();
  } catch (err) {
    console.error("Error fetching slugs for static params:", err);
  }
  const staticSlugs = STATIC_PROPERTIES.map((property) => property.slug);
  const allSlugs = Array.from(new Set([...dbSlugs, ...staticSlugs]));
  return allSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const { slug } = await params;
  let property = await getSupabasePropertyBySlug(slug);
  if (!property) {
    property = STATIC_PROPERTIES.find((p) => p.slug === slug) || null;
  }
  if (!property) return {};

  const title = property.seoTitle || `${property.configuration} ${property.sizeRange} in ${property.locationLabel}`;
  const description = property.seoDescription || property.description?.[0] || 
    `Explore this exclusive ${property.configuration} · ${property.sizeRange} located in ${property.locationLabel}, Ahmedabad. Request private details from PIKORUA Realty.`;
  const categoryLabel = RESIDENTIAL_CATEGORY_LABELS[property.category] || "Luxury Residence";

  return createMetadata({
    title,
    description,
    path: `/properties/${property.slug}`,
    image: property.coverImage || "/logo.png",
    keywords: [
      property.name,
      property.configuration,
      property.locationLabel,
      categoryLabel,
      `${property.name} Ahmedabad`,
      `${property.configuration} ${property.locationLabel}`,
    ],
  });
}

export default async function PropertyDetailPage({ params }: PropertyPageProps) {
  const { slug } = await params;
  let property = await getSupabasePropertyBySlug(slug);
  if (!property) {
    property = STATIC_PROPERTIES.find((p) => p.slug === slug) || null;
  }

  if (!property) {
    notFound();
  }


  const categoryLabel = RESIDENTIAL_CATEGORY_LABELS[property.category] || "Luxury Residence";
  const statusLabel = PROPERTY_STATUS_LABELS[property.status];
  const allImages = property.images && property.images.length > 0 ? property.images.filter(Boolean) : [property.coverImage].filter(Boolean);
  const priceDisplay = property.priceOnRequest ? "Price on Request" : (property.price || "Price on Request");
  const nriAdvisory = getNriPropertyAdvisory(property);
  const locationLandingPage = getLocationLandingPage(property.location);
  const areaLabel = property.id === "kalrav-alpines" ? "Plot Area" : "Area";
  const heroImage = property.coverImage || allImages[0] || "/logo.png";
  const heroFacts = [
    { label: "Configuration", value: property.configuration, icon: Building2 },
    { label: areaLabel, value: property.sizeRange, icon: Ruler },
    { label: "Status", value: statusLabel, icon: CalendarCheck },
    { label: "Price Guide", value: priceDisplay, icon: IndianRupee },
  ];

  const canonicalUrl = absoluteUrl(`/properties/${property.slug}`);

  // Rich RealEstateListing schema: includes numberOfRooms, floorSize,
  // amenityFeature[], GeoCoordinates, and a typed Residence entity.
  // Centralised in @/lib/seo so every property page emits consistent structured data.
  const listingSchema = generatePropertySchema({
    slug: property.slug,
    name: property.name,
    category: property.category,
    location: property.location,
    locationLabel: property.locationLabel,
    configuration: property.configuration,
    sizeRange: property.sizeRange,
    status: property.status,
    description: property.description,
    highlights: property.highlights,
    builtUpArea: property.builtUpArea,
    plotArea: property.plotArea,
    floor: property.floor,
    amenitiesSummary: property.amenitiesSummary,
    price: property.price,
    priceOnRequest: property.priceOnRequest,
    coverImage: property.coverImage,
    images: allImages,
  });

  const priceRange = !property.priceOnRequest ? parsePriceCrore(property.price) : null;

  const offers = priceRange
    ? priceRange.low === priceRange.high
      ? {
          "@type": "Offer",
          "@id": `${canonicalUrl}#offer`,
          url: canonicalUrl,
          availability: "https://schema.org/InStock",
          price: priceRange.low,
          priceCurrency: "INR",
          seller: { "@id": ENTITY_IDS.realEstateAgent },
        }
      : {
          "@type": "AggregateOffer",
          "@id": `${canonicalUrl}#offer`,
          url: canonicalUrl,
          availability: "https://schema.org/InStock",
          lowPrice: priceRange.low,
          highPrice: priceRange.high,
          priceCurrency: "INR",
          offerCount: 1,
          seller: { "@id": ENTITY_IDS.realEstateAgent },
        }
    : {
        "@type": "Offer",
        "@id": `${canonicalUrl}#offer`,
        url: canonicalUrl,
        availability: "https://schema.org/InStock",
        priceCurrency: "INR",
        priceSpecification: {
          "@type": "PriceSpecification",
          priceCurrency: "INR",
          description: priceDisplay,
        },
        seller: { "@id": ENTITY_IDS.realEstateAgent },
      };

  const productSchema = {
    "@type": "Product",
    "@id": `${canonicalUrl}#product`,
    name: `${property.configuration} in ${property.locationLabel}`,
    description:
      property.description?.[0] ??
      `${property.configuration} ${property.sizeRange} in ${property.locationLabel}, Ahmedabad.`,
    image: (allImages.length > 0 ? allImages : [heroImage]).map((image) => absoluteUrl(image)),
    category: categoryLabel,
    brand: {
      "@id": ENTITY_IDS.realEstateAgent,
    },
    offers,
  };

  // Schema: BreadcrumbList
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": SITE_URL
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Properties",
        "item": absoluteUrl("/properties")
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": property.name,
        "item": canonicalUrl
      }
    ]
  };

  const combinedPropertySchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        ...listingSchema,
        "@context": undefined,
      },
      productSchema,
      {
        ...breadcrumbSchema,
        "@context": undefined,
      },
    ],
  };

  return (
    <>
      {/* Dynamic JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(combinedPropertySchema) }}
      />

      <Header alwaysSolid />
      <main id="main-content" className="bg-lux-black text-ivory min-h-screen">
        <section className="relative min-h-[76vh] overflow-hidden border-b border-white/[0.06]">
          <Image
            src={heroImage}
            alt={`${property.configuration} in ${property.locationLabel}, Ahmedabad`}
            fill
            quality={82}
            preload
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-lux-black via-lux-black/80 to-lux-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-lux-black via-lux-black/20 to-lux-black/25" />

          <div className="relative mx-auto flex min-h-[76vh] max-w-7xl flex-col justify-between px-4 pb-8 pt-28 sm:px-6 lg:px-8 lg:pb-12 lg:pt-36">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/properties"
                className="group inline-flex items-center gap-2 text-[10px] font-sans uppercase tracking-[0.2em] text-champagne-gold/80 hover:text-champagne-gold transition-colors duration-150"
              >
                <ArrowLeft className="w-3.5 h-3.5 transform group-hover:-translate-x-1 transition-transform duration-200" />
                Back to Collection
              </Link>

              <nav aria-label="Breadcrumb" className="text-[10px] font-sans text-ivory/45 uppercase tracking-[0.15em] flex flex-wrap items-center gap-1.5">
                <Link href="/" className="hover:text-ivory/80 transition-colors">Home</Link>
                <span>/</span>
                <Link href="/properties" className="hover:text-ivory/80 transition-colors">Properties</Link>
                <span>/</span>
                <span className="text-champagne-gold/90">{property.name}</span>
              </nav>
            </div>

            <div className="max-w-5xl py-14 sm:py-18 lg:py-20">
              <div className="mb-5 flex flex-wrap items-center gap-2.5">
                <span className="border border-champagne-gold/35 bg-lux-black/45 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-champagne-gold backdrop-blur-sm font-sans">
                  {categoryLabel}
                </span>
                {locationLandingPage ? (
                  <Link 
                    href={locationLandingPage.href}
                    className="border border-white/[0.10] bg-lux-black/40 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-ivory/75 backdrop-blur-sm font-sans hover:border-champagne-gold/60 hover:text-champagne-gold transition-all duration-200"
                  >
                    {property.locationLabel}
                  </Link>
                ) : (
                  <span className="border border-white/[0.10] bg-lux-black/40 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-ivory/75 backdrop-blur-sm font-sans">
                    {property.locationLabel}
                  </span>
                )}
              </div>

              <h1 className="font-display text-[clamp(2.15rem,6vw,4.7rem)] font-light text-white leading-[0.98] uppercase tracking-wider max-w-4xl">
                {property.configuration}
              </h1>
              <p className="mt-5 flex items-center gap-2 text-xs font-sans text-ivory/70 uppercase tracking-[0.16em]">
                <MapPin className="w-4 h-4 text-champagne-gold/75" />
                {property.sizeRange} in {property.locationLabel}, Ahmedabad
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#enquiry-form"
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-sm bg-champagne-gold px-7 py-3 text-[10px] font-sans uppercase tracking-[0.2em] text-lux-black transition-colors duration-200 hover:bg-antique-gold"
                >
                  Request Private Details
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
                <a
                  href="#property-gallery"
                  className="inline-flex min-h-[48px] items-center justify-center rounded-sm border border-champagne-gold/45 px-7 py-3 text-[10px] font-sans uppercase tracking-[0.2em] text-champagne-gold transition-colors duration-200 hover:border-champagne-gold hover:bg-champagne-gold/[0.06]"
                >
                  View Gallery
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 overflow-hidden border border-white/[0.08] bg-lux-black/65 backdrop-blur-md lg:grid-cols-4">
              {heroFacts.map(({ label, value, icon: Icon }) => (
                <div key={label} className="min-h-[108px] border-r border-white/[0.08] p-4 even:border-r-0 sm:p-5 lg:even:border-r lg:last:border-r-0">
                  <Icon className="mb-4 h-4 w-4 text-champagne-gold/80" />
                  <p className="mb-1.5 text-[9px] font-sans uppercase tracking-[0.18em] text-ivory/45">
                    {label}
                  </p>
                  <p className="break-words text-xs font-sans leading-relaxed text-ivory/88 sm:text-sm">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          {/* Main Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            
            {/* Left Column — Title, Gallery, Description, Highlights */}
            <div className="lg:col-span-8 space-y-12">
              
              {/*
              <div className="hidden" aria-hidden="true">
                <p className="font-display text-[clamp(1.75rem,4vw,2.75rem)] font-normal text-white leading-tight uppercase tracking-wider">
                  {property.configuration} · {property.sizeRange}
                </p>

                <p className="text-xs font-sans text-ivory/40 uppercase tracking-[0.12em] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-champagne-gold/50" />
                  Ahmedabad, India
                </p>
              </div>
              */}

              {/* Image Gallery */}
              <div id="property-gallery" className="scroll-mt-28">
                <PropertyGallery images={allImages} name={property.configuration} imageAlts={property.imageAlts} preloadFirst={false} />
              </div>

              {/* Description */}
              <div className="space-y-6 pt-4 border-t border-white/[0.06]">
                <h2 className="text-xs font-sans uppercase tracking-[0.2em] text-champagne-gold font-medium">
                  About the Residence
                </h2>
                <div className="font-sans text-ivory/60 text-sm leading-[1.8] space-y-6 font-light">
                  {property.description?.map((paragraph, idx) => {
                    const isHeading = paragraph.startsWith("### ");
                    const isListItem = paragraph.startsWith("- ") || paragraph.startsWith("* ");

                    if (isHeading) {
                      return (
                        <h4 
                          key={idx}
                          className="font-display text-sm text-white uppercase tracking-wider mt-8 mb-3 font-normal"
                          dangerouslySetInnerHTML={{ __html: renderFormattedText(paragraph.substring(4)) }}
                        />
                      );
                    }

                    if (isListItem) {
                      return (
                        <div key={idx} className="flex items-start gap-2.5 my-2 pl-4 text-ivory/70">
                          <span className="w-1 h-1 rounded-full bg-champagne-gold/75 mt-2 flex-shrink-0 animate-pulse" />
                          <span dangerouslySetInnerHTML={{ __html: renderFormattedText(paragraph.substring(2)) }} />
                        </div>
                      );
                    }

                    return (
                      <p 
                        key={idx} 
                        dangerouslySetInnerHTML={{ __html: renderFormattedText(paragraph) }}
                      />
                    );
                  })}
                  {!property.description && (
                    <p>
                      An exclusive premium {categoryLabel.toLowerCase()} designed to maximize space, privacy, and architectural distinction. 
                      Situated in the high-end {property.locationLabel} corridor, this {property.configuration} residence of {property.sizeRange} represents 
                      a unique investment and lifestyle option for HNI and NRI buyers seeking quality, privacy, and discretion in Ahmedabad.
                    </p>
                  )}
                  {locationLandingPage && (
                    <div className="mt-8 pt-6 border-t border-white/[0.06] flex">
                      <Link
                        href={locationLandingPage.href}
                        className="group inline-flex items-center gap-2 text-xs font-sans uppercase tracking-[0.2em] text-champagne-gold hover:text-white transition-colors duration-200"
                      >
                        Explore properties in {locationLandingPage.label} Corridor
                        <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform duration-200" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Highlights */}
              {property.highlights && property.highlights.length > 0 && (
                <div className="space-y-5 pt-4">
                  <h2 className="text-xs font-sans uppercase tracking-[0.2em] text-champagne-gold font-medium">
                    Property Highlights
                  </h2>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans text-ivory/70 leading-relaxed font-light">
                    {property.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex gap-2.5 items-start">
                        <ShieldCheck className="w-4 h-4 text-champagne-gold/75 flex-shrink-0 mt-0.5" />
                        <span dangerouslySetInnerHTML={{ __html: renderFormattedText(highlight) }} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* NRI Investment Advisory */}
              <section className="relative overflow-hidden rounded-md border border-white/[0.08] bg-soft-black/55 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)] sm:p-7 lg:p-8" aria-labelledby="nri-advisory-heading">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-champagne-gold/50 to-transparent" aria-hidden="true" />

                <div className="grid grid-cols-1 gap-6 border-b border-white/[0.06] pb-7 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10">
                  <div>
                    <p className="mb-3 text-[10px] font-sans uppercase tracking-[0.2em] text-champagne-gold font-medium">
                      NRI Investment View
                    </p>
                    <h2 id="nri-advisory-heading" className="font-display text-xl sm:text-2xl text-white uppercase tracking-wider font-normal leading-tight">
                      Why this property works for NRI buyers
                    </h2>
                  </div>
                  <p className="font-sans text-sm leading-[1.8] text-ivory/62 font-light">
                    {nriAdvisory.hook} The asset should be evaluated for location quality, ROI visibility, rental demand,
                    remote purchase support, and document clarity before commitment.
                  </p>
                </div>

                <div className="space-y-4 pt-7">
                  <h3 className="text-xs font-sans uppercase tracking-[0.18em] text-champagne-gold font-medium">
                    ROI Snapshot
                  </h3>
                  <div className="grid grid-cols-1 gap-px overflow-hidden rounded-sm bg-white/[0.06] md:grid-cols-3">
                    {nriAdvisory.roiSnapshot.map((item) => (
                      <div key={item.label} className="bg-lux-black/55 p-4 sm:p-5">
                        <p className="text-[10px] font-sans uppercase tracking-[0.16em] text-ivory/42 mb-2">
                          {item.label}
                        </p>
                        <p className="text-xs font-sans leading-[1.75] text-ivory/68 font-light">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-7 grid grid-cols-1 gap-px overflow-hidden rounded-sm bg-white/[0.06] md:grid-cols-3">
                  <div className="space-y-3 bg-lux-black/35 p-5">
                    <h3 className="text-xs font-sans uppercase tracking-[0.18em] text-champagne-gold font-medium">
                      Remote Buying Support
                    </h3>
                    <ul className="space-y-3">
                      {nriAdvisory.remoteBuyingSupport.map((item) => (
                        <li key={item.label} className="space-y-1">
                          <p className="text-xs font-sans text-white/86 font-medium">{item.label}</p>
                          <p className="text-xs font-sans leading-[1.7] text-ivory/56 font-light">{item.value}</p>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3 bg-lux-black/35 p-5">
                    <h3 className="text-xs font-sans uppercase tracking-[0.18em] text-champagne-gold font-medium">
                      Trust Triggers
                    </h3>
                    <ul className="space-y-3">
                      {nriAdvisory.trustTriggers.map((item) => (
                        <li key={item.label} className="space-y-1">
                          <p className="text-xs font-sans text-white/86 font-medium">{item.label}</p>
                          <p className="text-xs font-sans leading-[1.7] text-ivory/56 font-light">{item.value}</p>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3 bg-lux-black/35 p-5">
                    <h3 className="text-xs font-sans uppercase tracking-[0.18em] text-champagne-gold font-medium">
                      Lifestyle Angle
                    </h3>
                    <ul className="space-y-3">
                      {nriAdvisory.lifestyle.map((item) => (
                        <li key={item} className="flex gap-2.5 text-xs font-sans leading-[1.7] text-ivory/56 font-light">
                          <ShieldCheck className="w-3.5 h-3.5 text-champagne-gold/75 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column — Specifications & Form Sidebar */}
            <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
              
              {/* Specifications Block */}
              <div className="bg-soft-black/80 border border-white/[0.08] p-6 sm:p-7 rounded-md space-y-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
                <div className="space-y-2">
                  <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-champagne-gold font-medium">
                    Private Advisory
                  </p>
                  <h2 className="font-display text-2xl text-white uppercase tracking-wider font-light">
                    {priceDisplay}
                  </h2>
                  <p className="text-xs font-sans text-ivory/45 leading-relaxed">
                    Availability, floor options, and payment terms are shared privately after requirement matching.
                  </p>
                </div>

                <a
                  href="#enquiry-form"
                  className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-sm border border-champagne-gold/45 px-5 py-3 text-[10px] font-sans uppercase tracking-[0.2em] text-champagne-gold transition-colors duration-200 hover:border-champagne-gold hover:bg-champagne-gold/[0.06]"
                >
                  Enquire Privately
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>

                <div className="grid grid-cols-1 gap-5 pt-2">
                  <div>
                    <span className="block text-[9px] uppercase tracking-[0.15em] text-ivory/45 font-sans mb-1.5">
                      Configuration
                    </span>
                    <span className="text-sm font-sans text-white/90 font-medium">
                      {property.configuration}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[9px] uppercase tracking-[0.15em] text-ivory/45 font-sans mb-1.5">
                      Dimensions
                    </span>
                    <span className="text-sm font-sans text-white/90 font-medium">
                      {property.sizeRange}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[9px] uppercase tracking-[0.15em] text-ivory/45 font-sans mb-1.5">
                      Status
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-champagne-gold opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-champagne-gold" />
                      </span>
                      <span className="text-xs font-sans text-white/90 uppercase tracking-wider">
                        {statusLabel}
                      </span>
                    </div>
                  </div>

                </div>

                {/* Additional Spec Details */}
                <div className="pt-4 border-t border-white/[0.06] space-y-3 text-[11px] font-sans text-ivory/50 font-light">
                  {property.builtUpArea && (
                    <div className="flex justify-between">
                      <span>Built Up Area:</span>
                      <span className="text-ivory/80">{property.builtUpArea}</span>
                    </div>
                  )}
                  {property.plotArea && (
                    <div className="flex justify-between">
                      <span>Plot Area:</span>
                      <span className="text-ivory/80">{property.plotArea}</span>
                    </div>
                  )}
                  {property.floor && (
                    <div className="flex justify-between">
                      <span>BHK:</span>
                      <span className="text-ivory/80">{property.floor}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Pre-filled Enquiry Form */}
              <div id="enquiry-form">
                <PropertyEnquiryForm
                  propertySlug={property.slug}
                  propertyName={`${property.configuration} · ${property.sizeRange}`}
                  locationLabel={property.locationLabel}
                />
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
