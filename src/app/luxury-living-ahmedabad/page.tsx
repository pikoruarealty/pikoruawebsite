import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LUXURY_LIVING_AREAS } from "@/lib/data/location-network";
import { getRenderablePublicPaths } from "@/lib/data/public-routes";
import { ENTITY_IDS } from "@/lib/entity-profile";
import { absoluteUrl, createMetadata, serializeJsonLd, SITE_URL } from "@/lib/seo";

const PATH = "/luxury-living-ahmedabad";

export const metadata: Metadata = createMetadata({
  title: "Luxury Living in Ahmedabad: Area by Area",
  description:
    "Where Ahmedabad's luxury lifestyle is: private clubs, fine dining and hotels, schools, hospitals and business access, compared area by area.",
  path: PATH,
});

// Every statement below comes from the area profiles in location-network.ts,
// the same text shown on each /locations/<area> page.
const FAQS = [
  {
    question: "Where is luxury living centred in Ahmedabad?",
    answer:
      "Mostly in western Ahmedabad. Sindhu Bhavan Road, Iskon–Ambli Road, Bodakdev and Thaltej sit closest to the city's main private clubs, Karnavati Club and Rajpath Club, to Taj Skyline and to the restaurant belt along Sindhu Bhavan Road.",
  },
  {
    question: "Which areas are close to Ahmedabad's private clubs?",
    answer:
      "Karnavati Club and Rajpath Club are the anchors for Sindhu Bhavan Road, Iskon–Ambli Road and Bodakdev, and Karnavati Club is also close to Satellite and Prahlad Nagar. Prahlad Nagar has the YMCA International Centre nearby, and Club O7 is a key anchor in Shela.",
  },
  {
    question: "Which areas suit families with school-going children?",
    answer:
      "Bodakdev, Thaltej and Science City have a strong mix of established schools and hospitals, including Ahmedabad International School, Udgam School, Zydus Hospital, SAL Hospital and CIMS Hospital in the wider catchment. Test the school run from the exact building at peak hours before you decide.",
  },
  {
    question: "Is this a ranking of the best areas?",
    answer:
      "No. It summarises the lifestyle notes from PIKORUA's area guides so you can compare them in one place. Each area guide adds indicative prices, property types, access and the trade-offs to check before buying.",
  },
];

const THEMES = [
  { key: "clubsAndDining", title: "Clubs, dining and social life" },
  { key: "schoolsAndHospitals", title: "Schools and healthcare" },
  { key: "businessConnectivity", title: "Getting to work" },
] as const;

const GROUPS = ["Established luxury area", "Growth and landed-property corridor"] as const;
const GROUP_INTRO: Record<(typeof GROUPS)[number], string> = {
  "Established luxury area":
    "Mature neighbourhoods where clubs, restaurants, schools and hospitals are already in place.",
  "Growth and landed-property corridor":
    "Newer corridors with more space, villas and plots, where the lifestyle offer is still filling in.",
};

export default function LuxuryLivingPage() {
  const pageUrl = absoluteUrl(PATH);
  const live = getRenderablePublicPaths();
  const areas = LUXURY_LIVING_AREAS.filter((area) => live.has(area.href));

  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: "Luxury Living in Ahmedabad",
    description: "Private clubs, dining, schools, healthcare and business access across Ahmedabad's luxury areas.",
    about: { "@id": ENTITY_IDS.realEstateAgent },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: areas.map((area, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: area.label,
        url: absoluteUrl(area.href),
      })),
    },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Locations", item: absoluteUrl("/locations") },
      { "@type": "ListItem", position: 3, name: "Luxury Living in Ahmedabad", item: pageUrl },
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
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <p className="text-[10px] uppercase tracking-[0.25em] text-champagne-gold font-sans mb-4">Luxury Living · PIKORUA Realty</p>
            <h1 className="font-display text-[clamp(1.75rem,4vw,2.75rem)] font-light uppercase tracking-wider">
              Luxury Living in Ahmedabad
            </h1>
            <p className="mt-5 max-w-3xl text-sm sm:text-base text-ivory/60 font-sans leading-relaxed">
              Ahmedabad&rsquo;s luxury lifestyle is concentrated in the west of the city. Sindhu Bhavan Road, Iskon&ndash;Ambli Road, Bodakdev and Thaltej sit closest to Karnavati Club, Rajpath Club, Taj Skyline and the Sindhu Bhavan Road restaurant belt. Below, every area we advise on is compared on what daily life there is like: clubs and dining, schools and healthcare, and the commute.
            </p>
            <nav aria-label="On this page" className="mt-8 flex flex-wrap gap-2.5">
              {THEMES.map((theme) => (
                <a
                  key={theme.key}
                  href={`#${theme.key}`}
                  className="rounded-full border border-champagne-gold/30 px-4 py-2 font-sans text-xs uppercase tracking-wider text-champagne-gold hover:border-champagne-gold"
                >
                  {theme.title}
                </a>
              ))}
            </nav>
          </div>
        </section>

        {THEMES.map((theme) => (
          <section key={theme.key} id={theme.key} className="pb-12 border-t border-white/[0.06] pt-12 scroll-mt-24">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <h2 className="font-display text-xl sm:text-2xl uppercase tracking-wider text-ivory font-light">{theme.title}</h2>
              {GROUPS.map((group) => {
                const inGroup = areas.filter((area) => area.group === group);
                if (inGroup.length === 0) return null;
                return (
                  <div key={group} className="mt-8">
                    <h3 className="text-[10px] uppercase tracking-[0.25em] text-champagne-gold font-sans">{group}</h3>
                    <p className="mt-2 text-xs text-ivory/45 font-sans">{GROUP_INTRO[group]}</p>
                    <ul className="mt-5 grid gap-x-10 gap-y-5 md:grid-cols-2">
                      {inGroup.map((area) => (
                        <li key={area.slug}>
                          <Link href={area.href} className="font-display text-base text-ivory hover:text-champagne-gold transition-colors">
                            {area.label}
                          </Link>
                          <p className="mt-1 text-sm text-ivory/55 font-sans leading-relaxed">{area[theme.key]}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        <section className="pb-12 border-t border-white/[0.06] pt-12">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="font-display text-lg uppercase tracking-wider text-ivory">Choosing the right area</h2>
              <p className="mt-4 text-sm text-ivory/60 font-sans leading-relaxed">
                Start with the routine you want: the club you use, the school run, the hospital your parents need and the drive to work. Then compare homes inside the two or three areas that fit. Prestige of address matters less than the building, the lane and the commute from the exact door.
              </p>
            </div>
            <div>
              <h2 className="font-display text-lg uppercase tracking-wider text-ivory">Homes that match</h2>
              <ul className="mt-4 space-y-2 text-sm font-sans">
                {[
                  { href: "/locations", label: "Compare all Ahmedabad areas" },
                  { href: "/luxury-apartments-ahmedabad", label: "Luxury apartments in Ahmedabad" },
                  { href: "/penthouses-ahmedabad", label: "Penthouses and duplexes" },
                  { href: "/luxury-bungalows-ahmedabad", label: "Luxury bungalows" },
                  { href: "/luxury-villas-ahmedabad", label: "Luxury villas" },
                  { href: "/properties", label: "Current properties" },
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
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
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
              Lifestyle notes are editorial summaries from PIKORUA&rsquo;s area guides. Clubs, schools and services change; check the current position directly before relying on it. Membership of private clubs such as Karnavati Club or Rajpath Club is decided by each club and does not come with buying a home nearby.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
