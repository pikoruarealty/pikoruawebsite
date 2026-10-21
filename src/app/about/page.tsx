import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StatsStrip } from "@/components/ui/StatsStrip";
import { MEDIA } from "@/lib/media";
import { getSupabaseAboutPageContent, getPageSeoData } from "@/lib/db/queries";
import { FOUNDER_NAME, DEFAULT_HERO_TITLE, DEFAULT_FOUNDER_STORY } from "@/lib/data/about";
import {
  ENTITY_IDS,
  getAhmedabadAreaServedSchema,
  getGeoCoordinatesSchema,
  getPostalAddressSchema,
} from "@/lib/entity-profile";
import { absoluteUrl, createMetadata, serializeJsonLd, SITE_URL } from "@/lib/seo";
import { cn, renderFormattedText } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeoData("about");
  const defaultTitle = "About the Private Luxury Advisory";
  const defaultDesc = "PIKORUA Realty is Ahmedabad's private luxury real estate advisory with a strong residential-first focus, founded on discretion, deep location intelligence, and the belief that the finest properties deserve a quieter way to be found.";

  return createMetadata({
    title: seo?.seoTitle || defaultTitle,
    description: seo?.seoDescription || defaultDesc,
    path: "/about",
    image: MEDIA.founder,
  });
}

// ISR: re-render at most every hour.
// Admin actions call revalidatePath("/about") on every save, so the cache is
// flushed immediately whenever about content actually changes.
export const revalidate = 86400;

const ABOUT_INTRO_COPY =
  "At PIKORUA Realty, we do not just deal in luxury real estate — we define it. Founded by Jitendra, a name built on trust, ethics, and expertise, we are among Ahmedabad’s most respected luxury real estate consultancies, known for creating meaningful relationships and delivering long-term value through every interaction. Our name, PIKORUA, is inspired by the Māori symbol of infinity, representing endless trust, lasting relationships, and a continuous journey of growth.";

const INFINITY_SENTENCE =
  "Our name, PIKORUA, is inspired by the Māori symbol of infinity, representing endless trust, lasting relationships, and a continuous journey of growth.";

