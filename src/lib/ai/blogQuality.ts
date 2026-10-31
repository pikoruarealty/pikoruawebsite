/**
 * Quality gate for AI-drafted blog posts (src/lib/ai/blogPipeline.ts).
 *
 * Deterministic checks only — no AI judging AI. A draft is:
 *  - "reject": malformed, too thin, or a duplicate of an existing post.
 *    Nothing is saved.
 *  - "hold":   well-formed but carries a risk a person should look at
 *    (regulated legal/tax topic, guaranteed-return language, figures the
 *    source article doesn't support). Saved as a pending-review draft with
 *    the reasons in review_notes.
 *  - "publish": passed every check.
 *
 * Pure functions, no server-only imports, so scripts/test-blog-pipeline.ts
 * can exercise them directly.
 */

import { z } from "zod";
import type { BlogPost } from "@/types/blog";

// ─── Draft shape ────────────────────────────────────────────────────────────

export const BLOG_CATEGORIES = {
  "market-report": "Market Report",
  "corridor-spotlight": "Corridor Spotlight",
  "nri-insights": "NRI Insights",
  "advisory": "Private Advisory",
  "luxury-living": "Luxury Living",
} as const satisfies Record<BlogPost["category"], string>;

export type BlogCategory = keyof typeof BLOG_CATEGORIES;

export const blogDraftSchema = z.object({
  title: z.string().trim().min(20).max(130),
  slug: z.string().trim().min(8).max(90),
  category: z.enum(Object.keys(BLOG_CATEGORIES) as [BlogCategory, ...BlogCategory[]]).catch("market-report"),
  htmlContent: z.string().min(2000),
  seoTitle: z.string().trim().min(15).max(120),
  seoDescription: z.string().trim().min(70).max(220),
  excerpt: z.string().trim().min(40).max(260),
  faqs: z
    .array(z.object({ question: z.string().trim().min(10), answer: z.string().trim().min(20) }))
    .min(3)
    .max(6),
  /** Up to 4 headline figures for the "Key numbers" box; each must come from the source. */
  keyNumbers: z
    .array(z.object({ value: z.string().trim().min(1).max(40), label: z.string().trim().min(3).max(90) }))
    .max(4)
    .optional()
    .catch(undefined),
});

export type ParsedBlogDraft = z.infer<typeof blogDraftSchema>;

// ─── Internal link targets ──────────────────────────────────────────────────

/**
 * Canonical pages the model may link to, by topic. Every href must render
 * (scripts/test-blog-pipeline.ts checks them against the route registry).
 * Replaces the earlier hardcoded list, most of whose URLs had since become
 * 301 redirects or 404s.
 */
export const BLOG_LINK_TARGETS: { topic: string; href: string }[] = [
  { topic: "Sindhu Bhavan Road", href: "/locations/sindhu-bhavan" },
  { topic: "Iskon-Ambli Road / Iscon Ambli Road", href: "/locations/iskon-ambli" },
  { topic: "Thaltej", href: "/locations/thaltej" },
  { topic: "Shilaj", href: "/locations/shilaj" },
  { topic: "Shela", href: "/locations/shela" },
  { topic: "Vaishno Devi Circle / Vaishnodevi", href: "/locations/vaishno-devi" },
  { topic: "Rajpath Club / Rajpath Rangoli Road", href: "/locations/rajpath-club" },
  { topic: "SG Highway", href: "/locations/sg-highway" },
  { topic: "Bodakdev", href: "/locations/bodakdev" },
  { topic: "luxury apartments / 4 BHK and 5 BHK flats", href: "/luxury-apartments-ahmedabad" },
  { topic: "penthouses", href: "/penthouses-ahmedabad" },
  { topic: "luxury villas", href: "/luxury-villas-ahmedabad" },
  { topic: "luxury bungalows", href: "/luxury-bungalows-ahmedabad" },
  { topic: "residential plots", href: "/luxury-plots-ahmedabad" },
  { topic: "investment property / rental yield", href: "/investment-property-ahmedabad" },
  { topic: "commercial property / offices / showrooms", href: "/commercial-property-ahmedabad" },
  { topic: "NRI property investment", href: "/nri-property-investment-ahmedabad" },
  { topic: "NRI home-buying process", href: "/learn/how-to-buy-property-as-nri-ahmedabad" },
  { topic: "HNI / family office / private client advisory", href: "/private-client-advisory" },
  { topic: "GIFT City", href: "/gift-city" },
  { topic: "Ahmedabad luxury market report", href: "/ahmedabad-luxury-property-market-report" },
];

