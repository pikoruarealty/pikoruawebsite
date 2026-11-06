/**
 * Seed script — populates fixed, predefined content into Sanity.
 *
 * Seeds:
 *   - 6 residential categories (closed list from PRD §8)
 *   - 6 Ahmedabad location corridors + "Other" (from PRD §17)
 *   - Singleton document stubs (homePage, aboutPage, contactPage, siteSettings)
 *
 * Run AFTER setting up your .env.local:
 *   npx tsx scripts/seed-sanity.ts
 *
 * Safe to re-run — uses createOrReplace so existing docs are updated, not duplicated.
 */

import { createClient } from "@sanity/client";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_READ_TOKEN!, // needs write permission
  useCdn: false,
});

// ─── Residential Categories ────────────────────────────────────────────────
// Strictly the six types from PRD §8. No commercial ever.

const CATEGORIES = [
  {
    _id: "category-apartment",
    _type: "category",
    name: "Apartment",
    slug: { _type: "slug", current: "apartment" },
    description:
      "Premium apartments in Ahmedabad's finest residential corridors — curated for lifestyle, connectivity, and long-term value.",
  },
  {
    _id: "category-penthouse",
    _type: "category",
    name: "Penthouse",
    slug: { _type: "slug", current: "penthouse" },
    description:
      "Exclusive top-floor residences offering skyline views, generous terraces, and the finest in private luxury living.",
  },
  {
    _id: "category-villa",
    _type: "category",
    name: "Villa",
    slug: { _type: "slug", current: "villa" },
    description:
      "Standalone luxury villas with private gardens, generous space, and the privacy that comes with independent living.",
  },
  {
    _id: "category-bungalow",
    _type: "category",
    name: "Bungalow",
    slug: { _type: "slug", current: "bungalow" },
    description:
      "Character-rich bungalows — spacious, private, and set in Ahmedabad's most established residential addresses.",
  },
  {
    _id: "category-plot",
    _type: "category",
    name: "Premium Plot",
    slug: { _type: "slug", current: "plot" },
    description:
      "Carefully selected plots in prime residential corridors — for those who wish to build a home that is entirely their own.",
  },
  {
    _id: "category-residential-investment",
    _type: "category",
    name: "Residential Investment",
    slug: { _type: "slug", current: "residential-investment" },
    description:
      "High-potential residential properties chosen for capital appreciation and rental yield in Ahmedabad's premium micro-markets.",
  },
] as const;

// ─── Location Corridors ────────────────────────────────────────────────────

const LOCATIONS = [
  {
    _id: "location-iskon-ambli",
    _type: "location",
    name: "Iskon-Ambli",
    slug: { _type: "slug", current: "iskon-ambli" },
    corridorDescription: [
      {
        _type: "block",
        _key: "block-ia",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "span-ia",
            text: "Iskon-Ambli is Ahmedabad's most sought-after luxury residential corridor — a seamless blend of premium gated townships, wide tree-lined roads, and proximity to the SG Highway business hub. The area attracts discerning families, senior executives, and NRI buyers who value both address prestige and everyday convenience.",
          },
        ],
      },
    ],
    isActive: true,
  },
  {
    _id: "location-sindhu-bhavan",
    _type: "location",
    name: "Sindhu Bhavan",
    slug: { _type: "slug", current: "sindhu-bhavan" },
    corridorDescription: [
      {
        _type: "block",
        _key: "block-sb",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "span-sb",
            text: "Sindhu Bhavan Road is home to Ahmedabad's most recognisable luxury addresses — high-rises with skyline views, premium retail, and a lifestyle corridor that has long defined aspirational urban living in the city. Its connectivity to GIFT City and the international airport makes it equally favoured by investors.",
          },
        ],
      },
    ],
    isActive: true,
  },
  {
    _id: "location-thaltej",
    _type: "location",
    name: "Thaltej",
    slug: { _type: "slug", current: "thaltej" },
    corridorDescription: [
      {
        _type: "block",
        _key: "block-th",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "span-th",
            text: "Thaltej offers a quieter, more established luxury character — wide plots, premium independent homes, and gated enclaves favoured by families who prioritise space, privacy, and long-term residential stability over high-rise density.",
          },
        ],
      },
    ],
    isActive: true,
  },
  {
    _id: "location-shilaj",
    _type: "location",
    name: "Shilaj",
    slug: { _type: "slug", current: "shilaj" },
    corridorDescription: [
      {
        _type: "block",
        _key: "block-sh",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "span-sh",
            text: "Shilaj is an emerging premium corridor on the western outskirts — attractive to buyers seeking newer developments, larger plot sizes, and strong appreciation potential without the density of the inner SG Highway belt. It is particularly favoured for villa and bungalow formats.",
          },
        ],
      },
    ],
    isActive: true,
  },
  {
    _id: "location-vaishno-devi",
    _type: "location",
    name: "Vaishno Devi",
    slug: { _type: "slug", current: "vaishno-devi" },
    corridorDescription: [
      {
        _type: "block",
        _key: "block-vd",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "span-vd",
            text: "Vaishno Devi Circle is a well-connected, aspirational residential address on Ahmedabad's western edge — popular for premium apartments and integrated townships, with strong road connectivity to the airport and key business corridors.",
          },
        ],
      },
    ],
    isActive: true,
  },
  {
    _id: "location-sg-highway",
    _type: "location",
    name: "SG Highway",
    slug: { _type: "slug", current: "sg-highway" },
    corridorDescription: [
      {
        _type: "block",
        _key: "block-sg",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "span-sg",
            text: "The SG Highway corridor stretches across Ahmedabad's most commercially vibrant and residentially diverse belt — encompassing everything from high-floor luxury apartments to large residential plots. Its unmatched connectivity makes it the spine of the city's premium property market.",
          },
        ],
      },
    ],
    isActive: true,
  },
  {
    _id: "location-other",
    _type: "location",
    name: "Other",
    slug: { _type: "slug", current: "other" },
    corridorDescription: [],
    isActive: true,
  },
] as const;

