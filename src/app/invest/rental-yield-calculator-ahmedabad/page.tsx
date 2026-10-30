import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RentalYieldCalculator } from "@/components/invest/RentalYieldCalculator";
import { ENTITY_IDS } from "@/lib/entity-profile";
import { absoluteUrl, createMetadata, serializeJsonLd, SITE_URL } from "@/lib/seo";

const PATH = "/invest/rental-yield-calculator-ahmedabad";

export const metadata: Metadata = createMetadata({
  title: "Rental Yield Calculator for Ahmedabad",
  description:
    "Work out the gross and net rental yield of an Ahmedabad property from your own price, rent, maintenance, tax, vacancy and buying costs.",
  path: PATH,
});

const FAQS = [
  {
    question: "What is rental yield?",
    answer:
      "Rental yield is the rent a property earns in a year as a percentage of what it cost. Gross yield uses the full annual rent and the price; net yield deducts vacancy and owner costs and divides by the price plus buying costs.",
  },
  {
    question: "How do I calculate net rental yield?",
    answer:
      "Take the rent you expect to collect in a year after vacant months, subtract maintenance, property tax and other owner costs, then divide by the purchase price plus stamp duty, registration and other buying costs, and multiply by 100.",
  },
  {
    question: "What is a good rental yield in Ahmedabad?",
    answer:
      "There is no single good figure: it depends on the property, the tenant, the location and your costs, and rents and prices change. Compare a property's net yield with your own alternatives after tax, and remember that no rental income is guaranteed.",
  },
  {
    question: "Does this calculator include income tax or a home loan?",
    answer:
      "No. It shows yield before income tax and loan payments. Ask a chartered accountant how rental income would be taxed in your case, especially if you live outside India.",
  },
];

export default function RentalYieldCalculatorPage() {
  const pageUrl = absoluteUrl(PATH);
  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: "Rental Yield Calculator for Ahmedabad Property",
    description: "Calculate gross and net rental yield from your own property figures.",
    about: { "@id": ENTITY_IDS.realEstateAgent },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Invest", item: absoluteUrl("/invest") },
      { "@type": "ListItem", position: 3, name: "Rental Yield Calculator", item: pageUrl },
    ],
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(pageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqSchema) }} />
      <Header alwaysSolid />
      <main id="main-content" className="bg-lux-black text-ivory min-h-screen">
        <section className="pt-28 pb-12 lg:pt-36">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <p className="text-[10px] uppercase tracking-[0.25em] text-champagne-gold font-sans mb-4">Investor Tools · PIKORUA Realty</p>
            <h1 className="font-display text-[clamp(1.75rem,4vw,2.75rem)] font-light uppercase tracking-wider">
              Rental Yield Calculator
            </h1>
            <p className="mt-5 max-w-2xl text-sm sm:text-base text-ivory/60 font-sans leading-relaxed">
              Work out what an Ahmedabad property would really earn as a rental: gross yield, net yield after vacancy and owner costs, and net income per year. Use the figures for the specific property and lease you are considering.
            </p>
            <div className="mt-10">
              <RentalYieldCalculator />
            </div>
          </div>
        </section>

        <section className="pb-14 border-t border-white/[0.06] pt-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="font-display text-lg uppercase tracking-wider text-ivory">Gross vs net yield</h2>
              <p className="mt-4 text-sm text-ivory/60 font-sans leading-relaxed">
                Gross yield is quick to compare but leaves out the months a home sits empty and the costs an owner pays. Net yield is the better guide to what you keep. Two properties with the same rent can have very different net yields once maintenance, tax and buying costs are included.
              </p>
            </div>
            <div>
              <h2 className="font-display text-lg uppercase tracking-wider text-ivory">Related guides</h2>
              <ul className="mt-4 space-y-2 text-sm font-sans">
                {[
                  { href: "/ahmedabad/luxury-flats/rental-income", label: "Luxury flats for rental income" },
                  { href: "/nri/high-rental-yield-properties-in-ahmedabad-for-nris", label: "Rental-yield properties for NRIs" },
                  { href: "/learn/what-is-preleased-property", label: "What is a preleased property?" },
                  { href: "/investment-property-ahmedabad", label: "Investment property in Ahmedabad" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-champagne-gold/90 hover:text-champagne-gold underline underline-offset-4 decoration-champagne-gold/30">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="pb-20 border-t border-white/[0.06] pt-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-lg uppercase tracking-wider text-ivory">Questions</h2>
            <div className="mt-6 divide-y divide-white/[0.06]">
              {FAQS.map((f) => (
                <div key={f.question} className="py-4">
                  <h3 className="text-sm text-ivory/85 font-sans">{f.question}</h3>
                  <p className="mt-2 text-sm text-ivory/55 font-sans leading-relaxed">{f.answer}</p>
                </div>
              ))}
            </div>
            <p className="mt-8 text-xs text-ivory/40 font-sans leading-relaxed">
              This calculator is a planning aid using the figures you enter. It is not investment or tax advice, and no rental income or return is guaranteed.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
