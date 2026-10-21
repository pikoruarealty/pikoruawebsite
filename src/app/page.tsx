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
    mainEntity: [
      {
        "@type": "Question",
        name: "What is PIKORUA Realty?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "PIKORUA Realty is Ahmedabad's private luxury residential real estate advisory. We curate exclusive apartments, penthouses, duplexes, villas, and bungalows for HNI and NRI buyers across premium corridors including Iskon-Ambli Road, Sindhu Bhavan Road, Thaltej, Shilaj, and SG Highway.",
        },
      },
      {
        "@type": "Question",
        name: "Which areas in Ahmedabad does PIKORUA Realty cover?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "PIKORUA Realty specialises in Ahmedabad's top luxury residential corridors: Iskon-Ambli Road (Billionaires' Row), Sindhu Bhavan Road, Thaltej, Shilaj, Vaishno Devi Circle, and SG Highway. These are the most sought-after addresses for HNI families and NRI buyers in Gujarat.",
        },
      },
      {
        "@type": "Question",
        name: "Does PIKORUA Realty assist NRI buyers purchasing property in Ahmedabad?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. PIKORUA Realty has extensive experience advising NRI clients — including Gujarati diaspora based in the US, UK, UAE, Canada, Singapore, and Australia — on purchasing residential property in Ahmedabad. We handle end-to-end advisory: property selection, legal due diligence, RERA verification, and transaction coordination.",
        },
      },
      {
        "@type": "Question",
        name: "What types of luxury properties are available in Ahmedabad?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "PIKORUA Realty's curated collection includes 3 BHK, 4 BHK, and 5 BHK luxury apartments, duplex penthouses, sky villas, independent bungalows, and premium residential plots — all in Ahmedabad's most exclusive western corridors. Properties range from ₹2.5 crore to over ₹15 crore.",
        },
      },
      {
        "@type": "Question",
        name: "How do I find the best luxury real estate agent in Ahmedabad?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "PIKORUA Realty is a trusted luxury property consultancy in Ahmedabad, specialising in premium residential real estate for HNI and NRI buyers. Unlike large portals, we work with a select number of clients at a time, ensuring deeply personalised advisory. You can reach us via WhatsApp, email at connect@pikorua.in, or by filling our private consultation form at pikorua.in/contact.",
        },
      },
      {
        "@type": "Question",
        name: "What is the price of luxury apartments on Iskon-Ambli Road, Ahmedabad?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Premium apartments on Iskon-Ambli Road, Ahmedabad currently trade between ₹11,000 and ₹15,000 per sq.ft. A typical 4 BHK of 3,500–4,500 sq.ft ranges from ₹4 crore to ₹7 crore. Larger penthouses and sky villas can exceed ₹10 crore. Prices vary by floor, tower, and developer. Contact PIKORUA Realty for current off-market availability.",
        },
      },
      {
        "@type": "Question",
        name: "Does PIKORUA Realty list properties on 99acres or MagicBricks?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "PIKORUA Realty operates as a private advisory and does not list properties on public portals like 99acres, MagicBricks, or Housing.com. Our curated collection is shared exclusively with registered clients who contact us directly. This ensures complete privacy for both buyers and sellers.",
        },
      },
      {
        "@type": "Question",
        name: "How do I contact PIKORUA Realty to enquire about a luxury property in Ahmedabad?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can reach PIKORUA Realty by WhatsApp, by emailing connect@pikorua.in, or by submitting an enquiry at pikorua.in/contact. We respond to all qualified enquiries within 24 hours and schedule a private consultation to understand your requirements before sharing curated options.",
        },
      },
      {
        "@type": "Question",
        name: "Who is the best luxury real estate consultant in Ahmedabad?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "PIKORUA Realty, founded by Jitendra Pareek, is a specialist luxury property consultancy in Ahmedabad — operating as a private advisory rather than a portal or high-volume brokerage. We provide personalised advisory to a selective number of HNI and NRI clients at any given time. Reach out via pikorua.in/contact for a private consultation.",
        },
      },
      {
        "@type": "Question",
        name: "Does PIKORUA Realty offer NRI property advisory in Ahmedabad?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. PIKORUA Realty is a specialist NRI property consultant in Ahmedabad. We guide Gujarati and Indian NRI clients based in the US, UK, UAE, Canada, Singapore, and Australia through the full process of identifying, evaluating, and acquiring luxury residential properties in Ahmedabad — remotely and securely, including Power of Attorney facilitation, NRE/NRO fund routing guidance, and RERA verification.",
        },
      },
      {
        "@type": "Question",
        name: "Which is the best area to buy luxury property in Ahmedabad?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The strongest luxury residential corridors in Ahmedabad are Iskon-Ambli Road (highest price per sq.ft., most sought-after for penthouses and sky mansions), Sindhu Bhavan Road (established prestige, strong bungalow and large-apartment market), and Thaltej (growing corridor with strong value and connectivity). The right choice depends on property type, lifestyle needs, commute, and investment horizon. PIKORUA Realty provides detailed corridor comparison during private advisory.",
        },
      },
      {
        "@type": "Question",
        name: "What is the average price of a luxury 4 BHK in Ahmedabad?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A luxury 4 BHK apartment in Ahmedabad typically prices between ₹3.5 Crore and ₹8 Crore depending on corridor, building specification, and floor. On Iskon-Ambli Road, 4 BHK apartments of 3,000–4,500 sq.ft. trade at ₹4 Crore to ₹8 Crore. On Sindhu Bhavan Road, equivalent units range from ₹3.5 Crore to ₹7 Crore. In Thaltej, quality 4 BHK apartments price from ₹2.5 Crore to ₹5 Crore.",
        },
      },
      {
        "@type": "Question",
        name: "Is Sindhu Bhavan Road a good location to buy property in Ahmedabad?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Sindhu Bhavan Road (SBR) is one of Ahmedabad's most established and recognised luxury addresses. It offers a strong mix of large-format apartments, penthouses, and independent bungalow estates, and is well-connected to premium dining, private schools, and the SG Highway business belt. For buyers who value a mature, prestigious address with strong resale depth, SBR is one of the strongest choices in the city.",
        },
      },
      {
        "@type": "Question",
        name: "Is Iscon Ambli Road good for luxury real estate investment in Ahmedabad?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Iscon-Ambli Road is Ahmedabad's highest-priced luxury residential corridor and commands consistently strong demand from HNI buyers and NRIs. Premium apartments here trade between ₹11,000 and ₹15,000 per sq.ft. The corridor's combination of address prestige, building quality, and scarcity makes it a strong long-term investment, particularly for penthouses and large-format 4 BHK and 5 BHK floor plates.",
        },
      },
      {
        "@type": "Question",
        name: "What is better for luxury living: SBR or Thaltej in Ahmedabad?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sindhu Bhavan Road (SBR) is better for buyers who want an established, centrally connected luxury address with a mix of apartments and bungalows in a mature neighbourhood. Thaltej is better for buyers who want a quieter, more spacious residential environment at a lower price per sq.ft. while still within 10 minutes of the SG Highway corridor. SBR has stronger resale brand recognition; Thaltej offers better value-to-quality ratio at present.",
        },
      },
      {
        "@type": "Question",
        name: "Should I buy a ready possession or under-construction luxury home in Ahmedabad?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ready possession homes allow you to inspect the finished quality before committing and eliminate construction risk — ideal for end-users who want immediate occupancy. Under-construction homes offer entry at 15–25% below ready possession prices in the same building, but require confidence in the developer's track record and a 2–4 year timeline. PIKORUA Realty evaluates both options during private advisory.",
        },
      },
      {
        "@type": "Question",
        name: "Which locations in Ahmedabad have the best rental yield for luxury property?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Iskon-Ambli Road and Sindhu Bhavan Road consistently produce the strongest rental yields for luxury residential property in Ahmedabad, with premium furnished 4 BHK and 5 BHK apartments renting at ₹50,000–₹1,50,000 per month. Thaltej and Vastrapur offer strong yields from the senior executive and healthcare professional tenant profile.",
        },
      },
      {
        "@type": "Question",
        name: "How do I sell my luxury apartment in Ahmedabad?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Selling a luxury apartment in Ahmedabad works best through private, relationship-led advisory rather than public portal exposure. Public listings attract unqualified enquiries, extend marketing timelines, and can erode perceived value through overexposure. PIKORUA Realty represents luxury sellers through a discreet model — presenting the property to a curated shortlist of pre-qualified buyers without public listing. Contact us at pikorua.in/contact to discuss seller representation.",
        },
      },
      {
        "@type": "Question",
        name: "How is luxury property valuation done in Ahmedabad?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Luxury property valuation in Ahmedabad considers comparable recent transactions in the same corridor, the property's floor, view, and specification quality, current market supply and qualified buyer depth, and any legal or structural factors affecting salability. PIKORUA Realty provides private valuation assessments for sellers and buyers as part of our advisory process — integrated into our representation model, not as a standalone service.",
        },
      },
      {
        "@type": "Question",
        name: "Which real estate developers does PIKORUA Realty partner with in Ahmedabad?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "PIKORUA Realty advises on premium properties from Ahmedabad's leading real estate developers, including Adani Realty, Venus Infrastructure, Goyal & Co., The Capstone Developers, Swati Procon, HN Safal, Godrej Properties, Sun Builders, Shaligram Group, Maruti Group, Triveni Group, Gala Group, Constera Realty, A. Shridhar, Satyamev Group, and Ravi Desai Group. As an independent consultancy, we provide unbiased, relationship-led guidance rather than promoting any single builder's inventory.",
        },
      },
    ],
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
