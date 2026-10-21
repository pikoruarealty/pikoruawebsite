import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ContactHero } from "@/components/contact/ContactHero";
import { ContactFormSection } from "@/components/contact/ContactFormSection";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { FAQ_ITEMS } from "@/lib/data/faq";
import { createMetadata, serializeJsonLd } from "@/lib/seo";
import { getPageSeoData, getSupabaseGeneralFaqs } from "@/lib/db/queries";
import type { LeadPurpose, GeneralFaq } from "@/types";

// ─── URL purpose → LeadPurpose mapping ───────────────────────────────────────
// ?purpose=buy → self-use, ?purpose=sell → selling, etc.

const PURPOSE_MAP: Record<string, LeadPurpose> = {
  buy:     "self-use",
  sell:    "selling",
  nri:     "nri-purchase",
  invest:  "investment",
  explore: "exploring",
  "luxury-advisory":     "exploring",
  "real-estate-advisory": "exploring",
};

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeoData("contact");
  const defaultTitle = "Private Real Estate Consultation";
  const defaultDesc = "Begin a private conversation with PIKORUA Realty. Whether you're looking to buy, sell, or invest in Ahmedabad's finest residential properties — we respond personally.";

  return createMetadata({
    title: seo?.seoTitle || defaultTitle,
    description: seo?.seoDescription || defaultDesc,
    path: "/contact",
  });
}

interface ContactPageProps {
  searchParams: Promise<{ purpose?: string }>;
}



/**
 * HowTo schema for the NRI residential property purchase process.
 * Targets high-intent AEO queries like "How do NRIs buy property in Ahmedabad?"
 * Google uses HowTo schema to display step-by-step featured snippets and
 * AI Overview answer cards — this is the primary AEO opportunity on the site.
 */
const nriHowToSchema = {
  "@type": "HowTo",
  name: "How to Buy Residential Property in Ahmedabad as an NRI",
  description:
    "A step-by-step guide for Non-Resident Indians (NRIs) purchasing luxury residential property in Ahmedabad, covering FEMA compliance, NRE/NRO banking, Power of Attorney, TDS, stamp duty, and possession.",
  totalTime: "PT8W",
  estimatedCost: {
    "@type": "MonetaryAmount",
    currency: "INR",
    value: "30000000",
  },
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Establish Your Property Brief and Budget",
      text: "Define your requirement — configuration (4 BHK, 5 BHK, penthouse, villa), corridor preference (Sindhu Bhavan Road, Iskon-Ambli, Thaltej), possession timeline, and budget. Share your brief with PIKORUA Realty's private advisory desk to receive a curated shortlist of pre-vetted properties, including off-market options not available on public portals.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Set Up Your NRE or NRO Bank Account",
      text: "All property payments must be routed through an NRE (Non-Resident External) or NRO (Non-Resident Ordinary) account in Indian Rupees as mandated by FEMA (Foreign Exchange Management Act). Direct foreign currency payments or cash transactions are prohibited. If you do not have an active NRE/NRO account, your banker in India or our advisory team can guide setup with partner institutions.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Execute a Special Power of Attorney (POA)",
      text: "NRIs who cannot travel to India for each transaction stage should execute a Special Power of Attorney (SPOA) in favor of a trusted local representative. The POA must be signed and attested by the Indian Consulate or Embassy in your country of residence. It must then be notarised, apostilled (if applicable), and registered in India within three months of receipt.",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Conduct Title Verification and RERA Due Diligence",
      text: "Before signing any agreement, a title search by a qualified property lawyer is essential. For under-construction projects in Gujarat, verify the RERA (GujRERA) registration number, approved drawings, declared completion timeline, and escrow account compliance. PIKORUA Realty coordinates all legal verification through its panel of Ahmedabad-based property solicitors.",
    },
    {
      "@type": "HowToStep",
      position: 5,
      name: "Sign the Sale Agreement and Manage TDS",
      text: "Upon agreeing on price and terms, sign a registered Sale Agreement. If purchasing from a resident Indian seller, deduct TDS at 1% under Section 194-IA if the property value exceeds ₹50 Lakhs. If the seller is also an NRI, TDS under Section 195 applies (20%–30% depending on capital gains type). Deposit the TDS with the government and obtain Form 16B within 15 days.",
    },
    {
      "@type": "HowToStep",
      position: 6,
      name: "Complete Stamp Duty, Registration, and Possession",
      text: "Pay stamp duty (typically 4.9% in Gujarat, with concessions for female buyers) and 1% registration fee at the Sub-Registrar office. The sale deed is registered in your name. For NRIs, your POA holder can complete registration. After possession, PIKORUA Realty can assist with property management, rental, and future resale advisory.",
    },
  ],
};


export default async function ContactPage({ searchParams }: ContactPageProps) {
  const { purpose: rawPurpose } = await searchParams;
  const purposeKey = rawPurpose?.toLowerCase() ?? "";
  const initialPurpose: LeadPurpose | "" = PURPOSE_MAP[purposeKey] ?? "";

  let dbFaqs: GeneralFaq[] = [];
  try {
    dbFaqs = await getSupabaseGeneralFaqs();
  } catch (err) {
    console.error("Error fetching general FAQs for contact page:", err);
  }

  const categoryFaqs = dbFaqs.filter((f) => f.category === "general");
  const finalFaqs = categoryFaqs.length > 0 ? categoryFaqs : FAQ_ITEMS;

  const faqSchema = {
    "@type": "FAQPage",
    mainEntity: finalFaqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [
      faqSchema,
      nriHowToSchema,
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(combinedSchema) }}
      />
      <Header alwaysSolid />
      <main>
        <ContactHero purpose={purposeKey} />
        <ContactFormSection initialPurpose={initialPurpose} />
        <section className="bg-lux-black py-16 lg:py-24 border-t border-white/[0.06]" aria-labelledby="faq-heading">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-2 flex flex-col items-center mb-10">
              <p className="text-[10px] uppercase tracking-[0.3em] text-champagne-gold font-sans font-medium">
                Common Questions
              </p>
              <div className="w-8 h-px bg-champagne-gold/50" aria-hidden="true" />
              <h2
                id="faq-heading"
                className="font-display text-[clamp(1.5rem,3vw,2rem)] font-light text-white uppercase tracking-wider text-center mt-2"
              >
                Frequently Asked Questions
              </h2>
            </div>
            <FaqAccordion items={finalFaqs} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
