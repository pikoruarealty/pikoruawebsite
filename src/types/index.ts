// ─── Residential Categories ────────────────────────────────────────────────
// Strictly residential — no commercial ever. This union is the single source
// of truth; use it in forms, CMS schemas, and API handlers.

export type ResidentialCategory =
  | "apartment"
  | "penthouse"
  | "duplex"
  | "villa"
  | "bungalow"
  | "plot"
  | "investment"
  | "residential-investment"
  | "office"
  | "showroom";

export const RESIDENTIAL_CATEGORIES: ResidentialCategory[] = [
  "apartment",
  "penthouse",
  "duplex",
  "villa",
  "bungalow",
  "plot",
  "investment",
  "residential-investment",
  "office",
  "showroom",
];

export const RESIDENTIAL_CATEGORY_LABELS: Record<ResidentialCategory, string> = {
  apartment: "Apartment",
  penthouse: "Penthouse",
  duplex: "Duplex",
  villa: "Villa",
  bungalow: "Bungalow",
  plot: "Plot / Land",
  investment: "Investment Property",
  "residential-investment": "Investment Property",
  office: "Office",
  showroom: "Showroom",
};

// ─── Locations / Corridors ────────────────────────────────────────────────

export type LocationSlug =
  | "iskon-ambli"
  | "sindhu-bhavan"
  | "thaltej"
  | "shilaj"
  | "vaishno-devi"
  | "sg-highway"
  | "other";

export const LOCATION_SLUGS: LocationSlug[] = [
  "iskon-ambli",
  "sindhu-bhavan",
  "thaltej",
  "shilaj",
  "vaishno-devi",
  "sg-highway",
  "other",
];

export const LOCATION_LABELS: Record<LocationSlug, string> = {
  "iskon-ambli": "Iskon-Ambli",
  "sindhu-bhavan": "Sindhu Bhavan",
  thaltej: "Thaltej",
  shilaj: "Shilaj",
  "vaishno-devi": "Vaishno Devi",
  "sg-highway": "SG Highway",
  other: "Other",
};

// ─── Property Status ──────────────────────────────────────────────────────

export type PropertyStatus =
  | "newly-launched"
  | "sample-ready"
  | "pre-launch"
  | "under-construction"
  | "near-possession"
  | "ready-to-move";

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  "newly-launched": "Newly Launched",
  "sample-ready": "Sample Ready",
  "pre-launch": "Pre-Launch",
  "under-construction": "Under Construction",
  "near-possession": "Near Possession",
  "ready-to-move": "Ready to Move",
};

// ─── Property (from Sanity CMS) ───────────────────────────────────────────

export interface Property {
  _id: string;
  title: string;
  slug: string;
  category: ResidentialCategory;
  location: LocationSlug;
  locationLabel: string;
  configuration: string;        // e.g. "4BHK", "5BHK / Penthouse / Duplex"
  builtUpArea?: number;         // sq.ft
  plotArea?: number;            // sq.ft
  floor?: string;               // e.g. "22nd Floor"
  price?: number;               // in Crores; null = priceOnRequest
  priceOnRequest: boolean;
  status: PropertyStatus;
  shortDescriptor: string;
  description: string;          // rich text rendered as HTML
  highlights: string[];
  gallery: SanityImage[];
  heroImage: SanityImage;
  isFeatured: boolean;
  isPublished: boolean;
  order?: number;
  seo?: PageSeo;
}

// ─── Location (from Sanity CMS) ───────────────────────────────────────────

export interface Location {
  _id: string;
  name: string;
  slug: LocationSlug;
  corridorDescription: string;
  heroImage?: SanityImage;
  coordinates?: { lat: number; lng: number };
  isActive: boolean;
}

// ─── Testimonial (from Sanity CMS) ────────────────────────────────────────

export interface Testimonial {
  _id: string;
  clientName: string;           // first name or initial only
  quote: string;
  context: string;              // e.g. "NRI buyer · Sindhu Bhavan"
  source: "google" | "direct";
  rating?: number;              // only if real and verifiable
  isFeatured: boolean;
  isPublished: boolean;
  reviewUrl?: string;
}

// ─── Sanity Image ─────────────────────────────────────────────────────────

export interface SanityImage {
  _type: "image";
  asset: { _ref: string; _type: "reference" };
  hotspot?: { x: number; y: number; height: number; width: number };
  crop?: { top: number; bottom: number; left: number; right: number };
  alt?: string;
}

// ─── SEO ──────────────────────────────────────────────────────────────────

export interface PageSeo {
  title?: string;
  description?: string;
  ogImage?: SanityImage;
}

// ─── About page (Supabase-managed singleton, see admin/actions.ts) ────────

export interface AboutPageContent {
  heroTitle?: string;
  founderAvatar?: string;
  founderStory?: string[];
  principles?: Array<{ label: string; body: string | string[] }>;
}

// ─── Guided Discovery / Lead ──────────────────────────────────────────────

export type LeadSource =
  | "discovery"
  | "enquiry"
  | "callback"
  | "consultation"
  | "whatsapp"
  | "popup"
  | "contact";

export type LeadPurpose =
  | "self-use"
  | "investment"
  | "nri-purchase"
  | "selling"
  | "exploring";

export type BudgetBand =
  | "1-2cr"
  | "3-4cr"
  | "5-7cr"
  | "8-10cr"
  | "10cr-plus";

export type Timeline =
  | "immediately"
  | "1-3months"
  | "3-6months"
  | "exploring";

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "won"
  | "lost";

export interface Lead {
  id: string;
  created_at: string;
  source: LeadSource;
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  category?: ResidentialCategory;
  location?: LocationSlug;
  locations?: LocationSlug[];
  budget_band?: BudgetBand;
  purpose?: LeadPurpose;
  timeline?: Timeline;
  preferred_callback_time?: string;
  property_ref?: string;
  message?: string;
  status: LeadStatus;
  is_hot: boolean;
  crm_synced: boolean;
  utm?: Record<string, string>;
  consent: boolean;
}

// ─── Discovery Step State ─────────────────────────────────────────────────

export interface DiscoveryState {
  step: 1 | 2 | 3 | 4 | 5 | 6;
  category?: ResidentialCategory;
  locations: LocationSlug[];
  budgetBand?: BudgetBand;
  purpose?: LeadPurpose;
  timeline?: Timeline;
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  preferredCallbackTime: string;
  prefillPropertyRef?: string;
  prefillLocation?: LocationSlug;
}

// ─── FAQ Item (Supabase-managed) ──────────────────────────────────────────
export interface GeneralFaq {
  id: string;
  question: string;
  answer: string;
  display_order: number;
  category: string; // 'general' | 'properties' | 'contact'
  created_at?: string;
}
