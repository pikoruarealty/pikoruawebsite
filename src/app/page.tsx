import type { Metadata } from "next";
import { env } from "@/lib/env";

// Layout
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

// Home sections
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedResidences } from "@/components/home/FeaturedResidences";
import { FounderTeaser } from "@/components/home/FounderTeaser";
import { TestimonialsTeaser } from "@/components/home/TestimonialsTeaser";
import { FinalCTABand } from "@/components/home/FinalCTABand";
import { LazyVirtualTours } from "@/components/home/LazyVirtualTours";
import { LocationGrid } from "@/components/home/LocationGrid";
import { PartnerMarquee } from "@/components/home/PartnerMarquee";
import { StatsStrip } from "@/components/ui/StatsStrip";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import type { FaqItem } from "@/lib/data/faq";
import { MEDIA } from "@/lib/media";
import { getSupabaseAboutPageContent, getPageSeoData, getSupabaseHomePageContent } from "@/lib/db/queries";
import { FOUNDER_NAME, DEFAULT_FOUNDER_STORY } from "@/lib/data/about";
import { getFirstSentence } from "@/lib/utils";
import { createMetadata, serializeJsonLd } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeoData("home");
  const defaultTitle = "Luxury Real Estate Consultants Ahmedabad";
  const defaultDesc =
    "Curated luxury properties in Ahmedabad for HNIs and NRIs. Private advisory for 4-5 BHK homes, penthouses, villas, plots and investments.";

  return createMetadata({
    title: seo?.seoTitle || defaultTitle,
    description: seo?.seoDescription || defaultDesc,
    path: "/",
    keywords: [
      "Luxury Real Estate Consultants in Ahmedabad for HNIs and NRIs",
      "luxury real estate consultants Ahmedabad",
      "HNI property consultant Ahmedabad",
      "NRI property consultant Ahmedabad",
      "private luxury property advisory Ahmedabad",
    ],
  });
}

export const revalidate = 86400;

// Shown on the page and marked up from the same list, so the FAQPage schema
// always matches visible content. Questions whose answers quote prices or
// rates were dropped from the homepage until those figures are sourced.
const HOMEPAGE_FAQS: FaqItem[] = [
  {
    question: "What is PIKORUA Realty?",
    answer:
      "PIKORUA Realty is Ahmedabad's private luxury residential real estate advisory. We curate exclusive apartments, penthouses, duplexes, villas, and bungalows for HNI and NRI buyers across premium corridors including Iskon-Ambli Road, Sindhu Bhavan Road, Thaltej, Shilaj, and SG Highway.",
  },
  {
    question: "Which areas in Ahmedabad does PIKORUA Realty cover?",
    answer:
      "PIKORUA Realty specialises in Ahmedabad's top luxury residential corridors: Iskon-Ambli Road (Billionaires' Row), Sindhu Bhavan Road, Thaltej, Shilaj, Vaishno Devi Circle, and SG Highway. These are the most sought-after addresses for HNI families and NRI buyers in Gujarat.",
  },
  {
    question: "Does PIKORUA Realty assist NRI buyers purchasing property in Ahmedabad?",
    answer:
      "Yes. PIKORUA Realty has extensive experience advising NRI clients — including Gujarati diaspora based in the US, UK, UAE, Canada, Singapore, and Australia — on purchasing residential property in Ahmedabad. We handle end-to-end advisory: property selection, legal due diligence, RERA verification, and transaction coordination.",
  },
  {
    question: "Does PIKORUA Realty list properties on 99acres or MagicBricks?",
    answer:
      "PIKORUA Realty operates as a private advisory and does not list properties on public portals like 99acres, MagicBricks, or Housing.com. Our curated collection is shared exclusively with registered clients who contact us directly. This ensures complete privacy for both buyers and sellers.",
  },
  {
    question: "How is luxury property valuation done in Ahmedabad?",
    answer:
      "Luxury property valuation in Ahmedabad considers comparable recent transactions in the same corridor, the property's floor, view, and specification quality, current market supply and qualified buyer depth, and any legal or structural factors affecting salability. PIKORUA Realty provides private valuation assessments for sellers and buyers as part of our advisory process — integrated into our representation model, not as a standalone service.",
  },
  {
    question: "How do I contact PIKORUA Realty to enquire about a luxury property in Ahmedabad?",
    answer:
      "You can reach PIKORUA Realty by WhatsApp, by emailing connect@pikorua.in, or by submitting an enquiry at pikorua.in/contact. We respond to all qualified enquiries within 24 hours and schedule a private consultation to understand your requirements before sharing curated options.",
  },
];