/** Old link targets from the previous prompt → their current canonical page. */
const LEGACY_LINK_REWRITES: Record<string, string> = {
  "/sindhu-bhavan-road-properties": "/locations/sindhu-bhavan",
  "/iscon-ambli-road-properties": "/locations/iskon-ambli",
  "/thaltej-properties": "/locations/thaltej",
  "/sg-highway-properties": "/locations/sg-highway",
  "/shilaj-properties": "/locations/shilaj",
  "/vastrapur-properties": "/locations/vastrapur",
  "/villas-bungalows-ahmedabad": "/luxury-villas-ahmedabad",
  "/penthouses-duplexes-ahmedabad": "/penthouses-ahmedabad",
  "/luxury-penthouses-ahmedabad": "/penthouses-ahmedabad",
  "/nri-investment-ahmedabad": "/nri-property-investment-ahmedabad",
};

// ─── HTML sanitising ────────────────────────────────────────────────────────

const ALLOWED_TAGS = new Set([
  "h2", "h3", "h4", "p", "ul", "ol", "li", "strong", "em", "b", "i",
  "blockquote", "a", "br", "table", "thead", "tbody", "tr", "th", "td",
]);
/** Elements whose content is dropped along with the tag. */
const DROP_WITH_CONTENT = /<(script|style|iframe|object|embed|noscript|template|svg|math|form)\b[\s\S]*?<\/\1\s*>/gi;

export interface SanitizeResult {
  html: string;
  linksKept: string[];
  linksRewritten: string[];
  linksRemoved: string[];
}

/**
 * Rebuilds the article HTML from an allowlist. Every allowed tag is
 * re-emitted without attributes except a validated internal `href`; text
 * is escaped, so nothing from the model (or from a prompt-injected source
 * article) can add scripts, event handlers, styles or external links.
 */
