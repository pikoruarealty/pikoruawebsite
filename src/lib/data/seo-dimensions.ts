/**
 * seo-dimensions.ts
 *
 * Single source of truth for all combinatorial SEO dimensions.
 *
 * These 67 dimension rows power the entire 1000–20,000 page engine.
 * Each page URL is built as:
 *   /p/[location]/[type]/[bhk]/[budget]/[intent]
 *
 * Segments beyond [location] are optional — the route validates
 * each present segment against these datasets and returns 404 on
 * any unknown slug.
 *
 * Commercial pages included per explicit owner instruction (July 2026).
 */

// ─────────────────────────────────────────────────────────────────────────────
// LOCATIONS — 50 Ahmedabad micro-areas
// ─────────────────────────────────────────────────────────────────────────────

export interface SeoDimLocation {
  slug: string;
  label: string;
  /** Short corridor label used in headings */
  area: string;
  /** Weight for priority-scoring the top-500 static combos (1–10) */
  weight: number;
  /** One-sentence market context injected into generated content */
  marketNote: string;
  /** Typical price band string, e.g. "₹7,000–₹13,000 per sq.ft." */
  priceContext: string;
  /** Connectivity / lifestyle hook used in body content */
  lifestyle: string;
  /** Approximate lat/lng for schema markup */
  coordinates: { lat: string; lng: string };
  /** Parent corridor slug — used for internal link clustering */
  corridor: "west" | "north-west" | "south" | "central" | "east" | "gift-city" | "sg-highway";
}

