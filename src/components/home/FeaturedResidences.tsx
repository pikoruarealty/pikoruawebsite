import Link from "next/link";
import { getSupabaseFeaturedProperties } from "@/lib/db/queries";
import { STATIC_PROPERTIES } from "@/lib/data/properties";
import { LazyFeaturedResidencesGrid } from "./LazyFeaturedResidencesGrid";

const POPULAR_PROPERTY_LINKS = [
  { href: "/luxury-apartments-ahmedabad", label: "Luxury apartments" },
  { href: "/penthouses-ahmedabad", label: "Penthouses" },
  { href: "/luxury-villas-ahmedabad", label: "Villas & bungalows" },
  { href: "/nri-property-investment-ahmedabad", label: "NRI advisory" },
] as const;

export async function FeaturedResidences() {
  let properties: Awaited<ReturnType<typeof getSupabaseFeaturedProperties>> = [];
  try {
    properties = await getSupabaseFeaturedProperties();
  } catch (err) {
    console.error("Error fetching featured properties from Supabase:", err);
  }

  const useFallback = properties.length < 3;
  const displayedProperties = useFallback
    ? STATIC_PROPERTIES.filter((p) => p.isFeatured)
    : properties;

  return (
    <section className="bg-lux-black py-14 lg:py-20 border-t border-white/[0.06]" aria-labelledby="featured-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── Section Header ── */}
        <div className="mb-8 lg:mb-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">

            {/* Left: Headline + subheading */}
            <div className="max-w-xl">
              <p className="text-[9px] uppercase tracking-[0.3em] text-champagne-gold font-sans mb-3 flex items-center gap-3">
                <span className="inline-block w-4 h-px bg-champagne-gold/60" />
                PIKORUA Private Preview
              </p>

              <h2
                id="featured-heading"
                className="font-display font-normal text-ivory leading-tight text-[clamp(1.2rem,1.8vw,1.5rem)] mb-3 uppercase tracking-wider"
              >
                Selected opportunities<br />
                <span className="text-champagne-gold italic">from our private collection.</span>
              </h2>

              <p className="text-[11px] font-sans text-ivory/50 leading-relaxed">
                Each property is curated for its location, lifestyle value, privacy, and long-term potential.
              </p>

              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                {POPULAR_PROPERTY_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-[10px] font-sans uppercase tracking-[0.14em] text-ivory/45 transition-colors duration-150 hover:text-champagne-gold"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: View all link */}
            <div className="flex-shrink-0">
              <Link
                href="/properties"
                className="inline-flex items-center gap-2 text-xs font-sans text-ivory/50 hover:text-ivory uppercase tracking-[0.12em] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-champagne-gold rounded-sm group"
              >
                View all properties
                <span className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          {/* Hairline divider */}
          <div className="mt-7 h-px bg-gradient-to-r from-champagne-gold/25 via-white/[0.05] to-transparent" aria-hidden="true" />
        </div>

        <LazyFeaturedResidencesGrid properties={displayedProperties} />

        <div className="mt-10 text-center sm:hidden">
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 text-xs font-sans text-ivory/50 hover:text-ivory uppercase tracking-[0.12em] transition-colors duration-150"
          >
            View all properties →
          </Link>
        </div>
      </div>
    </section>
  );
}