export function sanitizeArticleHtml(html: string, knownPaths: Set<string>): SanitizeResult {
  const linksKept: string[] = [];
  const linksRewritten: string[] = [];
  const linksRemoved: string[] = [];
  const openAnchors: boolean[] = [];

  const input = html.replace(/<!--[\s\S]*?-->/g, "").replace(DROP_WITH_CONTENT, "");
  const tagPattern = /<\s*(\/?)\s*([a-zA-Z][a-zA-Z0-9]*)([^<>]*)>/g;
  let out = "";
  let last = 0;

  for (const match of input.matchAll(tagPattern)) {
    out += escapeText(input.slice(last, match.index));
    last = match.index! + match[0].length;

    const closing = match[1] === "/";
    let tag = match[2].toLowerCase();
    if (tag === "h1") tag = "h2";
    if (!ALLOWED_TAGS.has(tag)) continue;

    if (tag === "a") {
      if (closing) {
        if (openAnchors.pop()) out += "</a>";
        continue;
      }
      const href = match[3].match(/href\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
      const raw = (href?.[1] ?? href?.[2] ?? "").trim();
      const resolved = resolveInternalHref(raw, knownPaths);
      if (resolved) {
        (resolved === normalizePath(raw) ? linksKept : linksRewritten).push(resolved);
        out += `<a href="${resolved}">`;
        openAnchors.push(true);
      } else {
        if (raw) linksRemoved.push(raw);
        openAnchors.push(false);
      }
      continue;
    }

    if (tag === "br") {
      if (!closing) out += "<br />";
      continue;
    }
    out += closing ? `</${tag}>` : `<${tag}>`;
  }
  out += escapeText(input.slice(last));
  out += "</a>".repeat(openAnchors.filter(Boolean).length);

  return { html: out.trim(), linksKept, linksRewritten, linksRemoved };
}

function escapeText(text: string): string {
  return text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function normalizePath(href: string): string {
  return href.replace(/^https?:\/\/(www\.)?pikorua\.in/i, "").split(/[?#]/)[0].replace(/\/+$/, "") || "/";
}

/** A root-relative path on this site that renders, or null. */
function resolveInternalHref(href: string, knownPaths: Set<string>): string | null {
  if (!href || !/^(\/(?!\/)|https?:\/\/(www\.)?pikorua\.in)/i.test(href)) return null;
  const path = normalizePath(href);
  if (knownPaths.has(path)) return path;
  const rewritten = LEGACY_LINK_REWRITES[path];
  return rewritten && knownPaths.has(rewritten) ? rewritten : null;
}

export function htmlToText(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

// ─── Content risk checks ────────────────────────────────────────────────────

/**
 * Legal, regulatory and tax subjects. Content that discusses them needs a
 * person to check it against current authoritative sources (RBI/FEMA, the
 * Income-tax Department, GujRERA) before it goes live.
 */
const REGULATED_PATTERNS: { label: string; pattern: RegExp }[] = [
  { label: "FEMA", pattern: /\bFEMA\b|foreign exchange management/i },
  { label: "RBI rules", pattern: /\bRBI\b|reserve bank of india/i },
  { label: "repatriation", pattern: /repatriat/i },
  { label: "TDS / withholding tax", pattern: /\bTDS\b|tax deducted at source|section\s*195\b/i },
  { label: "capital gains / income tax", pattern: /capital gains? tax|income[- ]tax act|\bLTCG\b|\bSTCG\b|section\s*(54|54EC|54F)\b/i },
  { label: "DTAA", pattern: /\bDTAA\b|double tax(ation)? avoidance/i },
  { label: "NRE/NRO/FCNR accounts", pattern: /\b(NRE|NRO|FCNR)\b/ },
  { label: "power of attorney", pattern: /power of attorney|\bPoA\b/ },
  { label: "stamp duty rates", pattern: /stamp duty[^.]{0,60}\d+(\.\d+)?\s*%/i },
  { label: "GST rates", pattern: /\bGST\b[^.]{0,60}\d+(\.\d+)?\s*%/i },
];

const GUARANTEE_PATTERN =
  /guarantee(d|s)?\s+(returns?|appreciation|rental|income|profit|growth)|assured\s+(returns?|appreciation|rental|income)|risk[- ]free|zero[- ]risk|can(?:not|'t)\s+lose|double your (money|investment)|100\s*%\s*(safe|secure|returns?)/i;

/** Phrases the drafting prompt bans; a few slipping through is tolerated. */
const BANNED_PHRASES = [
  "delve", "tapestry", "testament", "pivotal", "beacon", "redefining", "paradigm shift",
  "game-changer", "game changer", "look no further", "in today's fast-paced world",
  "ultimate guide", "seamlessly", "unprecedented", "synergy", "cutting-edge", "unlock",
];

export function detectRegulatedTopics(text: string): string[] {
  return REGULATED_PATTERNS.filter(({ pattern }) => pattern.test(text)).map(({ label }) => label);
}

export function findGuaranteeClaims(text: string): string[] {
  const found = new Set<string>();
  for (const sentence of text.split(/(?<=[.!?])\s+/)) {
    const match = sentence.match(GUARANTEE_PATTERN);
    // "no one can guarantee returns" is the honest version — allow negations.
    if (match && !/\b(no|not|never|cannot|can't|nobody|without)\b[^.]{0,40}guarant/i.test(sentence)) {
      found.add(match[0].toLowerCase());
    }
  }
  return [...found];
}

export function countBannedPhrases(text: string): string[] {
  const lower = text.toLowerCase();
  return BANNED_PHRASES.filter((phrase) => lower.includes(phrase));
}

// Money in any currency: a currency symbol (Unicode \p{Sc}: ₹ $ £ € ¥ ₩ ₪ ฿ …,
// optionally prefixed as in US$, C$, A$, S$, HK$, NZ$, R$), an ISO code or
// common abbreviation (USD, GBP, AED, SAR, Rs, Dhs …) before or after the
// amount, or a currency word after it ("250,000 dollars"). Amounts may carry
// a magnitude (crore, lakh, thousand, million, billion, k, m, bn …).
const NUM = String.raw`\d[\d,]*(?:\.\d+)?`;
const MAGNITUDE = String.raw`(?:\s*(?:crores?|cr|lakhs?|lacs?|l|thousand|million|billion|trillion|mn|bn|k|m|b)\b)?`;
const CURRENCY_CODES = String.raw`(?:INR|USD|GBP|EUR|AED|SAR|QAR|KWD|OMR|BHD|CAD|AUD|NZD|SGD|HKD|JPY|CNY|RMB|CHF|ZAR|MYR|THB|SEK|NOK|DKK|KES|NGN|MUR)`;
const CURRENCY_BEFORE = String.raw`(?:(?:US|C|A|S|HK|NZ|NT|R)?\p{Sc}|\b(?:${CURRENCY_CODES}|Rs|Dhs?)\.?)`;
const CURRENCY_WORDS = String.raw`(?:dollars?|pounds?|euros?|dirhams?|riyals?|rials?|dinars?|rupees?|yen|yuan|renminbi|francs?|ringgits?|rand|shillings?|naira)`;
const FIGURE_PATTERN = new RegExp(
  [
    String.raw`${CURRENCY_BEFORE}\s?${NUM}${MAGNITUDE}`,
    String.raw`\b${NUM}${MAGNITUDE}\s*${CURRENCY_CODES}\b`,
    String.raw`\b${NUM}${MAGNITUDE}\s+${CURRENCY_WORDS}\b`,
    String.raw`\b${NUM}\s*(?:%|per\s*cent|percent)`,
    String.raw`\b${NUM}\s*(?:crores?|cr|lakhs?|lacs?)\b`,
  ].join("|"),
  "giu"
);

/**
 * Specific figures in the article: money in any currency, percentages, and
 * crore/lakh amounts. Plain counts, sizes and years are not figures here.
 */
export function extractFigures(text: string): string[] {
  return [...new Set(text.match(FIGURE_PATTERN) ?? [])].map((f) => f.trim());
}

/** "5.50" → "5.5", "11,000" → "11000", "12.0" → "12". */
function normalizeNumber(value: string): string {
  const n = value.replace(/[^\d.]/g, "").replace(/\.$/, "");
  return n.includes(".") ? n.replace(/0+$/, "").replace(/\.$/, "") : n;
}

/**
 * Figures in the article that don't appear (by their digits) in the source
 * article text. Without source text every figure is unsupported. Labelled
 * worked examples (see isExampleSentence) are hypothetical arithmetic, not
 * claims of fact, so their figures are not checked.
 */
export function findUnsupportedFigures(articleText: string, sourceText: string): string[] {
  const sourceNumbers = new Set((sourceText.match(/\d[\d,]*(?:\.\d+)?/g) ?? []).map(normalizeNumber));
  return extractFigures(withoutExampleSentences(articleText)).filter((figure) => {
    const digits = normalizeNumber(figure);
    return digits !== "" && !sourceNumbers.has(digits);
  });
}

/**
 * A clearly labelled hypothetical calculation: starts with "Example:" (or
 * "For example," / "Illustration:") and is framed as a supposition ("if",
 * "suppose", "assume", "say"). The drafting prompt asks for exactly this form.
 */
export function isExampleSentence(sentence: string): boolean {
  return (
    /^\s*(?:example|for example|illustration|illustrative example|worked example)\s*[:,—–-]/i.test(sentence) &&
    /\b(?:if|suppose|supposing|assum\w*|say|hypothetical\w*)\b/i.test(sentence)
  );
}

export function splitSentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).filter((s) => s.trim());
}

function withoutExampleSentences(text: string): string {
  return splitSentences(text).filter((s) => !isExampleSentence(s)).join(" ");
}

// ─── Duplicate detection ────────────────────────────────────────────────────

/** Words every post shares; ignored when comparing topics. */
const TOPIC_STOPWORDS = new Set([
  "a", "an", "and", "the", "of", "in", "on", "for", "to", "with", "from", "by", "at", "as", "is",
  "are", "its", "it", "why", "how", "what", "this", "that", "your", "you", "new", "vs", "via",
  "ahmedabad", "ahmedabads", "gujarat", "luxury", "real", "estate", "property", "properties",
  "market", "housing", "home", "homes", "residential", "premium", "investor", "investors",
  "investment", "buyers", "buyer", "hni", "nri", "nris", "hnis", "2025", "2026", "2027",
  "guide", "view", "perspective", "outlook", "analysis", "insights", "advisory", "pikorua",
]);

export function topicTokens(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[’']/g, "")
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 1 && !TOPIC_STOPWORDS.has(w))
  );
}

export function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const x of a) if (b.has(x)) shared++;
  return shared / (a.size + b.size - shared);
}

function shingles(text: string, size = 5): Set<string> {
  const words = text.toLowerCase().split(/[^a-z0-9₹]+/).filter(Boolean);
  const out = new Set<string>();
  for (let i = 0; i + size <= words.length; i++) out.add(words.slice(i, i + size).join(" "));
  return out;
}

export interface ExistingPostRef {
  id: string;
  slug: string;
  title: string;
  text?: string;
}

export const TITLE_DUPLICATE_THRESHOLD = 0.6;
export const CONTENT_DUPLICATE_THRESHOLD = 0.25;

/**
 * The existing post a headline/title (and optionally slug) is about the
 * same subject as, if any. Slugs are compared too because AI titles are
 * padded ("A Deep Dive into…") while slugs keep just the subject: on the
 * 2026 backlog, true duplicates scored 0.80–1.00 slug-to-slug and different
 * stories at most 0.17.
 */
export function findTopicDuplicate(title: string, existing: ExistingPostRef[], slug?: string): ExistingPostRef | null {
  const mine = [topicTokens(title), ...(slug ? [topicTokens(slug.replace(/-/g, " "))] : [])].filter((t) => t.size >= 2);
  if (mine.length === 0) return null;
  for (const post of existing) {
    const theirs = [topicTokens(post.title), topicTokens(post.slug.replace(/-/g, " "))];
    const score = Math.max(...mine.flatMap((a) => theirs.map((b) => jaccard(a, b))));
    if (score >= TITLE_DUPLICATE_THRESHOLD) return post;
  }
  return null;
}

/** The existing post whose body overlaps this text heavily, if any. */
export function findContentDuplicate(text: string, existing: ExistingPostRef[]): { post: ExistingPostRef; score: number } | null {
  const mine = shingles(text);
  let best: { post: ExistingPostRef; score: number } | null = null;
  for (const post of existing) {
    if (!post.text) continue;
    const score = jaccard(mine, shingles(post.text));
    if (score >= CONTENT_DUPLICATE_THRESHOLD && (!best || score > best.score)) best = { post, score };
  }
  return best;
}

// ─── Metadata normalising ───────────────────────────────────────────────────

/** Characters left for the page title once the layout appends " | PIKORUA Realty". */
export const SEO_TITLE_MAX = 58;
const BRAND_SUFFIX = /\s*(?:\||-|—)\s*PIKORUA(?:\s+Realty)?\s*$/i;

export function normalizeSeoTitle(seoTitle: string, title: string): string {
  const stripped = seoTitle.replace(BRAND_SUFFIX, "").trim();
  if (stripped.length <= SEO_TITLE_MAX) return stripped;
  const base = title.length <= SEO_TITLE_MAX ? title : stripped;
  if (base.length <= SEO_TITLE_MAX) return base;
  const cut = base.slice(0, SEO_TITLE_MAX);
  return cut
    .slice(0, cut.lastIndexOf(" "))
    .replace(/(?:[\s,:;–—-]+|\s+(?:and|or|the|of|for|in|on|to|with|a|an|&))+$/i, "");
}

export function normalizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
}

// ─── The gate ───────────────────────────────────────────────────────────────

export const MIN_WORDS = 700;
export const MAX_WORDS = 2600;
export const MIN_H2 = 3;
export const MIN_INTERNAL_LINKS = 2;
/** Unsupported figures tolerated before the draft is held. */
export const MAX_UNSUPPORTED_FIGURES = 2;
export const MAX_BANNED_PHRASES = 2;

export type GateDecision = "publish" | "hold" | "reject";

export interface GateResult {
  decision: GateDecision;
  /** Why the draft was rejected or held — empty when it can publish. */
  reasons: string[];
  /** Non-blocking observations kept in the run log. */
  warnings: string[];
  draft: ParsedBlogDraft | null;
  metrics: {
    words: number;
    h2: number;
    internalLinks: number;
    linksRewritten: string[];
    linksRemoved: string[];
    regulatedTopics: string[];
    guaranteeClaims: string[];
    unsupportedFigures: string[];
    bannedPhrases: string[];
    duplicateOf: string | null;
    /** Key-number entries dropped because their figure is not in the source. */
    keyNumbersDropped: string[];
  };
}

export interface GateInput {
  /** Raw model output (JSON object, possibly wrapped in prose). */
  raw: unknown;
  /** Readable text of the source article the draft was based on ("" if unknown). */
  sourceText: string;
  existing: ExistingPostRef[];
  knownPaths: Set<string>;
}

export function parseModelJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("No JSON object in model output.");
  return JSON.parse(text.slice(start, end + 1));
}

