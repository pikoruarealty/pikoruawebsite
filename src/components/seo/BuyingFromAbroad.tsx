import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { env } from "@/lib/env";
import { buildWhatsAppUrl } from "@/lib/utils";
import { SOCIAL_LINKS } from "@/lib/social";
import { ABROAD_COUNTRY_LINKS, ABROAD_STEPS, ABROAD_SUMMARY } from "@/lib/data/buying-from-abroad";

interface BuyingFromAbroadProps {
  /** Page path, put in the WhatsApp message so the team knows where the visitor came from. */
  pagePath: string;
  /**
   * Where "Book a call in your time zone" goes: the page's own enquiry form
   * (which asks visitors abroad for their time zone), or ABROAD_CALL_FALLBACK_HREF.
   */
  enquireHref?: string;
  /** "compact" is a short strip for property pages, blog posts and filter pages. */
  variant?: "full" | "compact";
  /** Which edge gets the hairline, to match the sections around it. */
  border?: "top" | "bottom";
}

const primaryButton =
  "inline-flex min-h-[48px] items-center justify-center rounded-sm border border-champagne-gold/40 px-6 py-3 text-center font-sans text-[11px] uppercase tracking-[0.16em] text-champagne-gold transition-colors duration-200 hover:border-champagne-gold hover:bg-champagne-gold/[0.05]";
const secondaryButton =
  "inline-flex min-h-[48px] items-center justify-center rounded-sm border border-white/15 px-6 py-3 text-center font-sans text-[11px] uppercase tracking-[0.16em] text-ivory/70 transition-colors duration-200 hover:border-white/35 hover:text-ivory";

function CountryLinks() {
  return (
    <nav aria-label="Guides for buyers abroad, by country">
      <p className="mb-3 font-sans text-xs text-ivory/50">Guides for your country:</p>
      <ul className="flex flex-wrap gap-2">
        {ABROAD_COUNTRY_LINKS.map((country) => (
          <li key={country.href}>
            <Link
              href={country.href}
              className="group inline-flex items-center gap-1.5 rounded-sm border border-white/[0.10] px-3.5 py-2 font-sans text-xs text-ivory/75 transition-colors duration-200 hover:border-champagne-gold/50 hover:text-champagne-gold"
            >
              Buying from {country.label}
              <ArrowRight size={12} className="text-champagne-gold/50 group-hover:text-champagne-gold" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * "Buying from abroad?" — how an overseas buyer can buy without flying in
 * (video walkthrough, power of attorney, remote paperwork, a call in their
 * time zone), with links to the country guides.
 */
export function BuyingFromAbroad({ pagePath, enquireHref = "#enquire", variant = "full", border = "top" }: BuyingFromAbroadProps) {
  const edge = border === "top" ? "border-t" : "border-b";
  const whatsappUrl = buildWhatsAppUrl(
    env.WHATSAPP_NUMBER,
    `Hi PIKORUA Realty, I live abroad and I'm looking at your page ${pagePath}. Could we set up a call in my time zone?`
  );
  const buttons = (
    <>
      <a href={enquireHref} className={primaryButton}>
        Book a call in your time zone
      </a>
      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={secondaryButton}>
        WhatsApp us
      </a>
    </>
  );

  if (variant === "compact") {
    return (
      <section
        id="buying-from-abroad"
        aria-labelledby="buying-from-abroad-heading"
        className={`scroll-mt-28 ${edge} border-white/[0.06] bg-lux-black py-12 lg:py-16`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5">
              <p className="mb-3 font-sans text-[10px] uppercase tracking-[0.25em] text-champagne-gold">
                For Buyers Living Abroad
              </p>
              <h2
                id="buying-from-abroad-heading"
                className="font-display text-[clamp(1.3rem,2.4vw,1.9rem)] font-light uppercase leading-tight tracking-wider"
              >
                Buying from abroad?
              </h2>
              <p className="mt-4 font-sans text-sm leading-relaxed text-ivory/60">{ABROAD_SUMMARY}</p>
              <div className="mt-6 flex flex-col gap-3 min-[420px]:flex-row">{buttons}</div>
            </div>
            <div className="lg:col-span-7 lg:border-l lg:border-white/[0.06] lg:pl-12">
              <CountryLinks />
              <p className="mt-6 font-sans text-xs leading-relaxed text-ivory/45">
                See how it works step by step on our{" "}
                <Link href="/nri" className="text-champagne-gold/85 underline underline-offset-2 hover:text-champagne-gold">
                  NRI advisory page
                </Link>
                , or watch project walkthroughs on our{" "}
                <a
                  href={SOCIAL_LINKS.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-champagne-gold/85 underline underline-offset-2 hover:text-champagne-gold"
                >
                  YouTube channel
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="buying-from-abroad"
      aria-labelledby="buying-from-abroad-heading"
      className={`scroll-mt-28 ${edge} border-white/[0.06] bg-lux-black py-16 lg:py-24`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <p className="mb-4 font-sans text-[10px] uppercase tracking-[0.25em] text-champagne-gold">
              For Buyers Living Abroad
            </p>
            <h2
              id="buying-from-abroad-heading"
              className="font-display text-[clamp(1.5rem,3vw,2.4rem)] font-light uppercase leading-tight tracking-wider"
            >
              Buying from abroad?
            </h2>
            <div className="mt-6 h-px w-8 bg-champagne-gold/40" aria-hidden="true" />
            <p className="mt-6 font-sans text-sm leading-relaxed text-ivory/60">
              You can choose, check and buy a home in Ahmedabad without flying in until it&rsquo;s time
              to move in or register. This is how it works.
            </p>
            <div className="mt-8 flex flex-col gap-3">{buttons}</div>
          </div>

          <div className="lg:col-span-8">
            <ol className="grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2">
              {ABROAD_STEPS.map((step, i) => (
                <li key={step.title} className="border-l border-white/[0.08] pl-5">
                  <p className="mb-2 font-sans text-[10px] tabular-nums tracking-[0.2em] text-champagne-gold/60">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="font-sans text-sm font-medium uppercase tracking-[0.12em] text-ivory">
                    {step.title}
                  </h3>
                  <p className="mt-3 font-sans text-sm leading-relaxed text-ivory/60">{step.body}</p>
                </li>
              ))}
            </ol>

            <div className="mt-10 border-t border-white/[0.06] pt-6">
              <CountryLinks />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
