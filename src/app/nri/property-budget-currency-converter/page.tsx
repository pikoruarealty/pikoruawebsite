import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BudgetCurrencyConverter } from "@/components/nri/BudgetCurrencyConverter";
import { getExchangeRates } from "@/lib/exchange-rates";
import { ENTITY_IDS } from "@/lib/entity-profile";
import { absoluteUrl, createMetadata, serializeJsonLd, SITE_URL } from "@/lib/seo";

const PATH = "/nri/property-budget-currency-converter";

// Rates are fetched hourly (src/lib/exchange-rates.ts); re-render on the same cadence.
export const revalidate = 3600;

export const metadata: Metadata = createMetadata({
  title: "NRI Budget Converter: Crore to USD, GBP, AED",
  description:
    "Convert a property budget between crore or lakh and US dollars, pounds, dirhams and other currencies, then see Ahmedabad homes in that range.",
  path: PATH,
});

const CRORE = 10_000_000;
const TABLE_CRORES = [1, 2, 5, 10];
const TABLE_CURRENCIES = [
  { code: "USD", name: "US dollars" },
  { code: "GBP", name: "pounds" },
  { code: "AED", name: "dirhams" },
] as const;

const BUDGET_LINKS = [
  { href: "/nri/best-properties-in-ahmedabad-under-2-crore-for-nris", label: "Homes under ₹2 crore for NRIs" },
  { href: "/invest/luxury-property-ahmedabad-below-3-crore", label: "Luxury homes below ₹3 crore" },
  { href: "/invest/luxury-homes-ahmedabad-3-to-5-crore", label: "Luxury homes from ₹3 to ₹5 crore" },
  { href: "/invest/luxury-properties-ahmedabad-5-to-10-crore", label: "Luxury properties from ₹5 to ₹10 crore" },
  { href: "/invest/ahmedabad-penthouses-above-15-crore", label: "Penthouses above ₹15 crore" },
];

const money = (amount: number, code: string) =>
  amount.toLocaleString("en-US", { style: "currency", currency: code, maximumFractionDigits: 0 });

export default async function PropertyBudgetCurrencyConverterPage() {
  const { rates, isLive } = await getExchangeRates();
  const pageUrl = absoluteUrl(PATH);
  const asOf = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });

  const faqs = [
    ...TABLE_CURRENCIES.map(({ code, name }) => ({
      question: `How much is 1 crore rupees in ${name}?`,
      answer: `At the indicative rate used on this page (${asOf}), ₹1 crore is about ${money(CRORE / rates[code], code)}. Your bank's rate on the day of transfer will differ slightly and may include charges.`,
    })),
    {
      question: "Which exchange rate applies when an NRI pays for a property?",
      answer:
        "The rate your bank applies when the funds are converted, on the day of the transfer. Payment must reach India through banking channels: an inward remittance, or a debit to an NRE, FCNR(B) or NRO account (RBI FAQ on purchase of immovable property, updated 6 April 2023).",
    },
    {
      question: "Should I wait for a better exchange rate before buying?",
      answer:
        "Nobody can reliably predict currency movements. Decide on the property and the budget first, and discuss timing and hedging options with your bank.",
    },
  ];

  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: "NRI Property Budget Currency Converter",
    description: "Convert property budgets between crore or lakh and foreign currencies at indicative rates.",
    about: { "@id": ENTITY_IDS.realEstateAgent },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "NRI", item: absoluteUrl("/nri") },
      { "@type": "ListItem", position: 3, name: "Budget Converter", item: pageUrl },
    ],
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
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
            <p className="text-[10px] uppercase tracking-[0.25em] text-champagne-gold font-sans mb-4">NRI Tools · PIKORUA Realty</p>
            <h1 className="font-display text-[clamp(1.75rem,4vw,2.75rem)] font-light uppercase tracking-wider">
              NRI Property Budget Converter
            </h1>
            <p className="mt-5 max-w-2xl text-sm sm:text-base text-ivory/60 font-sans leading-relaxed">
              Convert a property budget between crore or lakh and US dollars, pounds, dirhams and other currencies, then see Ahmedabad homes in that range. Rates are indicative
              {isLive ? ", refreshed about every hour" : " (live rates were unavailable, so stored reference rates are shown)"}; your bank&rsquo;s rate on the day of transfer will differ.
            </p>
            <div className="mt-10">
              <BudgetCurrencyConverter rates={rates} />
            </div>
          </div>
        </section>

        <section className="pb-14 border-t border-white/[0.06] pt-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-lg uppercase tracking-wider text-ivory">Common property budgets in foreign currency</h2>
            <p className="mt-2 text-xs text-ivory/45 font-sans">Indicative rates as of {asOf}.</p>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm font-sans text-ivory/75 border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08] text-[10px] uppercase tracking-[0.15em] text-ivory/50">
                    <th className="py-3 pr-4 font-normal">Budget</th>
                    {TABLE_CURRENCIES.map((c) => (
                      <th key={c.code} className="py-3 pr-4 font-normal">{c.code}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TABLE_CRORES.map((cr) => (
                    <tr key={cr} className="border-b border-white/[0.04]">
                      <td className="py-3 pr-4 text-ivory">₹{cr} crore</td>
                      {TABLE_CURRENCIES.map((c) => (
                        <td key={c.code} className="py-3 pr-4">{money((cr * CRORE) / rates[c.code], c.code)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="pb-14 border-t border-white/[0.06] pt-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="font-display text-lg uppercase tracking-wider text-ivory">What your budget buys</h2>
              <ul className="mt-4 space-y-2 text-sm font-sans">
                {BUDGET_LINKS.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-champagne-gold/90 hover:text-champagne-gold underline underline-offset-4 decoration-champagne-gold/30">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-display text-lg uppercase tracking-wider text-ivory">Paying from abroad</h2>
              <p className="mt-4 text-sm text-ivory/60 font-sans leading-relaxed">
                Funds for a property in India must arrive through banking channels: an inward remittance, or a debit to your NRE, FCNR(B) or NRO account. Keep every remittance record; you will need them if you later sell and repatriate the proceeds. See{" "}
                <Link href="/nre-vs-nro-property-payment" className="text-champagne-gold/90 hover:text-champagne-gold underline underline-offset-4">NRE vs NRO for property payments</Link>{" "}
                and{" "}
                <Link href="/nri/nri-property-eligibility-fema" className="text-champagne-gold/90 hover:text-champagne-gold underline underline-offset-4">what NRIs and OCIs may buy</Link>.
              </p>
            </div>
          </div>
        </section>

        <section className="pb-20 border-t border-white/[0.06] pt-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-lg uppercase tracking-wider text-ivory">Questions</h2>
            <div className="mt-6 divide-y divide-white/[0.06]">
              {faqs.map((f) => (
                <div key={f.question} className="py-4">
                  <h3 className="text-sm text-ivory/85 font-sans">{f.question}</h3>
                  <p className="mt-2 text-sm text-ivory/55 font-sans leading-relaxed">{f.answer}</p>
                </div>
              ))}
            </div>
            <p className="mt-8 text-xs text-ivory/40 font-sans leading-relaxed">
              Exchange rates are indicative and for planning only; they are not an offer, a forecast or financial advice. Confirm the applicable rate and charges with your bank before transferring funds.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
