import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Preloader } from "@/components/ui/Preloader";
import { LazyLeadCapturePopup } from "@/components/ui/LazyLeadCapturePopup";
import { CallAgentWidget } from "@/components/layout/CallAgentWidget";
import { env } from "@/lib/env";
import { ContentGuard } from "@/components/ui/ContentGuard";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { GoogleTagManager } from "@/components/analytics/GoogleTagManager";
import { MicrosoftClarity } from "@/components/analytics/MicrosoftClarity";
import { WebVitalsReporter } from "@/components/analytics/WebVitalsReporter";
import {
  BUSINESS_EMAIL,
  BUSINESS_MAP_URL,
  BUSINESS_PHONE_E164,
  ENTITY_IDS,
  SOCIAL_PROFILES,
  getAhmedabadAreaServedSchema,
  getBusinessContactPoints,
  getBusinessOfferCatalog,
  getGeoCoordinatesSchema,
  getPostalAddressSchema,
} from "@/lib/entity-profile";
import { absoluteUrl, serializeJsonLd, SITE_NAME, SITE_URL } from "@/lib/seo";
import { FOUNDER_NAME } from "@/lib/data/about";
import {
  DEVELOPER_PARTNERS,
  PARTNER_METADATA_KEYWORDS,
  PARTNER_SCHEMA_KNOWS_ABOUT,
  PORTFOLIO_PROJECT_NAMES,
} from "@/lib/data/developer-partners";
import { BRAND_MISSPELLING_KEYWORDS } from "@/lib/data/brand-keywords";
import "./globals.css";

