import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getSupabaseAllTestimonials, getPageSeoData } from "@/lib/db/queries";
import { ENTITY_IDS, getAhmedabadAreaServedSchema, getGeoCoordinatesSchema } from "@/lib/entity-profile";
import { absoluteUrl, createMetadata, serializeJsonLd, SITE_URL } from "@/lib/seo";
import type { Testimonial } from "@/types";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeoData("testimonials");
  const defaultTitle = "Client Testimonials";
  const defaultDesc = "Read what PIKORUA Realty's clients say about their experience — HNI buyers, NRI investors, and sellers who chose a private advisory over a public portal.";

  return createMetadata({
    title: seo?.seoTitle || defaultTitle,
    description: seo?.seoDescription || defaultDesc,
    path: "/testimonials",
  });
}

// ISR: re-render at most every hour.
// Admin actions call revalidatePath("/testimonials") on every save, so the cache
// is flushed immediately whenever testimonials actually change.
export const revalidate = 86400;

const STATIC_TESTIMONIALS: Testimonial[] = [
  {
    _id: "static-1",
    clientName: "Krunal Patel",
    quote:
      "We are incredibly grateful to Jitendra bhai for helping us find and purchase our dream home! From the very beginning, he was professional, attentive, and genuinely invested in understanding our needs. He made the entire process smooth and stress-free.",
    context: "Property Investor, Ahmedabad",
    source: "google",
    rating: 5,
    isFeatured: true,
    isPublished: true,
    reviewUrl: "https://maps.app.goo.gl/ZLDmmbt7CYPzTBkx8",
  },
  {
    _id: "static-2",
    clientName: "Vaishali Rajput",
    quote:
      "Jitendra Pareek made our site visit smooth and easy. He took the time to understand the client's needs and suggested the perfect project solutions. His clear communication and expertise really helped make my job easier. Highly recommended!",
    context: "Business Owner, Mumbai",
    source: "google",
    rating: 5,
    isFeatured: true,
    isPublished: true,
    reviewUrl: "https://maps.app.goo.gl/gtw5vXR5DfvKQ6at5",
  },
  {
    _id: "static-3",
    clientName: "Rutuja Joshi",
    quote:
      "Navigating the complexities of luxury real estate requires not just expertise, but a rare blend of patience, discernment, and unwavering integrity; qualities that Jitendra embodies effortlessly. His humility is as striking as his depth of knowledge.",
    context: "Luxury Home Buyer, Dubai",
    source: "google",
    rating: 5,
    isFeatured: true,
    isPublished: true,
    reviewUrl: "https://maps.app.goo.gl/r4VCFf4Zek6XxRvPA",
  },
  {
    _id: "static-4",
    clientName: "Karan Motwani",
    quote:
      "Mr Jitendra is a Gem of a person! I met him one year ago when I started looking for a property and me being a very choosy person looked at so many properties and changed my mind so many times to the level that even I would get annoyed by myself. But he never showed any sign of irritation and was always patient with me.",
    context: "High Net Worth Individual, Ahmedabad",
    source: "google",
    rating: 5,
    isFeatured: false,
    isPublished: true,
    reviewUrl: "https://maps.app.goo.gl/sLSDP5uW3nNwdVE7A",
  },
  {
    _id: "static-5",
    clientName: "Priti Chavan",
    quote:
      "Top performing consultancy firm for our all projects! He is a thorough professional and got extremely sound knowledge of luxury segment across Ahmedabad, Mumbai and Dubai. Also his customer-first approach is what makes customers love his services.",
    context: "Real Estate Developer, Mumbai",
    source: "google",
    rating: 5,
    isFeatured: false,
    isPublished: true,
    reviewUrl: "https://maps.app.goo.gl/7UXkkt7pYdj99Fw6A",
  },
  {
    _id: "static-6",
    clientName: "Amit Malkani",
    quote:
      "Jitendra is an Expert in Relationship Management & planning to support in Decision Making. His expertise in luxury real estate market is unparalleled and his approach is always client-centric.",
    context: "Investment Advisor, Ahmedabad",
    source: "google",
    rating: 5,
    isFeatured: false,
    isPublished: true,
    reviewUrl: "https://maps.app.goo.gl/5E647rBNqfoCRDmh7",
  },
];