export function evaluateDraft({ raw, sourceText, existing, knownPaths }: GateInput): GateResult {
  const metrics: GateResult["metrics"] = {
    words: 0, h2: 0, internalLinks: 0, linksRewritten: [], linksRemoved: [],
    regulatedTopics: [], guaranteeClaims: [], unsupportedFigures: [], bannedPhrases: [], duplicateOf: null,
    keyNumbersDropped: [],
  };
  const reject = (reasons: string[]): GateResult => ({ decision: "reject", reasons, warnings: [], draft: null, metrics });

  const parsed = blogDraftSchema.safeParse(raw);
  if (!parsed.success) {
    return reject(parsed.error.issues.slice(0, 5).map((i) => `Malformed draft: ${i.path.join(".") || "root"} — ${i.message}`));
  }

  const sanitized = sanitizeArticleHtml(parsed.data.htmlContent, knownPaths);
  const draft: ParsedBlogDraft = {
    ...parsed.data,
    slug: normalizeSlug(parsed.data.slug),
    htmlContent: sanitized.html,
    seoTitle: normalizeSeoTitle(parsed.data.seoTitle, parsed.data.title),
    faqs: parsed.data.faqs.map((f) => ({ question: htmlToText(f.question), answer: htmlToText(f.answer) })),
  };
  // Key numbers are shown as facts, so every figure in one must be in the source.
  if (draft.keyNumbers) {
    const kept = draft.keyNumbers
      .map((k) => ({ value: htmlToText(k.value), label: htmlToText(k.label) }))
      .filter((k) => {
        const ok = extractFigures(k.value).length > 0 && findUnsupportedFigures(`${k.value} ${k.label}`, sourceText).length === 0;
        if (!ok) metrics.keyNumbersDropped.push(k.value);
        return ok;
      });
    draft.keyNumbers = kept.length ? kept : undefined;
  }

  const text = htmlToText(draft.htmlContent);
  const fullText = `${draft.title}. ${draft.excerpt}. ${text} ${draft.faqs.map((f) => `${f.question} ${f.answer}`).join(" ")}`;
  metrics.words = text.split(/\s+/).filter(Boolean).length;
  metrics.h2 = (draft.htmlContent.match(/<h2>/g) ?? []).length;
  metrics.internalLinks = new Set([...sanitized.linksKept, ...sanitized.linksRewritten]).size;
  metrics.linksRewritten = sanitized.linksRewritten;
  metrics.linksRemoved = sanitized.linksRemoved;
  metrics.regulatedTopics = detectRegulatedTopics(fullText);
  metrics.guaranteeClaims = findGuaranteeClaims(fullText);
  metrics.unsupportedFigures = findUnsupportedFigures(fullText, sourceText);
  metrics.bannedPhrases = countBannedPhrases(fullText);

  // Hard failures: nothing is saved.
  const hard: string[] = [];
  if (draft.slug.length < 8) hard.push("Slug is empty after normalising.");
  if (metrics.words < MIN_WORDS) hard.push(`Too thin: ${metrics.words} words (minimum ${MIN_WORDS}).`);
  if (metrics.words > MAX_WORDS) hard.push(`Too long: ${metrics.words} words (maximum ${MAX_WORDS}) — likely runaway output.`);
  if (metrics.h2 < MIN_H2) hard.push(`Weak structure: ${metrics.h2} H2 sections (minimum ${MIN_H2}).`);
  const topicDup = findTopicDuplicate(draft.title, existing, draft.slug);
  const contentDup = topicDup ? null : findContentDuplicate(text, existing);
  if (topicDup) {
    metrics.duplicateOf = topicDup.slug;
    hard.push(`Duplicate topic of existing post "/blog/${topicDup.slug}".`);
  } else if (contentDup) {
    metrics.duplicateOf = contentDup.post.slug;
    hard.push(`Content overlaps "/blog/${contentDup.post.slug}" (${Math.round(contentDup.score * 100)}% shingle similarity).`);
  }
  if (hard.length) return { ...reject(hard), draft };

  // Soft failures: saved for a person to review.
  const reasons: string[] = [];
  if (metrics.regulatedTopics.length) {
    reasons.push(`Regulated topic (${metrics.regulatedTopics.join(", ")}): verify against current RBI/FEMA, Income-tax or GujRERA sources before publishing.`);
  }
  if (metrics.guaranteeClaims.length) {
    reasons.push(`Guaranteed-return language: ${metrics.guaranteeClaims.map((c) => `"${c}"`).join(", ")}.`);
  }
  if (metrics.unsupportedFigures.length > MAX_UNSUPPORTED_FIGURES) {
    reasons.push(
      `${metrics.unsupportedFigures.length} figures not found in the source article: ${metrics.unsupportedFigures.slice(0, 8).join(", ")}.`
    );
  }
  if (metrics.bannedPhrases.length > MAX_BANNED_PHRASES) {
    reasons.push(`Formulaic AI phrasing: ${metrics.bannedPhrases.join(", ")}.`);
  }
  if (metrics.internalLinks < MIN_INTERNAL_LINKS) {
    reasons.push(`Only ${metrics.internalLinks} valid internal links (minimum ${MIN_INTERNAL_LINKS}).`);
  }

  const warnings: string[] = [];
  if (sanitized.linksRemoved.length) warnings.push(`Removed links: ${sanitized.linksRemoved.join(", ")}`);
  if (sanitized.linksRewritten.length) warnings.push(`Rewrote links to canonical pages: ${sanitized.linksRewritten.join(", ")}`);
  if (draft.seoTitle !== parsed.data.seoTitle.trim()) warnings.push(`SEO title shortened to "${draft.seoTitle}".`);
  if (metrics.unsupportedFigures.length && metrics.unsupportedFigures.length <= MAX_UNSUPPORTED_FIGURES) {
    warnings.push(`Unsupported figures (within tolerance): ${metrics.unsupportedFigures.join(", ")}`);
  }

  return { decision: reasons.length ? "hold" : "publish", reasons, warnings, draft, metrics };
}

