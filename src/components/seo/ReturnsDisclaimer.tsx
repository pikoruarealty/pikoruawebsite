import Link from "next/link";
import { RETURNS_DISCLAIMER } from "@/lib/data/returns-disclaimer";

interface ReturnsDisclaimerProps {
  /** "section" stands on its own between page sections; "inline" sits inside an article column. */
  variant?: "section" | "inline";
}

/** "Returns are not guaranteed" note, shown where a page quotes return or price-rise figures. */
export function ReturnsDisclaimer({ variant = "section" }: ReturnsDisclaimerProps) {
  const note = (
    <aside
      aria-label={RETURNS_DISCLAIMER.heading}
      className="border-l-2 border-champagne-gold/40 bg-soft-black/60 px-5 py-4"
      data-returns-disclaimer=""
    >
      <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-champagne-gold">
        {RETURNS_DISCLAIMER.heading}
      </p>
      <p className="mt-2 font-sans text-xs leading-relaxed text-ivory/60 sm:text-[13px]">
        {RETURNS_DISCLAIMER.text}{" "}
        <Link href="/terms" className="text-champagne-gold/85 underline underline-offset-2 hover:text-champagne-gold">
          Terms of Use
        </Link>
        .
      </p>
    </aside>
  );

  if (variant === "inline") return <div className="mx-auto max-w-3xl">{note}</div>;

  return (
    <div className="bg-lux-black py-8 lg:py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">{note}</div>
    </div>
  );
}