// ─── Singleton stubs ───────────────────────────────────────────────────────

const SINGLETONS = [
  {
    _id: "homePage",
    _type: "homePage",
    heroHeadline: "Ahmedabad's finest residences — found quietly.",
    heroSubhead:
      "A private advisory for those who value discretion as much as address.",
    positioningStatement:
      "PIKORUA is a private gateway to Ahmedabad's finest luxury residences — curated, never listed.",
    finalCtaHeadline: "Begin a private conversation.",
    nriCtaLabel: "Talk to Us from Anywhere",
    sellerCtaLabel: "Discuss Selling, Privately",
  },
  {
    _id: "aboutPage",
    _type: "aboutPage",
    founderName: "Jitendra",
  },
  {
    _id: "contactPage",
    _type: "contactPage",
    leadInLine: "Begin a private conversation.",
    privacyReassurance:
      "Your enquiry is private. We respond personally, never with spam.",
  },
  {
    _id: "siteSettings",
    _type: "siteSettings",
    email: "info@pikorua.in",
    phone: "+91 6354 359 222",
    whatsappNumber: "916354359222",
    whatsappDefaultMessage:
      "Hi, I'd like to know more about luxury residences in Ahmedabad.",
    address: "Iskon-Ambli, Ahmedabad, Gujarat, India",
    responseTimeCopy: "We respond within a few hours.",
  },
] as const;

// ─── Runner ────────────────────────────────────────────────────────────────

async function seed() {
  console.log("Seeding Sanity...\n");

  const transaction = client.transaction();

  for (const cat of CATEGORIES) {
    transaction.createOrReplace(cat as Parameters<typeof transaction.createOrReplace>[0]);
    console.log(`  ✓ Category: ${cat.name}`);
  }

  for (const loc of LOCATIONS) {
    transaction.createOrReplace(loc as Parameters<typeof transaction.createOrReplace>[0]);
    console.log(`  ✓ Location: ${loc.name}`);
  }

  for (const singleton of SINGLETONS) {
    transaction.createOrReplace(singleton as Parameters<typeof transaction.createOrReplace>[0]);
    console.log(`  ✓ Singleton: ${singleton._type}`);
  }

  await transaction.commit();

  console.log("\nSeed complete.");
  console.log(
    "Next steps:\n" +
      "  1. Open /studio and verify all documents appear.\n" +
      "  2. Add Jitendra's portrait and bio to the About page singleton.\n" +
      "  3. Upload hero images for each location corridor.\n" +
      "  4. Create at least 3 Property documents and mark them Published.\n" +
      "  5. Add real testimonials from Google Reviews.\n"
  );
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
