import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import type { ContentHubPage } from "@/lib/data/content-hubs";

export function ContentClusterIndex({
  title,
  eyebrow,
  description,
  pages,
  tools = [],
}: {
  title: string;
  eyebrow: string;
  description: string;
  pages: ContentHubPage[];
  /** Interactive tools shown before the guides, in the same card style. */
  tools?: { href: string; title: string; description: string }[];
}) {
  return (
    <>
      <Header alwaysSolid />
      <main id="main-content" className="min-h-screen bg-lux-black text-ivory">
        <section className="border-b border-white/[0.07] pb-16 pt-32 sm:pt-40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-[10px] uppercase tracking-[0.25em] text-champagne-gold">{eyebrow}</p>
            <h1 className="mt-5 max-w-4xl font-display text-4xl font-light uppercase tracking-wider sm:text-6xl">
              {title}
            </h1>
            <p className="mt-7 max-w-3xl text-base leading-relaxed text-ivory/60">{description}</p>
          </div>
        </section>
        <section className="py-16 lg:py-24">
          <div className="mx-auto grid max-w-7xl gap-px bg-white/[0.07] px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group min-h-64 bg-lux-black p-7 transition-colors hover:bg-soft-black"
              >
                <p className="text-[9px] uppercase tracking-[0.2em] text-champagne-gold/60">Tool</p>
                <h2 className="mt-5 font-display text-xl uppercase leading-snug tracking-wide group-hover:text-champagne-gold">
                  {tool.title}
                </h2>
                <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-ivory/48">{tool.description}</p>
                <span className="mt-7 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-champagne-gold/65">
                  Open tool <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            ))}
            {pages.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className="group min-h-64 bg-lux-black p-7 transition-colors hover:bg-soft-black"
              >
                <p className="text-[9px] uppercase tracking-[0.2em] text-champagne-gold/60">
                  {page.eyebrow.split("·")[0].trim()}
                </p>
                <h2 className="mt-5 font-display text-xl uppercase leading-snug tracking-wide group-hover:text-champagne-gold">
                  {page.h1}
                </h2>
                <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-ivory/48">{page.description}</p>
                <span className="mt-7 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-champagne-gold/65">
                  Read decision guide <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