export default async function TestimonialsPage() {
  let liveTestimonials: Testimonial[] = [];
  try {
    liveTestimonials = await getSupabaseAllTestimonials();
  } catch (err) {
    console.error("Error fetching testimonials from Supabase:", err);
  }

  const testimonials = liveTestimonials.length > 0 ? liveTestimonials : STATIC_TESTIMONIALS;

  // ── Structured data: Review + AggregateRating ────────────────────────────
  // Using Review schema (not CreativeWork) so Google can display star snippets
  // in search results. We have real, verifiable 5-star Google reviews with
  // direct Google Maps URLs — the previous CollectionPage schema ignored all
  // rating data, which is a missed trust signal.
  const publishedTestimonials = testimonials.filter((t) => t.isPublished !== false);
  const ratedTestimonials = publishedTestimonials.filter((t) => t.rating);
  const totalRating = ratedTestimonials.reduce((sum, t) => sum + (t.rating ?? 5), 0);
  const averageRating =
    ratedTestimonials.length > 0
      ? (totalRating / ratedTestimonials.length).toFixed(1)
      : "5.0";

  const testimonialsPageSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": absoluteUrl("/testimonials#webpage"),
        url: absoluteUrl("/testimonials"),
        name: "Client Testimonials — PIKORUA Realty",
        description:
          "Read verified reviews from HNI buyers, NRI investors, and sellers who chose PIKORUA Realty's private luxury real estate advisory in Ahmedabad.",
        about: { "@id": `${SITE_URL}#advisory-service` },
      },
      {
        // Define the advisory service itself.
        // Google permits review snippets on Services (unlike self-serving reviews on LocalBusiness/Organization),
        // which preserves our star rating visibility in Google Search results.
        "@type": "Service",
        "@id": `${SITE_URL}#advisory-service`,
        name: "Private Luxury Property Advisory",
        // @id-only reference — full node declared below in the same @graph
        provider: { "@id": ENTITY_IDS.realEstateAgent },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: averageRating,
          bestRating: "5",
          worstRating: "1",
          ratingCount: String(ratedTestimonials.length),
          reviewCount: String(publishedTestimonials.length),
        },
        review: publishedTestimonials.map((t) => ({
          "@type": "Review",
          // itemReviewed intentionally omitted: each Review is nested under
          // Service.review, which already establishes what's being reviewed.
          author: {
            "@type": "Person",
            name: t.clientName,
          },
          reviewBody: t.quote,
          reviewRating: {
            "@type": "Rating",
            ratingValue: String(t.rating ?? 5),
            bestRating: "5",
            worstRating: "1",
          },
          ...(t.reviewUrl ? { url: t.reviewUrl } : {}),
          ...(t.context ? { description: t.context } : {}),
          // 'publisher' removed — not a valid property of Review (belongs to CreativeWork)
        })),
      },
      {
        // Reference the RealEstateAgent separately for local graph completion.
        // Carries areaServed + geo so this page's RealEstateAgent node emits the
        // local-search signals independently (not only via the sitewide layout).
        "@type": ["Organization", "RealEstateAgent"],
        "@id": ENTITY_IDS.realEstateAgent,
        name: "PIKORUA Realty",
        url: SITE_URL,
        areaServed: getAhmedabadAreaServedSchema(),
        geo: getGeoCoordinatesSchema(),
      },
    ],
  };


  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(testimonialsPageSchema) }}
      />
      <Header alwaysSolid />
      <main id="main-content">
        <section className="bg-lux-black pt-24 pb-8 lg:pt-32 lg:pb-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="w-6 h-px bg-champagne-gold/40 mb-4" aria-hidden="true" />
            <p className="text-[9px] uppercase tracking-[0.25em] text-champagne-gold font-sans mb-3">
              Client Voices
            </p>
            <h1 className="font-display text-[clamp(1.25rem,2.2vw,1.75rem)] font-normal text-ivory leading-tight uppercase tracking-wider">
              What our clients say
            </h1>
            <p className="mt-3 text-ivory/50 font-sans text-xs max-w-sm leading-relaxed">
              The direct experiences of buyers, sellers, NRIs, and investors who chose a private advisory over public portals.
            </p>
          </div>
        </section>

        {/* Testimonials grid */}
        <section className="bg-lux-black py-20 lg:py-32 border-t border-white/[0.06]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <TestimonialCard key={t._id} testimonial={t} />
              ))}
            </div>

            {/* Google reviews link */}
            <div className="mt-16 flex items-center gap-6">
              <div className="h-px flex-1 bg-white/[0.08]" aria-hidden="true" />
              <p className="flex-shrink-0 text-xs font-sans text-ivory/40 uppercase tracking-[0.15em]">
                Verified Google Reviews
              </p>
              <div className="h-px flex-1 bg-white/[0.08]" aria-hidden="true" />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-soft-black py-14 lg:py-20 border-t border-white/[0.06]">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-6 h-px bg-champagne-gold/40 mx-auto mb-6" aria-hidden="true" />
            <h2 className="font-display text-[clamp(1.25rem,2.2vw,1.75rem)] font-normal text-ivory leading-tight uppercase tracking-wider mb-4">
              Ready to begin your own search?
            </h2>
            <p className="text-ivory/50 font-sans text-xs leading-relaxed mb-6 max-w-xs mx-auto">
              We work with a small number of clients at a time, ensuring every advisory is genuinely personal.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-7 py-3 text-xs font-sans uppercase tracking-[0.2em] text-lux-black bg-champagne-gold hover:bg-antique-gold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne-gold min-h-[46px]"
            >
              Book a Private Consultation
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const content = (
    <>
      {testimonial.rating && testimonial.rating >= 4 && (
        <div className="flex gap-0.5" aria-label={`${testimonial.rating} out of 5 stars`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <StarIcon key={i} filled={i < (testimonial.rating ?? 0)} />
          ))}
        </div>
      )}
      <blockquote className="font-display text-base text-ivory/80 leading-relaxed flex-1">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>
      <footer className="border-t border-white/[0.08] pt-5">
        <p className="text-sm font-sans text-ivory font-medium">{testimonial.clientName}</p>
        {testimonial.context && (
          <p className="text-xs font-sans text-ivory/40 mt-0.5">{testimonial.context}</p>
        )}
        {testimonial.source === "google" && (
          <p className="text-[10px] font-sans text-champagne-gold/60 mt-1.5 uppercase tracking-[0.12em] flex items-center gap-1">
            Google Review
            {testimonial.reviewUrl && (
              <span className="text-[8px] opacity-70">↗</span>
            )}
          </p>
        )}
      </footer>
    </>
  );

  const baseClassName = "bg-soft-black border border-white/[0.06] hover:border-champagne-gold/30 p-8 flex flex-col justify-between gap-6 hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all duration-300 text-left w-full h-full";

  if (testimonial.reviewUrl) {
    return (
      <a
        href={testimonial.reviewUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseClassName} cursor-pointer block`}
      >
        {content}
      </a>
    );
  }

  return (
    <article className={baseClassName}>
      {content}
    </article>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className="w-3.5 h-3.5"
      fill={filled ? "#C8A45D" : "none"}
      stroke={filled ? "none" : "#C8A45D"}
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M8 1.5l1.854 3.756L14 5.88l-3 2.924.708 4.13L8 10.772 4.292 12.934 5 8.804 2 5.879l4.146-.624L8 1.5z" />
    </svg>
  );
}