// ─── Auto-publish (no human in the loop) ────────────────────────────────────

/**
 * With BLOG_AUTOPUBLISH on, nothing waits for a person (management decision,
 * 30 Oct 2026). Two things still cannot be published, because a disclaimer
 * does not cure them (CCPA misleading-advertisement guidelines, 2022; RERA
 * s.10(c)): guaranteed-return wording and figures that are not in the
 * source. They are removed sentence by sentence; anything else that would
 * have held the draft (regulated topic, AI phrasing, few links) is published
 * with the topic disclaimers shown on the post.
 */
export function autoPublishBlockers(gate: GateResult): string[] {
  const out: string[] = [];
  if (gate.metrics.guaranteeClaims.length) out.push(`guaranteed-return wording (${gate.metrics.guaranteeClaims.join(", ")})`);
  if (gate.metrics.unsupportedFigures.length) out.push(`figures not in the source (${gate.metrics.unsupportedFigures.join(", ")})`);
  return out;
}

/** True when a sentence would block auto-publishing (guarantee wording or an unsourced figure). */
function isRiskySentence(sentence: string, sourceText: string): boolean {
  return findGuaranteeClaims(sentence).length > 0 || findUnsupportedFigures(sentence, sourceText).length > 0;
}

/**
 * Removes every sentence with guaranteed-return wording or a figure that is
 * not in the source (labelled examples are kept), from the article body and
 * FAQs. Returns null when the title, excerpt or SEO description itself is
 * risky, because those cannot be cut down safely.
 */