const ARRIVAL_SENTENCE_PATTERN =
  /(At PIKORUA Realty,\s+luxury isn['’]t just where you live\s*[-—]\s*it's how you feel when you arrive home\.)/;

const withApprovedAudienceLanguage = (paragraph: string) =>
  paragraph
    .replace(
      /HNWIs,\s*NRIs,\s*(?:celebrities,\s*)?and elite families/gi,
      "business leaders, public figures, NRIs and discerning families"
    )
    .replace(
      /Trusted by Elites,\s*Celebrities\s*&\s*NRIs\.?/gi,
      "Trusted by business leaders, public figures, NRIs and discerning families."
    );

const PRINCIPLES = [
  {
    label: "TRUST",
    body: [
      "We are advisors before we are sellers.",
      "Every recommendation is guided by your interests, not commissions. Our reputation is built on relationships that last long after the transaction is complete.",
    ],
  },
  {
    label: "CURATION",
    body: [
      "Luxury is not about more options.",
      "It is about the right options.",
      "We shortlist only a select few properties that genuinely match your lifestyle, aspirations, and investment objectives.",
    ],
  },
  {
    label: "DISCRETION",
    body: [
      "Privacy is a luxury.",
      "Your search, negotiations, investment decisions, and personal information remain confidential at every stage.",
    ],
  },
  {
    label: "ACCESS",
    body: [
      "Opportunities others hear about later.",
      "From invitation-only launches and private inventories to off-market opportunities, we provide access to properties that are not always available to the public.",
    ],
  },
  {
    label: "REPRESENTATION",
    body: [
      "A trusted voice at your side.",
      "From negotiations and due diligence to documentation and possession, we represent your interests throughout the journey.",
    ],
  },
  {
    label: "RELATIONSHIPS",
    body: [
      "Beyond the transaction.",
      "Many clients become friends. We stay connected long after possession, assisting with future investments, referrals, and strategic real estate decisions.",
    ],
  },
];

export default async function AboutPage() {
  const dbContent = await getSupabaseAboutPageContent();

  const heroTitle = dbContent?.heroTitle || DEFAULT_HERO_TITLE;
  const founderAvatar = dbContent?.founderAvatar || MEDIA.founder;
  const founderStory = (dbContent?.founderStory || DEFAULT_FOUNDER_STORY).map((paragraph, index) =>
    index === 0 ? ABOUT_INTRO_COPY : withApprovedAudienceLanguage(paragraph)
  );
  const principles = (dbContent?.principles && dbContent.principles.length > 0)
    ? dbContent.principles
    : PRINCIPLES;

  const renderTitle = (title: string) => {
    const parts = title.split(/(PIKORUA)/i);
    return parts.map((part, index) => 
      part.toUpperCase() === "PIKORUA" ? (
        <span key={index} className="text-transparent bg-clip-text bg-gradient-to-r from-champagne-gold via-antique-gold to-champagne-gold font-normal">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const aboutSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        // Full RealEstateAgent entity — re-declares core fields on this page
        // so the about page can independently anchor the entity
        "@type": ["RealEstateAgent", "LocalBusiness"],
        "@id": ENTITY_IDS.realEstateAgent,
        name: "PIKORUA Realty",
        url: SITE_URL,
        image: absoluteUrl(founderAvatar),
        description:
          "Private luxury residential real estate advisory founded by Jitendra Pareek. We curate exclusive apartments, penthouses, villas, and bungalows for HNI and NRI buyers across Ahmedabad's premier western corridors.",
        areaServed: getAhmedabadAreaServedSchema(),
        address: getPostalAddressSchema(),
        geo: getGeoCoordinatesSchema(),
        knowsAbout: [
          "Luxury residential real estate in Ahmedabad",
          "HNI property advisory Gujarat",
          "NRI property purchase India FEMA compliance",
          "Off-market luxury property advisory",
          "Sindhu Bhavan Road property market",
          "Iskon-Ambli Road luxury apartments",
          "Thaltej Shilaj premium residential corridors",
          "5 BHK luxury apartments Ahmedabad",
          "Penthouse duplex advisory western Ahmedabad",
          "Private seller representation luxury real estate",
        ],
        founder: {
          "@type": "Person",
          "@id": ENTITY_IDS.founder,
        },
      },
      {
        // Rich Person entity for Jitendra — allows AI engines to build
        // a knowledge-graph node for the founder independently of the firm
        "@type": "Person",
        "@id": ENTITY_IDS.founder,
        name: FOUNDER_NAME,
        jobTitle: "Founder & Managing Director",
        description:
          "Jitendra Pareek is the founder of PIKORUA Realty, Ahmedabad's private luxury residential real estate advisory. He specialises in curating off-market 4 BHK and 5 BHK apartments, penthouses, villas, and bungalows for HNI and NRI buyers across western Ahmedabad's premium corridors.",
        image: absoluteUrl(founderAvatar),
        url: absoluteUrl("/about"),
        worksFor: {
          "@type": "RealEstateAgent",
          "@id": ENTITY_IDS.realEstateAgent,
          name: "PIKORUA Realty",
        },
        knowsAbout: [
          "Luxury real estate advisory Ahmedabad",
          "NRI property transactions India",
          "FEMA compliance residential property",
          "Off-market property advisory",
          "Western Ahmedabad residential corridors",
          "High net worth individual real estate",
          "Private real estate consultation Gujarat",
        ],
        sameAs: [
          "https://www.instagram.com/pikorua.realty?igsh=MTN5d2NmNW1yY3Vvag==",
          "https://www.linkedin.com/company/pikorua-realty/posts/?feedView=all",
          "https://www.linkedin.com/in/jitendra-k-p-0b237021b/",
        ],
      },
    ],
  };


  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(aboutSchema) }}
      />
      <Header alwaysSolid />
      <main id="main-content" className="relative bg-lux-black overflow-hidden">
        <section className="pt-32 pb-14 lg:pt-40 lg:pb-20 relative z-10 border-b border-white/[0.04]" aria-labelledby="about-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
              {/* Portrait */}
              <div className="lg:col-span-5 relative w-full max-w-md aspect-[5/6] mx-auto lg:mx-0 overflow-hidden bg-soft-black border border-white/[0.06] rounded-sm group shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
                <Image
                  src={founderAvatar}
                  alt={`${FOUNDER_NAME}, Founder of PIKORUA Realty`}
                  fill
                  quality={75}
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 90vw, 40vw"
                  preload
                />
                <div className="absolute inset-0 bg-gradient-to-t from-lux-black/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute inset-4 border border-white/5 pointer-events-none rounded-sm" />
              </div>

              {/* Copy */}
              <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
                <div className="space-y-2 flex flex-col items-center lg:items-start">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-champagne-gold font-sans font-medium">
                    Our Story
                  </p>
                  <div className="w-8 h-px bg-champagne-gold/50 mx-auto lg:mx-0" aria-hidden="true" />
                </div>

                <h1
                  id="about-heading"
                  className="font-display text-[clamp(2.1rem,4.2vw,3.45rem)] font-light text-white uppercase tracking-wider leading-tight text-center lg:text-left"
                >
                  {renderTitle(heroTitle)}
                </h1>

                <div className="max-w-3xl mx-auto lg:mx-0 text-left">
                  {founderStory.map((para: string, idx: number) => {
                    const arrivalMatch = para.match(ARRIVAL_SENTENCE_PATTERN);
                    if (idx === 0) {
                      const [introLead] = para.split(INFINITY_SENTENCE);
                      return (
                        <div key={idx} className="border-l border-champagne-gold/45 pl-5 sm:pl-6 py-1">
                          <p className="text-[clamp(1rem,1.8vw,1.18rem)] text-white font-sans font-light leading-relaxed tracking-wide">
                            <span dangerouslySetInnerHTML={{ __html: renderFormattedText(introLead) }} />
                            <span className="text-champagne-gold" dangerouslySetInnerHTML={{ __html: renderFormattedText(INFINITY_SENTENCE) }} />
                          </p>
                        </div>
                      );
                    }
                    return (
                      <div key={idx} className="mt-5 border-t border-white/[0.06] pt-5">
                        <p
                          className={cn(
                            "text-sm sm:text-base leading-relaxed font-sans font-light",
                            idx === 1 ? "text-champagne-gold" : "text-ivory/70"
                          )}
                        >
                          {arrivalMatch ? (
                            <>
                              <span dangerouslySetInnerHTML={{ __html: renderFormattedText(para.slice(0, arrivalMatch.index)) }} />
                              <span className="text-champagne-gold font-normal" dangerouslySetInnerHTML={{ __html: renderFormattedText(arrivalMatch[0]) }} />
                              <span dangerouslySetInnerHTML={{ __html: renderFormattedText(para.slice((arrivalMatch.index ?? 0) + arrivalMatch[0].length)) }} />
                            </>
                          ) : (
                            <span dangerouslySetInnerHTML={{ __html: renderFormattedText(para) }} />
                          )}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-6 flex justify-center lg:justify-start">
                  <a
                    href="https://www.linkedin.com/in/jitendra-k-p-0b237021b/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 text-[10px] uppercase tracking-[0.2em] text-champagne-gold/80 hover:text-white transition-colors duration-200 border-b border-champagne-gold/20 hover:border-white pb-1"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                    </svg>
                    Connect with Jitendra
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <StatsStrip className="border-t-0" />

        {/* Core Philosophy Section */}
        <section className="py-16 lg:py-28 border-t border-white/[0.04] relative z-10" aria-labelledby="principles-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-2 flex flex-col items-center mb-12 lg:mb-14">
              <p className="text-[10px] uppercase tracking-[0.3em] text-champagne-gold font-sans font-medium">
                Our Values
              </p>
              <div className="w-8 h-px bg-champagne-gold/50 mx-auto" aria-hidden="true" />
              <h2 id="principles-heading" className="font-display text-[clamp(1.6rem,3.2vw,2.45rem)] font-light text-white uppercase tracking-wider leading-tight text-center pt-4">
                The Pillars of Our Practice
              </h2>
            </div>

            <div className="mx-auto grid max-w-6xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
              {principles.map((principle: { label: string; body: string | string[] }) => {
                const bodies = Array.isArray(principle.body) ? principle.body : [principle.body];
                return (
                  <div
                    key={principle.label}
                    className="group relative min-h-[260px] p-5 sm:p-6 bg-soft-black/35 border border-white/[0.06] rounded-sm transition-all duration-300 hover:border-champagne-gold/30 hover:bg-soft-black/60 flex flex-col"
                  >
                    {/* Subtle golden top-corner glow on hover */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-champagne-gold/0 to-transparent group-hover:via-champagne-gold/45 transition-all duration-500" />

                    <div className="space-y-4">
                      <h3 className="font-display text-lg lg:text-xl font-light text-white uppercase tracking-wide">
                        {principle.label}
                      </h3>
                      <div className="space-y-3">
                        {bodies.map((paragraph: string, index: number) => (
                          <p
                            key={paragraph}
                            className={cn(
                              "font-sans leading-relaxed",
                              index === 0
                                ? "text-sm text-champagne-gold font-light"
                                : "text-[13px] sm:text-sm text-ivory/70 font-light"
                            )}
                            dangerouslySetInnerHTML={{ __html: renderFormattedText(paragraph) }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA band */}
        <section className="bg-lux-black py-16 lg:py-24 border-t border-white/[0.04] relative z-10">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div className="w-12 h-px bg-champagne-gold/40 mx-auto" aria-hidden="true" />
            <h2 className="font-display text-[clamp(1.5rem,3vw,2.25rem)] font-light text-ivory leading-tight uppercase tracking-wider">
              Begin a private conversation.
            </h2>
            <p className="text-ivory/70 font-sans text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
              Reach out to us to schedule a confidential discussion about your luxury property requirements in Ahmedabad.
            </p>
            <div className="pt-4">
              <Link
                href="/contact"
                className="group inline-flex items-center justify-center gap-2.5 px-8 py-3.5 text-xs font-sans font-medium uppercase tracking-[0.2em] text-champagne-gold border border-champagne-gold hover:bg-champagne-gold hover:text-lux-black transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne-gold rounded-sm min-h-[46px]"
              >
                Get In Touch
                <ArrowRight className="w-4 h-4 transform transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
