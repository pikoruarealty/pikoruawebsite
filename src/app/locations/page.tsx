import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PRIORITY_LOCATION_PAGES } from "@/lib/data/location-network";
import { ENTITY_IDS } from "@/lib/entity-profile";
import { absoluteUrl, createMetadata, serializeJsonLd, SITE_URL } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return createMetadata({
    title: "Posh Areas in Ahmedabad: Luxury Locality Guide",
    description:
      "The posh and luxury areas of Ahmedabad compared: Sindhu Bhavan Road, Bodakdev, Iskon-Ambli Road, Thaltej and 19 more corridors, with buyer fit and access.",
    path: "/locations",
  });
}

const GROUPS = ["Established luxury area", "Growth and landed-property corridor"] as const;

/** Answer-first summary for "posh / most expensive / best areas in Ahmedabad" searches. */
const POSH_AREAS = [
  { href: "/locations/sindhu-bhavan", name: "Sindhu Bhavan Road", note: "Low-density luxury towers and bungalows off SG Highway, with restaurants and a five-star hotel on the road itself." },
  { href: "/locations/rajpath-club", name: "Bodakdev and Rajpath Rangoli Road", note: "Established family neighbourhood around Rajpath Club, close to schools and SG Highway." },
  { href: "/locations/iskon-ambli", name: "Iskon-Ambli Road", note: "Large-format apartments and penthouses linking SG Highway with the Ambli and Bopal side." },
  { href: "/locations/thaltej", name: "Thaltej", note: "Mature residential area with bungalow lanes, newer high-rises and Metro access on the East-West line." },
  { href: "/locations/satellite", name: "Satellite, Vastrapur and Prahlad Nagar", note: "Central-west addresses with decades of social infrastructure, parks and offices nearby." },
  { href: "/locations/navrangpura", name: "Navrangpura and Ambawadi", note: "The traditional premium heart of the city east of SG Highway, around CG Road." },
  { href: "/locations/shilaj", name: "Shilaj, Shela and Vaishno Devi Circle", note: "Growth corridors where most new villas, bungalows and plotted communities are being built." },
];

const FAQS = [
  {
    question: "Which are the posh areas in Ahmedabad?",
    answer:
      "The areas most often described as posh are in western Ahmedabad: Sindhu Bhavan Road, Bodakdev (including Rajpath Rangoli Road), Iskon-Ambli Road and Thaltej, along with established central-west neighbourhoods such as Satellite, Vastrapur, Prahlad Nagar, Navrangpura and Ambawadi. Shilaj, Shela and Vaishno Devi Circle are the main growth corridors for villas and bungalows.",
  },
  {
    question: "Which is the most expensive area in Ahmedabad?",
    answer:
      "There is no official ranking. Sindhu Bhavan Road, Bodakdev and Iskon-Ambli Road are generally regarded as the city's most premium residential addresses, but prices vary widely by building. Compare a home with recent registered sales nearby and check the official jantri rate for the area.",
  },
  {
    question: "Which is the best area to live in Ahmedabad for families?",
    answer:
      "It depends on where the family works, which schools and clubs matter, and whether you want an apartment or a bungalow. Bodakdev, Thaltej, Satellite and Vastrapur suit families who want established schools and amenities close by; Shela and Shilaj suit those who want newer, larger homes.",
  },
  {
    question: "Which areas of Ahmedabad do NRIs usually consider?",
    answer:
      "Most overseas buyers we speak with compare the western corridors (Sindhu Bhavan Road, Bodakdev, Thaltej and Iskon-Ambli Road) for apartments, and Shilaj or Shela for villas. Families buying for parents often prioritise distance to relatives and hospitals.",
  },
];

const GROUP_COPY: Record<(typeof GROUPS)[number], { heading: string; description: string }> = {
  "Established luxury area": {
    heading: "Established Luxury Areas",
    description:
      "Mature western Ahmedabad neighbourhoods with deep social infrastructure, schools, clubs and resale demand.",
  },
  "Growth and landed-property corridor": {
    heading: "Growth and Landed-Property Corridors",
    description:
      "Expanding corridors suited to villas, plots and larger homes, where infrastructure delivery drives long-term value.",
  },
};