export default async function HomePage() {
  if (!env.SITE_LIVE) {
    return <HoldingPage />;
  }

  const [aboutContent, homeContent] = await Promise.all([
    getSupabaseAboutPageContent(),
    getSupabaseHomePageContent()
  ]);

  const founderStory = aboutContent?.founderStory?.length ? aboutContent.founderStory : DEFAULT_FOUNDER_STORY;
  const founderGlimpse = getFirstSentence(founderStory[0]);
  const founderAvatar = aboutContent?.founderAvatar || MEDIA.founder;

  // Dynamic hero content from database, falling back to static defaults
  const heroLines = homeContent?.heroHeadline1
    ? [homeContent.heroHeadline1, homeContent.heroHeadline2, homeContent.heroHeadline3].filter(Boolean)
    : ["Luxury Real Estate Consultants", "in Ahmedabad", "for HNIs and NRIs."];

  const heroVideo = homeContent?.heroVideoUrl || undefined;
  const heroPoster = "/images/hero-living.jpg";
  const stats = homeContent?.stats || undefined;
  const tours = homeContent?.virtualTours || undefined;

  const homepageFaqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: HOMEPAGE_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(homepageFaqSchema) }}
      />
      <Header />
      <main id="main-content">

        {/* bg video */}
        <HeroSection
          headlineLines={heroLines}
          videoUrl={heroVideo}
          posterUrl={heroPoster}
          mobilePosterUrl="/images/hero-mobile.jpg"
        />


        <FeaturedResidences />

        <LocationGrid />

        <PartnerMarquee partners={homeContent?.partners} />

        {/* About the Founder */}
        <FounderTeaser
          founderImageUrl={founderAvatar}
          founderName={FOUNDER_NAME}
          quote={founderGlimpse}
        />

        <StatsStrip stats={stats} pauseOnHover={false} size="sm" className="pt-0 lg:pt-0 border-t-0" />

        {/* Take a virtual tour of our exclusive luxury properties */}
        <LazyVirtualTours tours={tours} />

        {/* What Our Clients Say */}
        <TestimonialsTeaser />

        <section className="bg-lux-black py-16 lg:py-24 border-t border-white/[0.06]" aria-labelledby="home-faq-heading">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-2 flex flex-col items-center mb-10">
              <p className="text-[10px] uppercase tracking-[0.3em] text-champagne-gold font-sans font-medium">
                Common Questions
              </p>
              <div className="w-8 h-px bg-champagne-gold/50" aria-hidden="true" />
              <h2
                id="home-faq-heading"
                className="font-display text-[clamp(1.5rem,3vw,2rem)] font-light text-white uppercase tracking-wider text-center mt-2"
              >
                Frequently Asked Questions
              </h2>
            </div>
            <FaqAccordion items={HOMEPAGE_FAQS} />
          </div>
        </section>

        {/* Contact Us */}
        <FinalCTABand />

      </main>
      <Footer />
    </>
  );
}

// ─── Pre-launch Holding Page ─────────────────────────────────────────────────

function HoldingPage() {
  const whatsappUrl = `https://wa.me/${env.WHATSAPP_NUMBER.replace(/\D/g, "")}`;

  return (
    <main
      id="main-content"
      className="min-h-screen flex flex-col items-center justify-center bg-lux-black text-ivory px-6 py-16 text-center gap-6"
    >
      <p className="text-xs font-sans uppercase tracking-[0.2em] text-champagne-gold">
        PIKORUA Realty
      </p>
      <h1 className="font-display text-[clamp(1.75rem,4vw,3.5rem)] font-normal leading-[1.25] max-w-2xl">
        Ahmedabad&rsquo;s finest residences —<br />found quietly.
      </h1>
      <div className="w-10 h-px bg-champagne-gold/40" aria-hidden="true" />
      <p className="text-ivory/40 font-sans text-sm">
        In the meantime, reach us at{" "}
        <a
          href="mailto:connect@pikorua.in"
          className="text-champagne-gold hover:text-muted-gold transition-colors duration-150"
        >
          connect@pikorua.in
        </a>
      </p>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 px-7 py-3.5 border border-champagne-gold/50 text-champagne-gold text-xs font-sans tracking-[0.15em] uppercase hover:bg-champagne-gold hover:text-lux-black transition-all duration-200 focus-visible:outline-2 focus-visible:outline-champagne-gold"
      >
        Speak on WhatsApp
      </a>
    </main>
  );
}