const isVercelPreview =
  Boolean(process.env.VERCEL_ENV) && process.env.VERCEL_ENV !== "production";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Luxury Real Estate Consultants in Ahmedabad for HNIs and NRIs",
    template: `%s | ${SITE_NAME}`,
  },
  icons: {
    icon: "/logo-icon.png",
    shortcut: "/logo-icon.png",
    apple: "/logo-icon.png",
  },
  description:
    "Private luxury real estate consultants in Ahmedabad for HNIs and NRIs seeking curated homes, discreet advisory, and verified premium property access.",
  keywords: [
    "luxury property Ahmedabad",
    "NRI property investment Ahmedabad",
    "luxury real estate consultants Ahmedabad",
    "HNI property consultant Ahmedabad",
    "premium residential projects Ahmedabad",
    "Ahmedabad real estate developers",
    ...BRAND_MISSPELLING_KEYWORDS,
    ...PARTNER_METADATA_KEYWORDS,
  ],
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Luxury Real Estate Consultants in Ahmedabad for HNIs and NRIs",
    description:
      "Private luxury real estate consultants in Ahmedabad for HNIs and NRIs seeking curated homes, discreet advisory, and verified premium property access.",
    images: [{ url: absoluteUrl("/logo.png") }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luxury Real Estate Consultants in Ahmedabad for HNIs and NRIs",
    description:
      "Private luxury real estate consultants in Ahmedabad for HNIs and NRIs seeking curated homes, discreet advisory, and verified premium property access.",
    images: [absoluteUrl("/logo.png")],
  },
  robots: {
    index: !isVercelPreview,
    follow: !isVercelPreview,
    googleBot: { index: !isVercelPreview, follow: !isVercelPreview },
  },
  verification: {
    google: "google91c2c9a5f53b75d8.html",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": ENTITY_IDS.website,
      url: SITE_URL,
      name: SITE_NAME,
      publisher: {
        "@id": ENTITY_IDS.realEstateAgent,
      },
      inLanguage: "en-IN",
      // No SearchAction: Google retired the sitelinks search box (Nov 2024).
    },
    {
      "@type": ["Organization", "RealEstateAgent", "LocalBusiness"],
      "@id": ENTITY_IDS.realEstateAgent,
      name: SITE_NAME,
      // Genuine names only. Misspellings stay in llms.txt / facts.json; in
      // markup Google treats alternateName as real alternate names.
      alternateName: ["PIKORUA", "Pikorua Realty"],
      url: SITE_URL,
      logo: absoluteUrl("/logo-icon.png"),
      image: absoluteUrl("/logo.png"),
      description:
        "Luxury real estate consultants in Ahmedabad for HNIs and NRIs, providing private residential advisory, NRI purchase support, and market intelligence.",
      founder: {
        "@id": ENTITY_IDS.founder,
      },
      sameAs: [...SOCIAL_PROFILES],
      areaServed: [
        getAhmedabadAreaServedSchema(),
        {
          "@type": "GeoShape",
          polygon: "23.00,72.44 23.08,72.44 23.08,72.54 23.00,72.54 23.00,72.44",
        },
      ],
      knowsAbout: [
        // Developer and project entity coverage
        ...PARTNER_SCHEMA_KNOWS_ABOUT,
        // Core luxury advisory
        "Luxury Real Estate Consultants in Ahmedabad for HNIs and NRIs",
        "Luxury real estate consultant Ahmedabad",
        "Luxury property consultant Ahmedabad",
        "HNI property consultant Ahmedabad",
        "HNI and NRI luxury real estate consultants Ahmedabad",
        "Luxury property broker Ahmedabad",
        "Luxury real estate broker Ahmedabad",
        "Luxury property dealer Ahmedabad",
        "Premium property consultant Ahmedabad",
        "Premium real estate consultant Ahmedabad",
        "Luxury home consultant Ahmedabad",
        "Luxury apartment consultant Ahmedabad",
        "Trusted luxury property consultant Ahmedabad",
        "Best luxury property consultant Ahmedabad",
        "Top luxury real estate broker Ahmedabad",
        "Luxury property advisory Ahmedabad",
        "Luxury real estate consultancy Ahmedabad",
        "Exclusive property consultant Ahmedabad",
        "Boutique real estate consultant Ahmedabad",
        "High end property consultant Ahmedabad",
        "Premium home broker Ahmedabad",
        "Luxury residential property Ahmedabad",
        "Luxury homes for sale Ahmedabad",
        // General discovery
        "Real estate in Ahmedabad",
        "Properties in Ahmedabad",
        "Ahmedabad real estate",
        "Ahmedabad properties",
        "Residential properties Ahmedabad",
        "Off-market properties Ahmedabad",
        "Real estate advisory Ahmedabad",
        "Property consultant Gujarat",
        // Buyer-intent
        "Buy luxury property in Ahmedabad",
        "Buy premium apartment in Ahmedabad",
        "Buy luxury flat in Ahmedabad",
        "Buy 4 BHK luxury apartment Ahmedabad",
        "Buy 5 BHK luxury apartment Ahmedabad",
        "Buy penthouse in Ahmedabad",
        "Buy duplex in Ahmedabad",
        "Buy bungalow in Ahmedabad",
        "Buy villa in Ahmedabad",
        "Buy luxury villa near Ahmedabad",
        "Buy premium home in Ahmedabad",
        "Ready to move luxury apartment Ahmedabad",
        "Under construction luxury projects Ahmedabad",
        "New luxury residential projects Ahmedabad",
        "Exclusive apartments for sale Ahmedabad",
        "Premium residences for sale Ahmedabad",
        "High rise luxury apartments Ahmedabad",
        "Gated community luxury apartments Ahmedabad",
        // Property types
        "Luxury 3 BHK Ahmedabad",
        "Luxury 4 BHK Ahmedabad",
        "Luxury 5 BHK Ahmedabad",
        "Premium 4 BHK Ahmedabad",
        "Premium 5 BHK Ahmedabad",
        "4 BHK flat for sale Ahmedabad luxury",
        "5 BHK flat for sale Ahmedabad luxury",
        "Luxury penthouse for sale Ahmedabad",
        "Luxury duplex Ahmedabad",
        "Duplex apartment for sale Ahmedabad",
        "Bungalow for sale Ahmedabad",
        "Luxury bungalow Ahmedabad",
        "Villa for sale Ahmedabad",
        "Luxury villa Ahmedabad",
        "Weekend villa near Ahmedabad",
        "Farmhouse near Ahmedabad",
        "Premium plot for sale Ahmedabad",
        "Residential plot Ahmedabad premium",
        "Luxury ready possession flat Ahmedabad",
        "Luxury under construction apartment Ahmedabad",
        // Area and locality
        "Luxury property Sindhu Bhavan Road",
        "Luxury flats Sindhu Bhavan Road Ahmedabad",
        "Luxury apartment SBR Ahmedabad",
        "Premium property SBR Ahmedabad",
        "Luxury property Iscon Ambli Road",
        "Luxury flats Iscon Ambli Road Ahmedabad",
        "Premium apartment Iscon Ambli Road",
        "Luxury property Thaltej Ahmedabad",
        "Luxury property Vastrapur Ahmedabad",
        "Luxury property Bodakdev Ahmedabad",
        "Luxury flat Bodakdev Ahmedabad",
        "Luxury property Satellite Ahmedabad",
        "Premium property Prahlad Nagar Ahmedabad",
        "Luxury flat near SG Highway Ahmedabad",
        "Luxury property near Rajpath Club",
        "Luxury property near Karnavati Club",
        "Luxury apartment near Ahmedabad Airport",
        // Investment and NRI
        "NRI property consultant Ahmedabad",
        "NRI real estate advisor Ahmedabad",
        "NRI property investment Ahmedabad",
        "Luxury property investment Ahmedabad",
        "Premium property investment Ahmedabad",
        "Best areas to invest in Ahmedabad property",
        "Real estate investment consultant Ahmedabad",
        "Buy property in Ahmedabad from abroad",
        "NRI home buying assistance Ahmedabad",
        "Luxury home investment Ahmedabad",
        "Rental yield property Ahmedabad",
        "Capital appreciation property Ahmedabad",
        // Seller-intent
        "Sell luxury property Ahmedabad",
        "Sell premium apartment Ahmedabad",
        "Luxury property resale consultant Ahmedabad",
        "Luxury home resale Ahmedabad",
        "Sell bungalow Ahmedabad",
        "Sell penthouse Ahmedabad",
        "Property valuation Ahmedabad luxury",
        "Luxury property marketing Ahmedabad",
        "Exclusive property listing Ahmedabad",
        "Find buyer for luxury property Ahmedabad",
        "Trusted property broker Ahmedabad",
        // Market intelligence and media citation
        "Ahmedabad luxury property market report",
        "Ahmedabad luxury real estate market intelligence",
        "Ahmedabad luxury property media commentary",
        "Digital PR real estate commentary Ahmedabad",
      ],

      address: getPostalAddressSchema(),
      geo: getGeoCoordinatesSchema(),
      hasMap: BUSINESS_MAP_URL,
      // No review/aggregateRating: ratings a business publishes about itself
      // are not eligible for review rich results and carry manual-action risk.
      email: BUSINESS_EMAIL,
      telephone: BUSINESS_PHONE_E164,
      priceRange: "₹₹₹₹",
      contactPoint: getBusinessContactPoints(),
      makesOffer: getBusinessOfferCatalog(),
    },
    {
      "@type": "ItemList",
      "@id": `${SITE_URL}#developer-partner-entities`,
      name: "Ahmedabad real estate developer entities PIKORUA Realty advises across",
      itemListElement: DEVELOPER_PARTNERS.map((partner, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Organization",
          name: partner.name,
          knowsAbout: [
            `${partner.name} luxury projects Ahmedabad`,
            `${partner.name} residential projects Ahmedabad`,
            ...(partner.projectNames ?? []).map((projectName) => `${projectName} Ahmedabad`),
          ],
        },
      })),
    },
    {
      "@type": "ItemList",
      "@id": `${SITE_URL}#portfolio-project-entities`,
      name: "Luxury residential project entities in the PIKORUA Realty discovery surface",
      itemListElement: PORTFOLIO_PROJECT_NAMES.map((projectName, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Thing",
          name: projectName,
          description: `${projectName} is part of the PIKORUA Realty luxury property discovery surface for Ahmedabad buyers and NRI investors.`,
        },
      })),
    },
    {
      "@type": "Person",
      "@id": ENTITY_IDS.founder,
      name: FOUNDER_NAME,
      jobTitle: "Founder & Managing Director",
      description:
        "Jitendra Pareek is the founder of PIKORUA Realty, Ahmedabad's private luxury residential real estate advisory. He specialises in curating off-market 4 BHK and 5 BHK apartments, penthouses, villas, and bungalows for HNI and NRI buyers across western Ahmedabad's premium corridors.",
      image: absoluteUrl("/images/founder.jpg"),
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
        "Ahmedabad luxury property market report",
      ],
      sameAs: [
        "https://www.instagram.com/pikorua.realty?igsh=MTN5d2NmNW1yY3Vvag==",
        "https://www.linkedin.com/company/pikorua-realty/posts/?feedView=all",
        "https://www.linkedin.com/in/jitendra-k-p-0b237021b/",
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${playfair.variable} h-full`}
    >
      <head>
        {/* DNS prefetch for third-party analytics scripts — avoids DNS lookup latency on first tag fire */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
        <link rel="dns-prefetch" href="https://www.clarity.ms" />
        <link rel="alternate" type="text/plain" title="PIKORUA Realty AI index" href={absoluteUrl("/llms.txt")} />
        <link
          rel="alternate"
          type="text/plain"
          title="PIKORUA Realty full AI content index"
          href={absoluteUrl("/llms-full.txt")}
        />
        <link
          rel="alternate"
          type="application/json"
          title="PIKORUA Realty structured AI facts"
          href={absoluteUrl("/ai/facts.json")}
        />
      </head>
      <body className="min-h-full flex flex-col bg-lux-black text-ivory antialiased">
        <GoogleAnalytics />
        <GoogleTagManager />
        <MicrosoftClarity />
        <WebVitalsReporter />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(organizationSchema) }}
        />
        <ContentGuard />
        <Preloader />
        <LazyLeadCapturePopup />
        {/* Maya is paused; set NEXT_PUBLIC_MAYA_ENABLED=true and rebuild to bring her back. */}
        {env.MAYA_ENABLED && <CallAgentWidget />}
        <a href="#main-content" className="skip-to-content">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