export default function LocationsIndexPage() {
  const pageUrl = absoluteUrl("/locations");

  const collectionPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: "Ahmedabad Luxury Location Network",
    description:
      "Compare all of Ahmedabad's luxury residential corridors, from established western neighbourhoods to emerging villa, plot and growth markets.",
    about: { "@id": ENTITY_IDS.realEstateAgent },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: PRIORITY_LOCATION_PAGES.map((page, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(page.href),
        name: page.label,
      })),
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Locations", item: pageUrl },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(collectionPageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqSchema) }} />
      <Header alwaysSolid />
      <main id="main-content">
        <section className="bg-lux-black pt-24 pb-8 lg:pt-32 lg:pb-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="w-6 h-px bg-champagne-gold/40 mb-4" aria-hidden="true" />
            <p className="text-[9px] uppercase tracking-[0.25em] text-champagne-gold font-sans mb-3">
              Location Expertise
            </p>
            <h1 className="font-display text-[clamp(1.5rem,3vw,2.25rem)] font-normal text-ivory leading-tight uppercase tracking-wider">
              Posh and Luxury Areas of Ahmedabad
            </h1>
            <p className="mt-4 max-w-2xl text-ivory/50 font-sans text-sm leading-relaxed">
              Compare established western neighbourhoods with emerging villa, plot and growth corridors — each with its own buyer profile, access reality and investment case.
            </p>
          </div>
        </section>

        <section className="bg-lux-black pb-14 lg:pb-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-[clamp(1.1rem,1.8vw,1.4rem)] font-normal text-ivory uppercase tracking-wider">
              The posh areas of Ahmedabad at a glance
            </h2>
            <p className="mt-3 max-w-3xl text-ivory/50 font-sans text-sm leading-relaxed">
              Ahmedabad&rsquo;s most sought-after residential addresses sit mainly in the west of the city, along and around SG Highway. There is no official ranking of the most expensive area; prices vary building by building, so compare any home with recent registered sales and the official{" "}
              <Link href="/learn/jantri-rates-ahmedabad" className="text-champagne-gold/80 hover:text-champagne-gold underline underline-offset-2">
                jantri rate
              </Link>
              .
            </p>
            <ol className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
              {POSH_AREAS.map((area) => (
                <li key={area.href} className="border-l border-champagne-gold/20 pl-4">
                  <Link href={area.href} className="font-display text-base text-ivory hover:text-champagne-gold transition-colors">
                    {area.name}
                  </Link>
                  <p className="mt-1 text-xs font-sans text-ivory/45 leading-relaxed">{area.note}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {GROUPS.map((group) => {
          const pages = PRIORITY_LOCATION_PAGES.filter((page) => page.eyebrow === group);
          const copy = GROUP_COPY[group];

          return (
            <section key={group} className="bg-soft-black py-14 lg:py-20 border-t border-white/[0.06]">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-10 max-w-2xl">
                  <h2 className="font-display text-[clamp(1.2rem,2vw,1.6rem)] font-normal text-ivory uppercase tracking-wider">
                    {copy.heading}
                  </h2>
                  <p className="mt-3 text-ivory/50 font-sans text-sm leading-relaxed">{copy.description}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-champagne-gold/[0.08]">
                  {pages.map((page) => (
                    <Link
                      key={page.slug}
                      href={page.href}
                      className="group bg-soft-black p-5 sm:p-7 border border-transparent hover:border-champagne-gold/40 hover:bg-lux-black transition-all duration-300 focus-visible:outline-2 focus-visible:outline-champagne-gold focus-visible:outline-offset-[-2px]"
                    >
                      <div className="w-6 h-px bg-champagne-gold/30 mb-4 group-hover:w-10 group-hover:bg-champagne-gold/60 transition-all duration-300" aria-hidden="true" />
                      <h3 className="font-display text-lg text-ivory mb-2 group-hover:text-champagne-gold transition-colors duration-200">
                        {page.label}
                      </h3>
                      <p className="text-xs font-sans text-ivory/35 leading-relaxed line-clamp-2">
                        {page.intro}
                      </p>
                      <span
                        className="block mt-4 text-champagne-gold/30 group-hover:text-champagne-gold group-hover:translate-x-1 transition-all duration-200 text-sm"
                        aria-hidden="true"
                      >
                        Explore corridor →
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          );
        })}

        <section className="bg-lux-black py-14 lg:py-20 border-t border-white/[0.06]">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-[clamp(1.1rem,1.8vw,1.4rem)] font-normal text-ivory uppercase tracking-wider">
              Questions about Ahmedabad&rsquo;s luxury areas
            </h2>
            <div className="mt-8 divide-y divide-white/[0.06]">
              {FAQS.map((faq) => (
                <div key={faq.question} className="py-5">
                  <h3 className="font-sans text-sm text-ivory/85">{faq.question}</h3>
                  <p className="mt-2 font-sans text-sm text-ivory/50 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
