import Link from "next/link";
import { getSupabaseFeaturedTestimonials } from "@/lib/db/queries";
import type { Testimonial } from "@/types";

const STATIC_TESTIMONIALS: Pick<Testimonial, "_id" | "clientName" | "quote" | "context" | "source" | "rating" | "reviewUrl">[] = [
  {
    _id: "static-1",
    clientName: "Krunal Patel",
    quote:
      "We are incredibly grateful to Jitendra bhai for helping us find and purchase our dream home! From the very beginning, he was professional, attentive, and genuinely invested in understanding our needs. He made the entire process smooth and stress-free.",
    context: "Property Investor, Ahmedabad",
    source: "google",
    rating: 5,
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
    reviewUrl: "https://maps.app.goo.gl/r4VCFf4Zek6XxRvPA",
  },
];

type TeaserItem = (typeof STATIC_TESTIMONIALS)[number];

export async function TestimonialsTeaser() {
  let testimonials: TeaserItem[] = [];
  try {
    const live = await getSupabaseFeaturedTestimonials();
    if (live.length > 0) testimonials = live;
  } catch (err) {
    console.error("Error fetching featured testimonials from Supabase:", err);
  }

  const display = testimonials.length > 0 ? testimonials : STATIC_TESTIMONIALS;

  return (
    <section className="bg-lux-black pt-12 pb-12 lg:pt-16 lg:pb-16" aria-labelledby="testimonials-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14">
          <p className="text-[10px] uppercase tracking-[0.25em] text-champagne-gold font-sans mb-4">
            Client Voices
          </p>
          <h2
            id="testimonials-heading"
            className="font-display text-[clamp(1.5rem,3vw,2.25rem)] font-normal text-ivory leading-tight uppercase tracking-wider"
          >
            What Our Clients Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-ivory/[0.04]">
          {display.slice(0, 3).map((t) => (
            <TestimonialCard key={t._id} testimonial={t} />
          ))}
        </div>

        <div className="mt-12 flex items-center gap-6">
          <div className="h-px flex-1 bg-ivory/[0.06]" aria-hidden="true" />
          <Link
            href="/testimonials"
            className="flex-shrink-0 text-xs font-sans text-ivory/50 hover:text-ivory/80 tracking-[0.12em] uppercase transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-champagne-gold rounded-sm"
          >
            Read all reviews →
          </Link>
          <div className="h-px flex-1 bg-ivory/[0.06]" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: TeaserItem }) {
  const content = (
    <>
      {testimonial.rating && testimonial.rating >= 4 && (
        <div className="flex gap-0.5" aria-label={`${testimonial.rating} out of 5 stars`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <StarIcon key={i} filled={i < (testimonial.rating ?? 0)} />
          ))}
        </div>
      )}
      <blockquote className="font-display text-base text-ivory/70 leading-relaxed flex-1 italic">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>
      <div className="border-t border-ivory/[0.06] pt-5">
        <p className="text-sm font-sans text-ivory font-medium">{testimonial.clientName}</p>
        {testimonial.context && (
          <p className="text-xs font-sans text-ivory/50 mt-0.5">{testimonial.context}</p>
        )}
        {testimonial.source === "google" && (
          <p className="text-[10px] font-sans text-champagne-gold/75 mt-1.5 uppercase tracking-[0.12em] flex items-center gap-1">
            Google Review
            {testimonial.reviewUrl && (
              <span className="text-[8px] opacity-70">↗</span>
            )}
          </p>
        )}
      </div>
    </>
  );

  const baseClassName = "bg-lux-black p-5 sm:p-8 hover:bg-soft-black border border-ivory/[0.04] hover:border-champagne-gold/20 flex flex-col justify-between gap-5 sm:gap-6 transition-all duration-300 text-left w-full h-full";

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
    <div className={baseClassName}>
      {content}
    </div>
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
