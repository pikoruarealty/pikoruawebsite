/**
 * combo-content-engine.ts
 *
 * Pure template content engine.
 *
 * Takes a ParsedCombo and returns a fully structured ProgrammaticPage —
 * no AI calls, no DB reads, pure deterministic interpolation from dimension data.
 *
 * Each output is substantively differentiated by:
 *  - Location-specific market context (price, lifestyle, corridor)
 *  - Property-type-specific positioning
 *  - BHK-specific size/price context
 *  - Budget-specific investment framing
 *  - Intent-specific buyer psychology
 *
 * This prevents thin-content penalties by ensuring every page has
 * location × type × intent signals that are unique to that combination.
 */

import type {
  ParsedCombo,
  SeoDimLocation,
  SeoDimPropertyType,
  SeoDimBhk,
  SeoDimBudget,
  SeoDimIntent,
} from "@/lib/data/seo-dimensions";
import { buildComboHref } from "@/lib/data/seo-dimensions";

// ─────────────────────────────────────────────────────────────────────────────
// OUTPUT TYPE
// ─────────────────────────────────────────────────────────────────────────────

export interface ProgrammaticPage {
  /** Canonical href — /p/[location]/[type]/[bhk]/[budget]/[intent] */
  href: string;
  /** <title> tag */
  title: string;
  /** <meta name="description"> */
  description: string;
  /** Main page heading */
  h1: string;
  /** Eyebrow label (corridor + type) */
  eyebrow: string;
  /** 2–3 sentence intro paragraph */
  intro: string;
  /** Hero image path */
  heroImage: string;
  /** 3 market signal bullets */
  marketSignals: string[];
  /** 3 buyer profile bullets */
  idealFor: string[];
  /** 4–5 FAQ items */
  faqs: { question: string; answer: string }[];
  /** 3–4 body paragraphs (### headings supported) */
  bodyContent: string[];
  /**
   * If true, the page has no matching properties — show noindex + contact CTA.
   * Set by the route after property matching.
   */
  noindex?: boolean;
  /** Parsed combo — available for the page component */
  combo: ParsedCombo;
  /** Schema type for JSON-LD */
  schemaType: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const HERO_IMAGES = [
  "/properties/maruti-360/maruti-360-view.jpg",
  "/properties/ikebana/ikebana1.png",
  "/properties/capstone/capstone-1-courtyard.jpg",
  "/properties/anurita/anurita-1.jpg",
  "/properties/kalrav-alpines/kalrav-alpines-1.jpg",
];

/** Deterministic image selection based on location + type slugs (no randomness). */
function pickHeroImage(combo: ParsedCombo): string {
  const key = `${combo.location?.slug ?? ""}${combo.type?.slug ?? ""}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) % HERO_IMAGES.length;
  }
  return HERO_IMAGES[hash];
}

/** Human-readable label for the combo (used in h1, title, etc). */
function comboLabel(combo: ParsedCombo): {
  propertyPhrase: string;  // e.g. "4 BHK Luxury Flats"
  locationPhrase: string;  // e.g. "Thaltej, Ahmedabad"
  budgetPhrase: string;    // e.g. "Under ₹3 Cr" or ""
  intentPhrase: string;    // e.g. "for Investment" or ""
} {
  const type = combo.type;
  const bhk = combo.bhk;
  const loc = combo.location!;

  const propertyPhrase = type
    ? bhk && type.bhkApplicable
      ? `${bhk.label} ${type.pluralLabel}`
      : type.pluralLabel
    : "Properties";

  const locationPhrase = `${loc.label}, Ahmedabad`;
  const budgetPhrase = combo.budget ? combo.budget.label : "";
  const intentPhrase = combo.intent ? combo.intent.label : "";

  return { propertyPhrase, locationPhrase, budgetPhrase, intentPhrase };
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT TEMPLATES
// ─────────────────────────────────────────────────────────────────────────────

function buildTitle(combo: ParsedCombo): string {
  const { propertyPhrase, locationPhrase, budgetPhrase, intentPhrase } = comboLabel(combo);
  const parts = [propertyPhrase, "in", locationPhrase];
  if (budgetPhrase) parts.push(budgetPhrase);
  if (intentPhrase) parts.push(`—`, intentPhrase);
  parts.push("| PIKORUA Realty");
  return parts.join(" ");
}

function buildH1(combo: ParsedCombo): string {
  const { propertyPhrase, locationPhrase, budgetPhrase, intentPhrase } = comboLabel(combo);
  const parts = [propertyPhrase, "in", locationPhrase];
  if (budgetPhrase) parts.push(budgetPhrase);
  if (intentPhrase) parts.push(`—`, intentPhrase);
  return parts.join(" ");
}

function buildDescription(combo: ParsedCombo): string {
  const loc = combo.location!;
  const { propertyPhrase, budgetPhrase, intentPhrase } = comboLabel(combo);

  const budgetClause = budgetPhrase ? ` ${budgetPhrase}` : "";
  const intentClause = intentPhrase ? ` ${intentPhrase.toLowerCase()}.` : ".";

  return `Find ${propertyPhrase} in ${loc.label}, Ahmedabad${budgetClause}${intentClause} ${loc.marketNote} Advisory by PIKORUA Realty — Ahmedabad's luxury property specialists.`;
}

function buildEyebrow(combo: ParsedCombo): string {
  const loc = combo.location!;
  const type = combo.type;
  const intent = combo.intent;

  const parts = [loc.label];
  if (type) parts.push(type.pluralLabel);
  if (intent) parts.push(intent.label);

  return parts.join(" · ");
}

function buildIntro(combo: ParsedCombo): string {
  const loc = combo.location!;
  const type = combo.type;
  const bhk = combo.bhk;
  const budget = combo.budget;
  const intent = combo.intent;

  const propertyDesc = type
    ? bhk && type.bhkApplicable
      ? `${bhk.label} ${type.pluralLabel.toLowerCase()}`
      : type.pluralLabel.toLowerCase()
    : "properties";

  const budgetClause = budget ? ` in the ${budget.label} range` : "";
  const intentClause = intent
    ? ` — particularly attractive ${intent.label.toLowerCase()}`
    : "";

  return `${loc.label} is one of Ahmedabad's ${loc.corridor === "west" ? "most sought-after western" : loc.corridor === "gift-city" ? "fastest-growing GIFT City-adjacent" : loc.corridor === "sg-highway" ? "most connected SG Highway" : loc.corridor === "central" ? "most established central" : "growing"} corridors${intentClause}. ${loc.lifestyle} This page curates verified ${propertyDesc}${budgetClause} in ${loc.label} through PIKORUA Realty's private advisory network — covering developer-verified projects, RERA compliance, price trends, and investment analysis.`;
}

function buildMarketSignals(combo: ParsedCombo): string[] {
  const loc = combo.location!;
  const type = combo.type;
  const bhk = combo.bhk;
  const budget = combo.budget;
  const intent = combo.intent;

  const signals: string[] = [];

  // Signal 1: Location price context
  signals.push(
    `${loc.label} ${type ? type.pluralLabel.toLowerCase() : "properties"} are priced ${loc.priceContext}${budget ? ` — ${budget.label} range covers ${bhk ? bhk.label + " " : ""}units in ${loc.area}'s competitive buildings` : ""}.`
  );

  // Signal 2: Type or BHK market signal
  if (type) {
    signals.push(type.marketNote);
  } else {
    signals.push(`${loc.label}'s property market offers ${loc.corridor === "west" ? "western Ahmedabad's premium residential depth" : "strong buyer demand across all property types"}.`);
  }

  // Signal 3: Intent or BHK signal
  if (intent) {
    signals.push(`${intent.contentAngle.split(",")[0]} — a key factor for ${intent.label.toLowerCase()} buyers in ${loc.label}.`);
  } else if (bhk) {
    signals.push(bhk.marketNote);
  } else {
    signals.push(`${loc.marketNote}`);
  }

  return signals;
}

function buildIdealFor(combo: ParsedCombo): string[] {
  const loc = combo.location!;
  const type = combo.type;
  const bhk = combo.bhk;
  const budget = combo.budget;
  const intent = combo.intent;

  const profileBase = intent?.buyerProfile ?? `Buyers seeking ${type ? type.pluralLabel.toLowerCase() : "property"} in ${loc.label}`;

  return [
    `${profileBase}.`,
    `${bhk ? bhk.label + " " : ""}${type ? type.pluralLabel.toLowerCase() + " " : "property "}buyers who want ${loc.corridor === "west" ? "western Ahmedabad's premium corridor" : loc.corridor === "gift-city" ? "GIFT City-adjacent access" : "Ahmedabad's growing corridor"} at ${budget ? budget.label + " pricing" : "competitive pricing"}.`,
    `NRIs and HNI investors who want PIKORUA Realty's private advisory access to ${loc.label}'s best available inventory.`,
  ];
}

function buildFaqs(combo: ParsedCombo): { question: string; answer: string }[] {
  const loc = combo.location!;
  const type = combo.type;
  const bhk = combo.bhk;
  const budget = combo.budget;
  const intent = combo.intent;

  const faqList: { question: string; answer: string }[] = [];

  // FAQ 1: Price question
  const priceSubject = [bhk?.label, type?.pluralLabel, "in", loc.label, "Ahmedabad"].filter(Boolean).join(" ");
  faqList.push({
    question: `What is the price of ${priceSubject}?`,
    answer: `${type ? type.pluralLabel : "Properties"} in ${loc.label}, Ahmedabad are priced ${loc.priceContext}${bhk ? `. A ${bhk.label} ${type ? type.label.toLowerCase() : "unit"} in ${loc.label} typically covers ${bhk.sizeRangeResidential} carpet area` : ""}. ${budget ? `The ${budget.label} budget range is well-served in ${loc.label}'s premium buildings.` : `PIKORUA Realty can provide a corridor-specific shortlist with current pricing.`}`,
  });

  // FAQ 2: Location suitability
  faqList.push({
    question: `Is ${loc.label} a good area to buy ${type ? type.pluralLabel.toLowerCase() : "property"} in Ahmedabad?`,
    answer: `Yes. ${loc.marketNote} ${loc.lifestyle} ${intent ? `For ${intent.label.toLowerCase()} buyers in particular, ${loc.label} offers ${intent.contentAngle.split(",")[0].toLowerCase()}.` : `PIKORUA Realty advises buyers across all budgets on the best buildings within the ${loc.label} corridor.`}`,
  });

  // FAQ 3: Investment (only if investment/ROI intent, or no intent)
  if (!intent || intent.slug === "for-investment" || intent.slug === "high-roi") {
    faqList.push({
      question: `Is ${loc.label} good for property investment in Ahmedabad?`,
      // No return figures: this template fills every location, so a number
      // here can't be location data. Returns depend on the specific building.
      answer: `Investment performance in ${loc.label} depends on the specific building, purchase price, supply pipeline and infrastructure timing, so past returns elsewhere in the city are not a reliable guide and no return is guaranteed. ${type ? type.marketNote : ""} PIKORUA Realty's investment advisory covers corridor selection, recent registered transactions for the building, due diligence, and exit planning.`,
    });
  }

  // FAQ 4: BHK-specific
  if (bhk) {
    faqList.push({
      question: `What is the carpet area of a ${bhk.label} ${type ? type.label.toLowerCase() : "flat"} in ${loc.label}?`,
      answer: `${bhk.label} ${type ? type.pluralLabel.toLowerCase() : "flats"} in ${loc.label}, Ahmedabad typically range ${bhk.sizeRangeResidential} in carpet area. Premium buildings in the ${loc.area} corridor may offer larger floor plates — PIKORUA Realty can share exact layouts for shortlisted units.`,
    });
  }

  // FAQ 5: How to buy
  faqList.push({
    question: `How do I find the best ${type ? type.pluralLabel.toLowerCase() : "properties"} in ${loc.label} through PIKORUA?`,
    answer: `Contact PIKORUA Realty through the enquiry form or WhatsApp. Share your configuration (${bhk?.label ?? "BHK"}, budget${budget ? ` — ${budget.label}` : ""}, and intent${intent ? ` — ${intent.label}` : ""}). The team curates a shortlist of developer-verified, RERA-compliant options in ${loc.label} within 24–48 hours.`,
  });

  return faqList;
}

function buildBodyContent(combo: ParsedCombo): string[] {
  const loc = combo.location!;
  const type = combo.type;
  const bhk = combo.bhk;
  const budget = combo.budget;
  const intent = combo.intent;

  const paragraphs: string[] = [];

  // Para 1: Location context
  paragraphs.push(
    `### ${loc.label}: Market Context`,
    `${loc.label} sits within Ahmedabad's ${loc.corridor === "west" ? "western luxury corridor — the city's most valued residential belt" : loc.corridor === "gift-city" ? "GIFT City influence zone — India's fastest-growing financial district precinct" : loc.corridor === "sg-highway" ? "SG Highway corridor — Ahmedabad's primary commercial and residential arterial" : loc.corridor === "central" ? "central business district — the city's historical commercial and residential heart" : "growing residential zone"}. ${loc.marketNote} ${loc.lifestyle}`
  );

  // Para 2: Property type context
  if (type) {
    paragraphs.push(
      `### ${type.pluralLabel} in ${loc.label}`,
      `${type.marketNote} ${bhk ? `The ${bhk.label} format in particular covers ${bhk.sizeRangeResidential} carpet area — ${bhk.marketNote.toLowerCase()}` : `${loc.label}'s supply of quality ${type.pluralLabel.toLowerCase()} is curated by PIKORUA Realty across developer-verified projects.`} ${budget ? `At the ${budget.label} price point, buyers in ${loc.label} can access ${type.pluralLabel.toLowerCase()} with strong specifications in well-managed buildings.` : ""}`
    );
  }

  // Para 3: Investment / intent context
  if (intent) {
    paragraphs.push(
      `### ${intent.label} Case for ${loc.label}`,
      `${intent.contentAngle} ${loc.label}'s ${intent.slug === "rental-income" || intent.slug === "for-investment" ? `${loc.corridor === "sg-highway" || loc.corridor === "gift-city" ? "proximity to major employment clusters creates a structural floor for rental demand" : "established address recognition supports consistent buyer depth for exit liquidity"}` : `lifestyle infrastructure and ${loc.corridor === "west" ? "western corridor appreciation history" : "strong demand growth fundamentals"} support the self-use case for discerning buyers`}.`
    );
  } else {
    // Generic investment para
    paragraphs.push(
      `### Investment Outlook for ${loc.label}`,
      `${loc.label} has delivered consistent capital appreciation driven by ${loc.corridor === "west" ? "scarcity of premium land in western Ahmedabad and deep NRI buyer demand" : loc.corridor === "gift-city" ? "GIFT City's employment growth and institutional occupier demand" : loc.corridor === "sg-highway" ? "SG Highway's connectivity premium and GIFT City rental demand" : "Ahmedabad's broad residential market growth"}. PIKORUA Realty's advisory covers project-level due diligence, builder track record assessment, and corridor-specific investment timing.`
    );
  }

  // Para 4: PIKORUA advisory CTA context
  paragraphs.push(
    `### Why Use PIKORUA Realty for ${loc.label}`,
    `PIKORUA Realty's advisory model is built on private access — not portal aggregation. The team maintains direct relationships with ${loc.label}'s best builders, building societies, and owner communities, enabling access to off-market inventory that does not appear on public portals. For ${type ? type.pluralLabel.toLowerCase() : "property"} buyers in ${loc.label}, this translates to a verified shortlist, unbiased project analysis, and end-to-end transaction support from enquiry through possession.`
  );

  return paragraphs;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN GENERATOR
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates a complete ProgrammaticPage from a parsed combo.
 * Pure function — deterministic output for the same input.
 */
export function generateComboPage(combo: ParsedCombo): ProgrammaticPage {
  const type = combo.type;

  return {
    href: buildComboHref(combo),
    title: buildTitle(combo),
    description: buildDescription(combo),
    h1: buildH1(combo),
    eyebrow: buildEyebrow(combo),
    intro: buildIntro(combo),
    heroImage: pickHeroImage(combo),
    marketSignals: buildMarketSignals(combo),
    idealFor: buildIdealFor(combo),
    faqs: buildFaqs(combo),
    bodyContent: buildBodyContent(combo),
    combo,
    schemaType: type?.schemaType ?? "RealEstateAgent",
  };
}
