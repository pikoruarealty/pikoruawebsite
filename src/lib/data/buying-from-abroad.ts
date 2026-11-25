/**
 * buying-from-abroad.ts
 *
 * The "Buying from abroad" block (components/seo/BuyingFromAbroad.tsx).
 * Buyers searching from outside India land on ordinary property, area and
 * guide pages (Search Console, Nov 2026: they search like local buyers and
 * rarely type "NRI"), so the block goes on every public page except the NRI
 * pages, which already cover the same ground in more depth:
 *   - full version: home, /properties, landing pages, guides
 *   - compact version: property detail pages, blog posts, /p/ filter pages
 */

/** NRI pages (/nri, /nri/..., /nri-..., and guides with "nri" in the slug) skip the block. */
const NRI_PATH_RE = /(^|[/-])nri($|[/-])/i;

export function showsBuyingFromAbroad(path: string): boolean {
  return !NRI_PATH_RE.test(path);
}

/** Where the "Book a call" button goes on pages with no time-zone form of their own. */
export const ABROAD_CALL_FALLBACK_HREF = "/nri#enquire";

/** Country guides linked from the block. Each must be a page that renders (checked in test-seo-routing). */
export const ABROAD_COUNTRY_LINKS = [
  { href: "/nri/usa", label: "USA" },
  { href: "/nri/uk", label: "UK" },
  { href: "/nri/dubai", label: "UAE" },
  { href: "/nri/canada", label: "Canada" },
  { href: "/nri/australia", label: "Australia" },
  { href: "/nri/singapore", label: "Singapore" },
  { href: "/nri/east-africa", label: "East Africa" },
] as const;

export const ABROAD_SUMMARY =
  "See homes on a live video call, sign through a power of attorney, check the paperwork from abroad, and book a WhatsApp call in your own time zone.";

export const ABROAD_STEPS = [
  {
    title: "See the home on video",
    body:
      "An advisor walks you through each shortlisted home on a live WhatsApp or Zoom video call: the rooms, the view, the light and the building's shared areas. Family in Ahmedabad can visit in person while you watch.",
  },
  {
    title: "Sign through a power of attorney",
    body:
      "If you can't fly in to sign, you can give someone you trust a power of attorney for this one purchase. You sign it abroad at the Indian embassy or consulate, or before a notary with an apostille. It is then stamped in Gujarat after it arrives. Have a lawyer draft it.",
  },
  {
    title: "Paperwork without travelling",
    body:
      "RERA registration, approvals and the title documents are shared as scans so you and your lawyer can check them before anything is signed. Payment comes from abroad through normal banking channels or from your NRE, NRO or FCNR account. Only the registration needs you or your attorney in person at the sub-registrar's office.",
  },
  {
    title: "A call in your time zone",
    body:
      "Tell us where you live and when suits you: morning, afternoon or evening, your time. We call on WhatsApp in your day, whether you are in the USA, the UK, the UAE, Canada or Australia.",
  },
] as const;