export const SEO_LOCATIONS: SeoDimLocation[] = [
  // ── Tier 1: Ultra-Prime (weight 10) ─────────────────────────────────────
  {
    slug: "iscon-ambli-road",
    label: "Iscon Ambli Road",
    area: "Iscon Ambli Road",
    weight: 10,
    marketNote:
      "Ahmedabad's highest-value residential corridor commanding ₹11,000–₹15,000 per sq.ft. with ultra-low supply.",
    priceContext: "₹11,000–₹15,000 per sq.ft.",
    lifestyle:
      "Minutes from ISKCON Temple, premium schools, and Ambli Road's lifestyle infrastructure.",
    coordinates: { lat: "23.0246", lng: "72.5074" },
    corridor: "west",
  },
  {
    slug: "sindhubhavan-road",
    label: "Sindhubhavan Road",
    area: "SBR",
    weight: 10,
    marketNote:
      "Ahmedabad's most recognised luxury address — 4 km of premium dining, clubs, and residential towers.",
    priceContext: "₹8,000–₹15,000 per sq.ft.",
    lifestyle:
      "Immediate access to Karnavati Club, Rajpath Club, and Sindhu Bhavan's lifestyle strip.",
    coordinates: { lat: "23.0392", lng: "72.5071" },
    corridor: "west",
  },
  {
    slug: "bodakdev",
    label: "Bodakdev",
    area: "Bodakdev",
    weight: 9,
    marketNote:
      "Mature luxury neighbourhood with Karnavati Club proximity and strong self-use buyer demand.",
    priceContext: "₹7,000–₹13,000 per sq.ft.",
    lifestyle:
      "Home to Karnavati Club, premium schools, and Ahmedabad's most established dining belt.",
    coordinates: { lat: "23.0483", lng: "72.5240" },
    corridor: "west",
  },
  {
    slug: "thaltej",
    label: "Thaltej",
    area: "Thaltej",
    weight: 9,
    marketNote:
      "A balanced corridor for both self-use and rental demand, close to SG Highway and Science City.",
    priceContext: "₹6,500–₹11,000 per sq.ft.",
    lifestyle: "Strong SG Highway, Science City, and Thaltej Metro Station connectivity.",
    coordinates: { lat: "23.0500", lng: "72.5167" },
    corridor: "west",
  },
  {
    slug: "satellite",
    label: "Satellite",
    area: "Satellite",
    weight: 8,
    marketNote:
      "School-catchment driven demand — home to premium CBSE and IB schools with strong family buyer market.",
    priceContext: "₹7,000–₹12,000 per sq.ft.",
    lifestyle: "Premier school access, premium retail, and central western Ahmedabad connectivity.",
    coordinates: { lat: "23.0396", lng: "72.5318" },
    corridor: "west",
  },
  {
    slug: "prahladnagar",
    label: "Prahladnagar",
    area: "Prahladnagar",
    weight: 8,
    marketNote:
      "Ahmedabad's primary corporate business district — strongest rental yield from IT and finance executives.",
    priceContext: "₹6,000–₹10,000 per sq.ft.",
    lifestyle:
      "Walking distance to Prahladnagar Corporate Road, major IT parks, and SG Highway.",
    coordinates: { lat: "23.0197", lng: "72.5297" },
    corridor: "sg-highway",
  },
  // ── Tier 2: Prime (weight 7–8) ───────────────────────────────────────────
  {
    slug: "sg-highway",
    label: "SG Highway",
    area: "SG Highway",
    weight: 8,
    marketNote:
      "Arterial corridor connecting GIFT City, Gandhinagar, and the airport — strongest rental income in Ahmedabad.",
    priceContext: "₹5,500–₹10,000 per sq.ft.",
    lifestyle:
      "GIFT City commute under 20 min, Ahmedabad International Airport within 10 km.",
    coordinates: { lat: "23.0287", lng: "72.5068" },
    corridor: "sg-highway",
  },
  {
    slug: "ambli",
    label: "Ambli",
    area: "Ambli",
    weight: 7,
    marketNote:
      "Adjacent to Iscon Ambli Road — offers comparable lifestyle at 15–25% lower entry pricing.",
    priceContext: "₹6,000–₹11,000 per sq.ft.",
    lifestyle:
      "Adjacent to Iscon Ambli Road lifestyle infrastructure with improving connectivity.",
    coordinates: { lat: "23.0283", lng: "72.4985" },
    corridor: "west",
  },
  {
    slug: "science-city",
    label: "Science City",
    area: "Science City Road",
    weight: 7,
    marketNote:
      "Connectivity triangle — sits at SG Highway, Thaltej, and GIFT City junction with growing GIFT City rental demand.",
    priceContext: "₹6,000–₹10,000 per sq.ft.",
    lifestyle:
      "Strong GIFT City commute access, Thaltej proximity, and Science City Road infrastructure.",
    coordinates: { lat: "23.0608", lng: "72.5309" },
    corridor: "sg-highway",
  },
  {
    slug: "vastrapur",
    label: "Vastrapur",
    area: "Vastrapur",
    weight: 7,
    marketNote:
      "Vastrapur Lake and Ahmedabad University proximity drive premium demand from faculty and corporate buyers.",
    priceContext: "₹6,500–₹11,500 per sq.ft.",
    lifestyle:
      "Vastrapur Lake, Ahmedabad University, and IIM-A proximity create a unique academic lifestyle cluster.",
    coordinates: { lat: "23.0365", lng: "72.5275" },
    corridor: "west",
  },
  {
    slug: "shela",
    label: "Shela",
    area: "Shela",
    weight: 6,
    marketNote:
      "Fast-growing western suburb with competitive pricing for villas and gated community projects.",
    priceContext: "₹5,000–₹8,000 per sq.ft.",
    lifestyle:
      "Ambli Road connectivity, growing infrastructure, and best villa supply in western Ahmedabad.",
    coordinates: { lat: "22.9971", lng: "72.4814" },
    corridor: "west",
  },
  {
    slug: "gift-city",
    label: "GIFT City",
    area: "GIFT City",
    weight: 7,
    marketNote:
      "India's first operational smart city and IFSC — attracting institutional professionals and NRI investors.",
    priceContext: "₹5,500–₹9,000 per sq.ft.",
    lifestyle:
      "India's premier financial district with international-standard infrastructure and direct metro access.",
    coordinates: { lat: "23.1583", lng: "72.6746" },
    corridor: "gift-city",
  },
  {
    slug: "gandhinagar",
    label: "Gandhinagar",
    area: "Gandhinagar",
    weight: 6,
    marketNote:
      "Gujarat's capital city — government and GIFT City employment drives premium residential demand.",
    priceContext: "₹4,500–₹8,000 per sq.ft.",
    lifestyle:
      "Clean, planned city with wide roads, green sectors, and direct GIFT City metro connectivity.",
    coordinates: { lat: "23.2156", lng: "72.6369" },
    corridor: "gift-city",
  },
  // ── Tier 3: Growing (weight 4–6) ────────────────────────────────────────
  {
    slug: "bopal",
    label: "Bopal",
    area: "Bopal",
    weight: 6,
    marketNote:
      "High transaction volume suburb — largest residential land bank in western Ahmedabad with strong mid-market appeal.",
    priceContext: "₹4,500–₹8,000 per sq.ft.",
    lifestyle:
      "Bopal-Ambli Road lifestyle access, premium schools, and strong civic infrastructure.",
    coordinates: { lat: "23.0157", lng: "72.4748" },
    corridor: "west",
  },
  {
    slug: "south-bopal",
    label: "South Bopal",
    area: "South Bopal",
    weight: 5,
    marketNote:
      "Emerging luxury micro-pocket within Bopal — newer towers with better specifications at Bopal pricing.",
    priceContext: "₹5,000–₹8,500 per sq.ft.",
    lifestyle: "Direct Bopal infrastructure access with newer residential developments.",
    coordinates: { lat: "22.9980", lng: "72.4733" },
    corridor: "west",
  },
  {
    slug: "shilaj",
    label: "Shilaj",
    area: "Shilaj",
    weight: 6,
    marketNote:
      "Private residential enclave between Bopal and SG Highway — villa and gated community hub.",
    priceContext: "₹5,000–₹9,000 per sq.ft.",
    lifestyle:
      "Vastrapur Lake proximity, Bopal-Ambli Road access, and strong villa/bungalow supply.",
    coordinates: { lat: "23.0395", lng: "72.4764" },
    corridor: "west",
  },
  {
    slug: "makarba",
    label: "Makarba",
    area: "Makarba",
    weight: 5,
    marketNote:
      "Affordable access corridor to SG Highway — strong rental yield from professional tenants.",
    priceContext: "₹4,000–₹7,000 per sq.ft.",
    lifestyle: "SG Highway proximity and Prahladnagar corporate access at accessible pricing.",
    coordinates: { lat: "23.0097", lng: "72.5108" },
    corridor: "sg-highway",
  },
  {
    slug: "jodhpur",
    label: "Jodhpur",
    area: "Jodhpur",
    weight: 5,
    marketNote:
      "Established residential area near Satellite with strong civic infrastructure and school access.",
    priceContext: "₹5,500–₹9,000 per sq.ft.",
    lifestyle:
      "Central Ahmedabad access with Satellite Road connectivity and established neighbourhood character.",
    coordinates: { lat: "23.0321", lng: "72.5451" },
    corridor: "central",
  },
  {
    slug: "vejalpur",
    label: "Vejalpur",
    area: "Vejalpur",
    weight: 5,
    marketNote:
      "High-velocity mid-market area — strong transaction volumes from first-time premium buyers.",
    priceContext: "₹4,000–₹7,500 per sq.ft.",
    lifestyle:
      "SG Highway access and growing premium residential supply in southern western Ahmedabad.",
    coordinates: { lat: "23.0043", lng: "72.5275" },
    corridor: "sg-highway",
  },
  {
    slug: "gota",
    label: "Gota",
    area: "Gota",
    weight: 5,
    marketNote:
      "North-western growth corridor — affordable pricing with improving SP Ring Road connectivity.",
    priceContext: "₹3,500–₹6,500 per sq.ft.",
    lifestyle:
      "SP Ring Road and NH-48 connectivity with lower pricing than prime western corridors.",
    coordinates: { lat: "23.1052", lng: "72.5531" },
    corridor: "north-west",
  },
  {
    slug: "chandkheda",
    label: "Chandkheda",
    area: "Chandkheda",
    weight: 5,
    marketNote:
      "GIFT City feeder suburb — growing professional demand from GIFT City and Gandhinagar employers.",
    priceContext: "₹3,500–₹6,000 per sq.ft.",
    lifestyle:
      "GIFT City under 20 minutes, Sabarmati Metro accessibility, and emerging premium supply.",
    coordinates: { lat: "23.1069", lng: "72.5966" },
    corridor: "north-west",
  },
  {
    slug: "motera",
    label: "Motera",
    area: "Motera",
    weight: 5,
    marketNote:
      "Home to Narendra Modi Stadium — strong investment demand and institutional rental from cricket events.",
    priceContext: "₹4,000–₹7,000 per sq.ft.",
    lifestyle:
      "Narendra Modi Stadium, Sabarmati Riverfront access, and growing metro connectivity.",
    coordinates: { lat: "23.0992", lng: "72.5988" },
    corridor: "north-west",
  },
  {
    slug: "bhat",
    label: "Bhat",
    area: "Bhat",
    weight: 5,
    marketNote:
      "Immediately adjacent to GIFT City — the closest residential supply to India's premier IFSC.",
    priceContext: "₹4,000–₹7,000 per sq.ft.",
    lifestyle: "GIFT City walking distance and Gandhinagar connectivity at affordable pricing.",
    coordinates: { lat: "23.1686", lng: "72.6527" },
    corridor: "gift-city",
  },
  {
    slug: "new-ranip",
    label: "New Ranip",
    area: "New Ranip",
    weight: 4,
    marketNote:
      "Affordable north-western pocket with improving connectivity and growing premium supply.",
    priceContext: "₹3,000–₹5,500 per sq.ft.",
    lifestyle: "SP Ring Road access and north-western Ahmedabad's growing residential belt.",
    coordinates: { lat: "23.0868", lng: "72.5671" },
    corridor: "north-west",
  },
  {
    slug: "sabarmati",
    label: "Sabarmati",
    area: "Sabarmati",
    weight: 4,
    marketNote:
      "Riverfront and heritage zone — Sabarmati Riverfront promenade drives premium project demand.",
    priceContext: "₹3,500–₹6,000 per sq.ft.",
    lifestyle: "Sabarmati Riverfront, Gandhi Ashram, and improving metro connectivity.",
    coordinates: { lat: "23.0793", lng: "72.5803" },
    corridor: "central",
  },
  {
    slug: "navrangpura",
    label: "Navrangpura",
    area: "Navrangpura",
    weight: 5,
    marketNote:
      "Central business district — premium commercial offices and upscale residential near CG Road.",
    priceContext: "₹6,000–₹11,000 per sq.ft.",
    lifestyle:
      "CG Road dining belt, premium offices, and central Ahmedabad connectivity at its best.",
    coordinates: { lat: "23.0327", lng: "72.5632" },
    corridor: "central",
  },
  {
    slug: "cg-road",
    label: "CG Road",
    area: "CG Road",
    weight: 6,
    marketNote:
      "Ahmedabad's prime commercial and residential spine — highest commercial property demand in the city.",
    priceContext: "₹7,000–₹14,000 per sq.ft.",
    lifestyle:
      "Premium retail, fine dining, corporate offices, and central Ahmedabad's most active lifestyle corridor.",
    coordinates: { lat: "23.0254", lng: "72.5644" },
    corridor: "central",
  },
  {
    slug: "ashram-road",
    label: "Ashram Road",
    area: "Ashram Road",
    weight: 5,
    marketNote:
      "Historic commercial corridor along the Sabarmati — undergoing premium redevelopment with riverfront access.",
    priceContext: "₹5,500–₹10,000 per sq.ft.",
    lifestyle:
      "Sabarmati Riverfront access, Ahmedabad's heritage district, and improving commercial infrastructure.",
    coordinates: { lat: "23.0193", lng: "72.5729" },
    corridor: "central",
  },
  {
    slug: "drive-in-road",
    label: "Drive-in Road",
    area: "Drive-in Road",
    weight: 5,
    marketNote:
      "Established residential address between Bodakdev and Navrangpura with premium apartment supply.",
    priceContext: "₹6,500–₹12,000 per sq.ft.",
    lifestyle: "Between Bodakdev's social infrastructure and Navrangpura's central business access.",
    coordinates: { lat: "23.0437", lng: "72.5438" },
    corridor: "west",
  },
  {
    slug: "gurukul",
    label: "Gurukul",
    area: "Gurukul",
    weight: 5,
    marketNote:
      "Education hub with IIM-A and several premium schools — strong academic and professional buyer demand.",
    priceContext: "₹6,000–₹11,000 per sq.ft.",
    lifestyle:
      "IIM-A adjacency, premium schools, and Ahmedabad's academic community lifestyle access.",
    coordinates: { lat: "23.0481", lng: "72.5472" },
    corridor: "west",
  },
  {
    slug: "prahlad-nagar-garden",
    label: "Prahlad Nagar Garden",
    area: "Prahlad Nagar Garden",
    weight: 5,
    marketNote:
      "Upscale residential pocket adjacent to Prahladnagar Corporate Road — green, low-density living.",
    priceContext: "₹5,500–₹9,500 per sq.ft.",
    lifestyle:
      "Garden-facing residential buildings adjacent to Prahladnagar's corporate business district.",
    coordinates: { lat: "23.0175", lng: "72.5270" },
    corridor: "sg-highway",
  },
  {
    slug: "anandnagar",
    label: "Anandnagar",
    area: "Anandnagar",
    weight: 4,
    marketNote:
      "Mid-western suburb with improving connectivity and growing premium apartment supply.",
    priceContext: "₹4,500–₹7,500 per sq.ft.",
    lifestyle: "Western Ahmedabad access at mid-range pricing with improving social infrastructure.",
    coordinates: { lat: "23.0251", lng: "72.5028" },
    corridor: "west",
  },
  {
    slug: "sola",
    label: "Sola",
    area: "Sola",
    weight: 5,
    marketNote:
      "Adjacent to Science City and SG Highway — strong value option with premium apartment supply.",
    priceContext: "₹5,500–₹9,000 per sq.ft.",
    lifestyle: "Science City Road and SG Highway proximity at competitive pricing.",
    coordinates: { lat: "23.0625", lng: "72.5364" },
    corridor: "sg-highway",
  },
  {
    slug: "naranpura",
    label: "Naranpura",
    area: "Naranpura",
    weight: 4,
    marketNote:
      "Established mid-western residential area with strong school access and Satellite connectivity.",
    priceContext: "₹5,000–₹8,500 per sq.ft.",
    lifestyle: "Satellite and Navrangpura access with established civic infrastructure.",
    coordinates: { lat: "23.0559", lng: "72.5476" },
    corridor: "west",
  },
  {
    slug: "nikol",
    label: "Nikol",
    area: "Nikol",
    weight: 4,
    marketNote:
      "Eastern Ahmedabad's primary affordable growth corridor with strong first-home buyer demand.",
    priceContext: "₹2,500–₹5,000 per sq.ft.",
    lifestyle: "Eastern ring road connectivity and affordable residential supply for first-time buyers.",
    coordinates: { lat: "23.0471", lng: "72.6445" },
    corridor: "east",
  },
  {
    slug: "naroda",
    label: "Naroda",
    area: "Naroda",
    weight: 4,
    marketNote:
      "Industrial and residential mixed zone in north-east Ahmedabad with affordable pricing.",
    priceContext: "₹2,500–₹4,500 per sq.ft.",
    lifestyle: "NH-47 connectivity and affordable housing for Ahmedabad's industrial workforce.",
    coordinates: { lat: "23.0925", lng: "72.6452" },
    corridor: "east",
  },
  {
    slug: "vastral",
    label: "Vastral",
    area: "Vastral",
    weight: 4,
    marketNote:
      "Eastern Metro connectivity hub — Vastral Metro Station drives residential demand growth.",
    priceContext: "₹2,500–₹4,500 per sq.ft.",
    lifestyle: "Ahmedabad Metro Station, eastern ring road, and affordable residential supply.",
    coordinates: { lat: "23.0376", lng: "72.6597" },
    corridor: "east",
  },
  {
    slug: "oganaj",
    label: "Oganaj",
    area: "Oganaj",
    weight: 4,
    marketNote: "Northern growth pocket near Gota with affordable pricing and SP Ring Road access.",
    priceContext: "₹3,000–₹5,500 per sq.ft.",
    lifestyle: "SP Ring Road connectivity and affordable land supply for plot/villa buyers.",
    coordinates: { lat: "23.1174", lng: "72.5541" },
    corridor: "north-west",
  },
  {
    slug: "tragad",
    label: "Tragad",
    area: "Tragad",
    weight: 4,
    marketNote:
      "North-western suburb with Chandkheda connectivity and growing premium apartment supply.",
    priceContext: "₹3,000–₹5,500 per sq.ft.",
    lifestyle: "Chandkheda Road and GIFT City feeder corridor with affordable residential options.",
    coordinates: { lat: "23.1100", lng: "72.6083" },
    corridor: "north-west",
  },
  {
    slug: "kudasan",
    label: "Kudasan",
    area: "Kudasan, Gandhinagar",
    weight: 5,
    marketNote:
      "Gandhinagar's premier residential sector — high-quality planned development near GIFT City.",
    priceContext: "₹4,500–₹7,500 per sq.ft.",
    lifestyle:
      "Gandhinagar's best civic infrastructure adjacent to GIFT City with wide roads and planned sectors.",
    coordinates: { lat: "23.1703", lng: "72.6423" },
    corridor: "gift-city",
  },
  {
    slug: "infocity",
    label: "Infocity",
    area: "Infocity, Gandhinagar",
    weight: 5,
    marketNote:
      "Gandhinagar's IT corridor — Infocity IT park drives strong professional rental demand.",
    priceContext: "₹4,000–₹7,000 per sq.ft.",
    lifestyle:
      "Infocity IT park proximity, GIFT City access, and Gandhinagar's planned residential sectors.",
    coordinates: { lat: "23.1896", lng: "72.6306" },
    corridor: "gift-city",
  },
  {
    slug: "adalaj",
    label: "Adalaj",
    area: "Adalaj",
    weight: 4,
    marketNote:
      "Gandhinagar satellite town with heritage stepwell and growing premium residential supply.",
    priceContext: "₹3,500–₹6,500 per sq.ft.",
    lifestyle:
      "Adalaj Stepwell heritage site, SH-71 connectivity, and growing premium villa supply.",
    coordinates: { lat: "23.1664", lng: "72.5810" },
    corridor: "north-west",
  },
  {
    slug: "kathwada",
    label: "Kathwada",
    area: "Kathwada",
    weight: 3,
    marketNote:
      "Eastern industrial zone with affordable plots and warehouse supply near GIDC.",
    priceContext: "₹1,500–₹4,000 per sq.ft.",
    lifestyle: "GIDC industrial estate proximity and eastern ring road access.",
    coordinates: { lat: "23.0557", lng: "72.6717" },
    corridor: "east",
  },
  {
    slug: "randesan",
    label: "Randesan",
    area: "Randesan, Gandhinagar",
    weight: 4,
    marketNote:
      "Gandhinagar's institutional zone — home to MICA, PDPU, and growing student/faculty housing demand.",
    priceContext: "₹3,500–₹6,000 per sq.ft.",
    lifestyle:
      "MICA, PDPU, and GIFT City academic proximity drive strong rental demand from faculty and professionals.",
    coordinates: { lat: "23.1779", lng: "72.6667" },
    corridor: "gift-city",
  },
  {
    slug: "ognaj",
    label: "Ognaj",
    area: "Ognaj",
    weight: 4,
    marketNote:
      "Western suburb between Bopal and Shela — affordable villa and plot supply with improving roads.",
    priceContext: "₹3,000–₹5,500 per sq.ft.",
    lifestyle: "Bopal-Shela Road connectivity and growing residential supply at accessible pricing.",
    coordinates: { lat: "23.0019", lng: "72.4682" },
    corridor: "west",
  },
  {
    slug: "bavla",
    label: "Bavla",
    area: "Bavla",
    weight: 3,
    marketNote:
      "Emerging south-western suburb with large plot and farmhouse supply for weekend/investment buyers.",
    priceContext: "₹1,500–₹4,000 per sq.ft.",
    lifestyle:
      "NH-947 connectivity and wide open land supply for farmhouse and plot investors.",
    coordinates: { lat: "22.9292", lng: "72.3622" },
    corridor: "south",
  },
  {
    slug: "narol",
    label: "Narol",
    area: "Narol",
    weight: 3,
    marketNote:
      "Southern Ahmedabad's industrial hub with textile and manufacturing industry workforce housing.",
    priceContext: "₹2,000–₹4,000 per sq.ft.",
    lifestyle: "Southern ring road connectivity and affordable housing for industrial workforce.",
    coordinates: { lat: "22.9680", lng: "72.6200" },
    corridor: "south",
  },
  {
    slug: "sanand",
    label: "Sanand",
    area: "Sanand",
    weight: 4,
    marketNote:
      "Major automotive and industrial hub — Tata Nano plant and auto-cluster drive investor demand.",
    priceContext: "₹2,000–₹4,500 per sq.ft.",
    lifestyle:
      "Industrial township proximity with affordable plots and commercial supply for business investors.",
    coordinates: { lat: "22.9931", lng: "72.3873" },
    corridor: "south",
  },
  {
    slug: "bareja",
    label: "Bareja",
    area: "Bareja",
    weight: 3,
    marketNote:
      "South-eastern affordable suburb with industrial proximity and lower-cost land supply.",
    priceContext: "₹1,500–₹3,500 per sq.ft.",
    lifestyle:
      "NH-8 connectivity and affordable residential supply for Ahmedabad's south-eastern workforce.",
    coordinates: { lat: "22.9564", lng: "72.6097" },
    corridor: "south",
  },
  {
    slug: "dhandhuka",
    label: "Dhandhuka",
    area: "Dhandhuka",
    weight: 2,
    marketNote:
      "Rural taluka with agricultural land and farmhouse investment opportunities near Ahmedabad district.",
    priceContext: "₹500–₹2,500 per sq.ft.",
    lifestyle: "Agricultural belts, farmhouse land supply, and rural connectivity near Ahmedabad.",
    coordinates: { lat: "22.3916", lng: "71.9882" },
    corridor: "south",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// PROPERTY TYPES — Residential + Commercial
// ─────────────────────────────────────────────────────────────────────────────

export interface SeoDimPropertyType {
  slug: string;
  label: string;
  pluralLabel: string;
  weight: number;
  segment: "residential" | "commercial";
  marketNote: string;
  /** BHK options applicable to this type (empty = N/A for commercial) */
  bhkApplicable: boolean;
  schemaType: string;
}

export const SEO_PROPERTY_TYPES: SeoDimPropertyType[] = [
  {
    slug: "luxury-flats",
    label: "Luxury Flat",
    pluralLabel: "Luxury Flats",
    weight: 10,
    segment: "residential",
    marketNote:
      "The most transacted premium residential format in Ahmedabad — deepest buyer depth and best resale liquidity.",
    bhkApplicable: true,
    schemaType: "Apartment",
  },
  {
    slug: "penthouses",
    label: "Penthouse",
    pluralLabel: "Penthouses",
    weight: 8,
    segment: "residential",
    marketNote:
      "Sky-level residences with private terraces — the rarest and most appreciating luxury format in Ahmedabad.",
    bhkApplicable: true,
    schemaType: "Apartment",
  },
  {
    slug: "villas",
    label: "Villa",
    pluralLabel: "Villas",
    weight: 8,
    segment: "residential",
    marketNote:
      "Independent homes with private land — land-backed assets with strong joint-family demand in western Ahmedabad.",
    bhkApplicable: true,
    schemaType: "SingleFamilyResidence",
  },
  {
    slug: "duplex",
    label: "Duplex Apartment",
    pluralLabel: "Duplex Apartments",
    weight: 7,
    segment: "residential",
    marketNote:
      "Double-floor luxury residences — villa-scale living with tower security and managed amenities.",
    bhkApplicable: true,
    schemaType: "Apartment",
  },
  {
    slug: "office-space",
    label: "Office Space",
    pluralLabel: "Office Spaces",
    weight: 7,
    segment: "commercial",
    marketNote:
      "Grade-A office supply in Prahladnagar, CG Road, and SG Highway corridors — strongest commercial demand in Ahmedabad.",
    bhkApplicable: false,
    schemaType: "OfficeBuilding",
  },
  {
    slug: "retail-space",
    label: "Retail Space",
    pluralLabel: "Retail Spaces",
    weight: 6,
    segment: "commercial",
    marketNote:
      "High-street retail on Sindhu Bhavan Road, CG Road, and SG Highway — premium retail demand from national brands.",
    bhkApplicable: false,
    schemaType: "Store",
  },
  {
    slug: "commercial-plots",
    label: "Commercial Plot",
    pluralLabel: "Commercial Plots",
    weight: 5,
    segment: "commercial",
    marketNote:
      "Freehold commercial land in Ahmedabad's growth corridors — self-construction for industrial, logistics, or retail use.",
    bhkApplicable: false,
    schemaType: "LandmarksOrHistoricalBuildings",
  },
  {
    slug: "warehouse",
    label: "Warehouse",
    pluralLabel: "Warehouses",
    weight: 5,
    segment: "commercial",
    marketNote:
      "Logistics and warehousing demand anchored by Sanand auto-cluster, GIDC estates, and NH-48 connectivity.",
    bhkApplicable: false,
    schemaType: "Warehouse",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// BHK OPTIONS (residential only)
// ─────────────────────────────────────────────────────────────────────────────

export interface SeoDimBhk {
  slug: string;
  label: string;
  shortLabel: string;
  weight: number;
  bedroomCount: number;
  sizeRangeResidential: string; // sq.ft.
  marketNote: string;
}

export const SEO_BHK_OPTIONS: SeoDimBhk[] = [
  {
    slug: "2-bhk",
    label: "2 BHK",
    shortLabel: "2 BHK",
    weight: 7,
    bedroomCount: 2,
    sizeRangeResidential: "1,000–1,600 sq.ft.",
    marketNote:
      "Compact luxury format — high rental yield potential from professional tenants, rare in ultra-luxury buildings.",
  },
  {
    slug: "3-bhk",
    label: "3 BHK",
    shortLabel: "3 BHK",
    weight: 10,
    bedroomCount: 3,
    sizeRangeResidential: "1,800–2,800 sq.ft.",
    marketNote:
      "Deepest buyer pool and best resale velocity in Ahmedabad's premium residential market.",
  },
  {
    slug: "4-bhk",
    label: "4 BHK",
    shortLabel: "4 BHK",
    weight: 9,
    bedroomCount: 4,
    sizeRangeResidential: "2,500–4,000 sq.ft.",
    marketNote:
      "HNI flagship format — strongest capital appreciation and most active upgrade buyer pool.",
  },
  {
    slug: "5-bhk",
    label: "5 BHK",
    shortLabel: "5 BHK",
    weight: 7,
    bedroomCount: 5,
    sizeRangeResidential: "4,000–7,000 sq.ft.",
    marketNote:
      "Ultra-scarcity format — fewer than 30 genuine 5 BHK units transact in Ahmedabad annually.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// BUDGET RANGES
// ─────────────────────────────────────────────────────────────────────────────

export interface SeoDimBudget {
  slug: string;
  label: string;
  shortLabel: string;
  weight: number;
  minCr: number;  // in Crore (0 = no lower bound)
  maxCr: number;  // in Crore (999 = no upper bound)
  marketNote: string;
}

export const SEO_BUDGET_RANGES: SeoDimBudget[] = [
  {
    slug: "under-1-cr",
    label: "Under ₹1 Cr",
    shortLabel: "< ₹1 Cr",
    weight: 6,
    minCr: 0,
    maxCr: 1,
    marketNote:
      "Entry-level commercial and affordable residential — best for plot and small office investments.",
  },
  {
    slug: "1-2-cr",
    label: "₹1–2 Cr",
    shortLabel: "₹1–2 Cr",
    weight: 7,
    minCr: 1,
    maxCr: 2,
    marketNote:
      "Premium 2 BHK and entry commercial tier — high rental yield and broad buyer depth.",
  },
  {
    slug: "2-3-cr",
    label: "₹2–3 Cr",
    shortLabel: "₹2–3 Cr",
    weight: 10,
    minCr: 2,
    maxCr: 3,
    marketNote:
      "Ahmedabad's highest-volume luxury transaction bracket — 3 BHK premium apartments dominate.",
  },
  {
    slug: "3-5-cr",
    label: "₹3–5 Cr",
    shortLabel: "₹3–5 Cr",
    weight: 9,
    minCr: 3,
    maxCr: 5,
    marketNote:
      "4 BHK luxury flat territory — strongest capital appreciation segment in prime corridors.",
  },
  {
    slug: "5-cr-plus",
    label: "Above ₹5 Cr",
    shortLabel: "₹5 Cr+",
    weight: 7,
    minCr: 5,
    maxCr: 999,
    marketNote:
      "Ultra-premium tier — penthouses, 5 BHK sky mansions, and Grade-A commercial assets.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// INTENT / BUYER PSYCHOLOGY
// ─────────────────────────────────────────────────────────────────────────────

export interface SeoDimIntent {
  slug: string;
  label: string;
  weight: number;
  buyerProfile: string;
  contentAngle: string; // what this page emphasises
}

export const SEO_INTENTS: SeoDimIntent[] = [
  {
    slug: "for-investment",
    label: "For Investment",
    weight: 9,
    buyerProfile:
      "HNI and NRI investors seeking capital appreciation and rental income from Ahmedabad real estate.",
    contentAngle:
      "ROI, capital appreciation history, rental yield, exit liquidity, and corridor investment thesis.",
  },
  {
    slug: "for-self-use",
    label: "For Self Use",
    weight: 10,
    buyerProfile:
      "HNI families and end-users seeking a primary or secondary Ahmedabad residence.",
    contentAngle:
      "School catchment, lifestyle access, commute, building quality, society profile, and family fit.",
  },
  {
    slug: "high-roi",
    label: "High ROI",
    weight: 8,
    buyerProfile:
      "Pure investors who want maximum total return — prioritising appreciation over immediate yield.",
    contentAngle:
      "5-year appreciation data, supply scarcity, NRI buyer demand depth, and resale cycle timing.",
  },
  {
    slug: "rental-income",
    label: "Rental Income",
    weight: 8,
    buyerProfile:
      "Yield-focused investors who want immediate income from day one — NRIs and portfolio investors.",
    contentAngle:
      "Gross yield, tenant demand drivers, GIFT City proximity, furnished vs unfurnished analysis.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DIMENSION LOOKUP MAPS (for fast validation)
// ─────────────────────────────────────────────────────────────────────────────

export const LOCATION_MAP = new Map(SEO_LOCATIONS.map((l) => [l.slug, l]));
export const PROPERTY_TYPE_MAP = new Map(SEO_PROPERTY_TYPES.map((t) => [t.slug, t]));
export const BHK_MAP = new Map(SEO_BHK_OPTIONS.map((b) => [b.slug, b]));
export const BUDGET_MAP = new Map(SEO_BUDGET_RANGES.map((b) => [b.slug, b]));
export const INTENT_MAP = new Map(SEO_INTENTS.map((i) => [i.slug, i]));

/** Validates a URL segment against all dimension datasets. */
export function getSegmentDimension(
  segment: string
): { kind: "location" | "type" | "bhk" | "budget" | "intent"; data: SeoDimLocation | SeoDimPropertyType | SeoDimBhk | SeoDimBudget | SeoDimIntent } | null {
  if (LOCATION_MAP.has(segment)) return { kind: "location", data: LOCATION_MAP.get(segment)! };
  if (PROPERTY_TYPE_MAP.has(segment)) return { kind: "type", data: PROPERTY_TYPE_MAP.get(segment)! };
  if (BHK_MAP.has(segment)) return { kind: "bhk", data: BHK_MAP.get(segment)! };
  if (BUDGET_MAP.has(segment)) return { kind: "budget", data: BUDGET_MAP.get(segment)! };
  if (INTENT_MAP.has(segment)) return { kind: "intent", data: INTENT_MAP.get(segment)! };
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// PARSED COMBO TYPE
// ─────────────────────────────────────────────────────────────────────────────

export interface ParsedCombo {
  location?: SeoDimLocation;
  type?: SeoDimPropertyType;
  bhk?: SeoDimBhk;
  budget?: SeoDimBudget;
  intent?: SeoDimIntent;
  /** Segments that were provided in the URL (used for breadcrumb) */
  rawSegments: string[];
}

/**
 * Parses a combo URL segment array (from Next.js catch-all params)
 * into a structured ParsedCombo object.
 *
 * URL pattern: /p/[location]/[type]/[bhk]/[budget]/[intent]
 * All segments beyond location are optional.
 *
 * Returns null if any segment is unrecognised — caller should notFound().
 */
export function parseComboSegments(segments: string[]): ParsedCombo | null {
  const result: ParsedCombo = { rawSegments: segments };

  for (const seg of segments) {
    const dim = getSegmentDimension(seg);
    if (!dim) return null; // unknown segment → 404

    switch (dim.kind) {
      case "location": result.location = dim.data as SeoDimLocation; break;
      case "type":     result.type     = dim.data as SeoDimPropertyType; break;
      case "bhk":      result.bhk      = dim.data as SeoDimBhk; break;
      case "budget":   result.budget   = dim.data as SeoDimBudget; break;
      case "intent":   result.intent   = dim.data as SeoDimIntent; break;
    }
  }

  // A combo must have at least a location
  if (!result.location) return null;

  // BHK is only valid for BHK-applicable property types
  if (result.bhk && result.type && !result.type.bhkApplicable) return null;

  return result;
}

/** Builds the canonical href for a parsed combo. */
export function buildComboHref(combo: Partial<ParsedCombo>): string {
  const parts = ["/p"];
  if (combo.location) parts.push(combo.location.slug);
  if (combo.type) parts.push(combo.type.slug);
  if (combo.bhk) parts.push(combo.bhk.slug);
  if (combo.budget) parts.push(combo.budget.slug);
  if (combo.intent) parts.push(combo.intent.slug);
  return parts.join("/");
}
