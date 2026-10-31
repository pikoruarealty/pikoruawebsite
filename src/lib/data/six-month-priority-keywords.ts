export type PriorityKeywordCategory = "commercial" | "nri" | "private-client" | "trust";
export type PriorityWindow = "months-1-2" | "months-3-4" | "months-5-6";

export interface PriorityKeywordTarget {
  keyword: string;
  category: PriorityKeywordCategory;
  canonicalPath: string;
  window: PriorityWindow;
}

const target = (
  category: PriorityKeywordCategory,
  canonicalPath: string,
  window: PriorityWindow,
  ...keywords: string[]
): PriorityKeywordTarget[] =>
  keywords.map((keyword) => ({ keyword, category, canonicalPath, window }));

export const SIX_MONTH_PRIORITY_KEYWORDS: PriorityKeywordTarget[] = [
  ...target("commercial", "/luxury-real-estate-ahmedabad", "months-1-2",
    "luxury real estate Ahmedabad", "luxury property Ahmedabad"),
  ...target("commercial", "/luxury-property-consultant-ahmedabad", "months-1-2",
    "luxury real estate consultant Ahmedabad", "luxury property consultant Ahmedabad",
    "best luxury real estate consultant Ahmedabad"),
  ...target("commercial", "/real-estate-consultant-ahmedabad", "months-1-2",
    "trusted real estate consultant Ahmedabad"),
  ...target("commercial", "/ultra-luxury-properties-ahmedabad", "months-3-4",
    "ultra luxury properties Ahmedabad"),
  ...target("commercial", "/luxury-real-estate-ahmedabad", "months-3-4",
    "premium properties Ahmedabad", "luxury homes Ahmedabad"),
  ...target("commercial", "/luxury-apartments-ahmedabad", "months-1-2",
    "luxury apartments Ahmedabad", "luxury flats Ahmedabad"),
  ...target("commercial", "/luxury-4bhk-ahmedabad", "months-1-2",
    "4 BHK luxury flats Ahmedabad"),
  ...target("commercial", "/luxury-5bhk-ahmedabad", "months-1-2",
    "5 BHK luxury flats Ahmedabad"),
  ...target("commercial", "/penthouses-ahmedabad", "months-3-4",
    "penthouse Ahmedabad"),
  ...target("commercial", "/luxury-bungalows-ahmedabad", "months-3-4",
    "luxury bungalow Ahmedabad"),
  ...target("commercial", "/luxury-villas-ahmedabad", "months-3-4",
    "villas Ahmedabad"),
  ...target("commercial", "/luxury-plots-ahmedabad", "months-3-4",
    "luxury plots Ahmedabad"),

  ...target("nri", "/nri-property-investment-ahmedabad", "months-1-2",
    "NRI property investment Ahmedabad", "luxury property Ahmedabad for NRI"),
  ...target("nri", "/nri-property-consultant-ahmedabad", "months-1-2",
    "NRI property consultant Ahmedabad", "Ahmedabad property for NRI",
    "NRI real estate services Ahmedabad"),
  ...target("nri", "/learn/how-to-buy-property-as-nri-ahmedabad", "months-1-2",
    "buy property in Ahmedabad from abroad"),
  ...target("nri", "/virtual-property-tours-ahmedabad", "months-3-4",
    "virtual property tour Ahmedabad"),
  ...target("nri", "/property-management-for-nris", "months-3-4",
    "NRI property management Ahmedabad"),

  ...target("private-client", "/private-client-advisory/private-real-estate-advisory-ahmedabad", "months-3-4",
    "private real estate advisory Ahmedabad", "HNI property consultant Ahmedabad"),
  ...target("private-client", "/ultra-luxury-properties-ahmedabad", "months-3-4",
    "ultra luxury homes Ahmedabad", "exclusive properties Ahmedabad"),
  ...target("private-client", "/private-client-advisory/off-market-property-ahmedabad", "months-3-4",
    "off market property Ahmedabad"),
  ...target("private-client", "/private-client-advisory/discreet-property-sale-ahmedabad", "months-5-6",
    "private property sale Ahmedabad"),
  ...target("private-client", "/private-client-advisory/entire-floor-residences-ahmedabad", "months-5-6",
    "entire floor apartment Ahmedabad", "luxury family residence Ahmedabad"),

  ...target("trust", "/real-estate-consultant-ahmedabad", "months-5-6",
    "best real estate agent Ahmedabad", "most trusted real estate consultant Ahmedabad"),
  ...target("trust", "/properties", "months-5-6",
    "verified luxury properties Ahmedabad"),
  ...target("trust", "/luxury-property-consultant-ahmedabad", "months-5-6",
    "top property consultant Ahmedabad", "luxury property advisor Ahmedabad"),
];

export const SIX_MONTH_KEYWORD_GUARDRAILS = [
  "One canonical target per priority keyword.",
  "SEO keywords never alter property matchKeywords or visible filtering.",
  "No bulk homepage repetition or hidden keyword blocks.",
  "No fabricated reviews, endorsements, celebrity associations, prices or return claims.",
  "No copied builder brochure text or stale inventory represented as current.",
  "No paid low-quality backlink schemes or fabricated Google Business locations.",
  "No material RERA disclosure may be hidden.",
] as const;

export function getPriorityKeywordsForPath(path: string): string[] {
  return SIX_MONTH_PRIORITY_KEYWORDS
    .filter((target) => target.canonicalPath === path)
    .map((target) => target.keyword);
}