export function stripRiskySentences(
  draft: ParsedBlogDraft,
  sourceText: string,
  knownPaths: Set<string>
): { draft: ParsedBlogDraft; removed: string[] } | null {
  if ([draft.title, draft.excerpt, draft.seoTitle, draft.seoDescription].some((t) => isRiskySentence(t, sourceText))) return null;

  const removed: string[] = [];
  const keepSentences = (html: string) =>
    html
      .split(/(?<=[.!?])\s+(?=[<"“‘'A-Z0-9₹(])/)
      .filter((piece) => {
        const text = htmlToText(piece);
        if (isExampleSentence(text) || !isRiskySentence(text, sourceText)) return true;
        removed.push(text);
        return false;
      })
      .join(" ");

  const body = draft.htmlContent.replace(
    /<(p|li|blockquote|td)>([\s\S]*?)<\/\1>/g,
    (_, tag: string, inner: string) => {
      const kept = keepSentences(inner).trim();
      return htmlToText(kept) ? `<${tag}>${kept}</${tag}>` : "";
    }
  );
  const faqs = draft.faqs.filter((f) => {
    if (isRiskySentence(f.question, sourceText) || isRiskySentence(f.answer, sourceText)) {
      removed.push(`FAQ: ${f.question}`);
      return false;
    }
    return true;
  });

  // Re-sanitise so a cut through inline tags can't leave broken markup.
  const html = sanitizeArticleHtml(body.replace(/<(ul|ol)>\s*<\/\1>/g, ""), knownPaths).html;
  return { draft: { ...draft, htmlContent: html, faqs }, removed };
}

export type AutoPublishResult =
  | { ok: true; draft: ParsedBlogDraft; removed: string[]; notes: string[] }
  | { ok: false; reason: string };

/**
 * The auto-publish decision for a gated draft: publish (after removing risky
 * sentences) or discard. There is no "hold". Discarded drafts make the
 * pipeline try the next headline.
 */
export function finalizeForAutoPublish(gate: GateResult, sourceText: string, knownPaths: Set<string>): AutoPublishResult {
  if (gate.decision === "reject" || !gate.draft) return { ok: false, reason: gate.reasons.join(" ") || "Rejected by the quality gate." };

  let draft = gate.draft;
  let removed: string[] = [];
  if (autoPublishBlockers(gate).length) {
    const stripped = stripRiskySentences(draft, sourceText, knownPaths);
    if (!stripped) return { ok: false, reason: "Title, excerpt or SEO text has guaranteed-return wording or an unsourced figure." };
    ({ draft, removed } = stripped);
  }

  const text = htmlToText(draft.htmlContent);
  const words = text.split(/\s+/).filter(Boolean).length;
  const h2 = (draft.htmlContent.match(/<h2>/g) ?? []).length;
  const fullText = `${text} ${draft.faqs.map((f) => `${f.question} ${f.answer}`).join(" ")}`;
  if (words < MIN_WORDS) return { ok: false, reason: `Too thin after removing ${removed.length} risky sentence(s): ${words} words.` };
  if (h2 < MIN_H2) return { ok: false, reason: `Weak structure after removing risky sentences: ${h2} H2 sections.` };
  if (findGuaranteeClaims(fullText).length || findUnsupportedFigures(fullText, sourceText).length) {
    return { ok: false, reason: "Risky wording remained after automatic removal." };
  }

  const notes: string[] = [];
  if (removed.length) notes.push(`Auto-removed ${removed.length} sentence(s) with guaranteed-return wording or unsourced figures.`);
  if (gate.metrics.regulatedTopics.length) notes.push(`Regulated topic (${gate.metrics.regulatedTopics.join(", ")}): published with the topic disclaimers.`);
  if (gate.metrics.bannedPhrases.length > MAX_BANNED_PHRASES) notes.push(`Formulaic AI phrasing: ${gate.metrics.bannedPhrases.join(", ")}.`);
  if (gate.metrics.keyNumbersDropped.length) notes.push(`Key numbers dropped (not in source): ${gate.metrics.keyNumbersDropped.join(", ")}.`);
  return { ok: true, draft, removed, notes };
}

/**
 * The "Key numbers" box at the top of a post: only figures the gate matched
 * to the source (built by the pipeline, not the model). Empty when none.
 */
export function keyNumbersHtml(keyNumbers: ParsedBlogDraft["keyNumbers"], sourceLabel: string): string {
  if (!keyNumbers?.length) return "";
  const items = keyNumbers.map((k) => `<li><strong>${escapeText(k.value)}</strong> ${escapeText(k.label)}</li>`).join("");
  return `<aside class="key-numbers"><p>Key numbers</p><ul>${items}</ul><p><em>Source: ${escapeText(sourceLabel)}</em></p></aside>\n`;
}

// ─── Byline ─────────────────────────────────────────────────────────────────

/**
 * Byline for posts published without a person reviewing them. Unreviewed
 * AI text is not attributed to a named person; posts a person approves keep
 * whatever author the editor sets.
 */
export const AUTOMATED_BYLINE = {
  name: "PIKORUA Editorial Desk",
  role: "AI-assisted market briefing",
  avatar: "/logo-icon.png",
} as const;
