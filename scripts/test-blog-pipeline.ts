/**
 * Checks for the automated blog quality gate, sitemap route registry and
 * combo-page matching. Run with: npm run test:seo
 *
 * Pure-function checks only (no DB, network or AI calls). The end-to-end
 * pipeline is exercised against a running app — see
 * docs/seo/BLOG_AUTOMATION_REPORT.md §Verification.
 */

import assert from "node:assert/strict";
import {
  BLOG_LINK_TARGETS,
  detectRegulatedTopics,
  evaluateDraft,
  finalizeForAutoPublish,
  findGuaranteeClaims,
  isExampleSentence,
  keyNumbersHtml,
  findTopicDuplicate,
  findUnsupportedFigures,
  normalizeSeoTitle,
  sanitizeArticleHtml,
  SEO_TITLE_MAX,
  type ExistingPostRef,
} from "../src/lib/ai/blogQuality";
import { isRelevantHeadline } from "../src/lib/ai/blogAutomation";
import { getAutomatedPostDisclaimers } from "../src/lib/data/blog-disclaimers";
import { BRIEF_SOURCE_PREFIX, EDITORIAL_QUEUE, briefFactsText, briefToSourceText, pickNextBrief } from "../src/lib/ai/blogTopicQueue";
import { ALL_GEO_LANDING_PAGES } from "../src/lib/data/geo";
import { getRenderableGeoPages, getRenderablePublicPaths } from "../src/lib/data/public-routes";
import { PAGE_MERGES } from "../src/lib/data/page-merges";
import { ALL_CONTENT_HUB_PAGES } from "../src/lib/data/content-hubs";
import { filterLinkableClusters, isIndexableComboHref, linkableHrefs } from "../src/lib/data/combo-indexable";
import { getRelatedCombos } from "../src/lib/data/combo-linker";
import { STATIC_PROPERTIES, type StaticProperty } from "../src/lib/data/properties";
import { matchComboProperties, parseBhkCounts, parsePriceRangeCr } from "../src/lib/data/combo-matching";
import { getComboSitemapBatch, getTotalComboBatches } from "../src/lib/data/combo-seeder";
import { generateComboPage } from "../src/lib/data/combo-content-engine";
import {
  SEO_BHK_OPTIONS,
  SEO_BUDGET_RANGES,
  SEO_LOCATIONS,
  SEO_PROPERTY_TYPES,
  parseComboSegments,
  type ParsedCombo,
} from "../src/lib/data/seo-dimensions";

let passed = 0;
const failures: string[] = [];
function test(name: string, fn: () => void) {
  try {
    fn();
    passed++;
  } catch (err) {
    failures.push(`✗ ${name}\n    ${err instanceof Error ? err.message.split("\n").join("\n    ") : String(err)}`);
  }
}

const knownPaths = getRenderablePublicPaths();

// ─── Route registry / sitemap ───────────────────────────────────────────────

test("route registry excludes the 29 data hrefs that 404 on the live site", () => {
  const renderable = getRenderableGeoPages();
  const unique = new Set(ALL_GEO_LANDING_PAGES.map((p) => p.href));
  const merged = [...unique].filter((href) => PAGE_MERGES[href]).length;
  assert.equal(unique.size - renderable.length - merged, 29);
  assert.ok(!renderable.some((p) => p.href === "/ahmedabad/thaltej/luxury-flats"));
  assert.ok(!renderable.some((p) => p.href === "/nri/global/invest-in-ahmedabad-real-estate"));
  assert.ok(renderable.some((p) => p.href === "/nri-property-from-usa"), "protected page must stay");
  assert.ok(renderable.some((p) => p.href === "/luxury-property-consultant-ahmedabad"), "protected page must stay");
});

test("merged duplicate pages: winners render, no chains, losers leave sitemaps and links", () => {
  const renderableHrefs = new Set(getRenderableGeoPages().map((p) => p.href));
  for (const [from, to] of Object.entries(PAGE_MERGES)) {
    assert.ok(!PAGE_MERGES[to], `redirect chain: ${from} -> ${to} -> ${PAGE_MERGES[to]}`);
    assert.ok(knownPaths.has(to), `merge winner must be a live page: ${to}`);
    assert.ok(!knownPaths.has(from), `merged page must leave the sitemap and generated links: ${from}`);
    assert.ok(!renderableHrefs.has(from), `merged page must not render as a geo page: ${from}`);
  }
  assert.ok(!ALL_CONTENT_HUB_PAGES.some((p) => PAGE_MERGES[p.href]), "merged hub pages leave hub lists");
  for (const protectedPath of ["/nri/dubai", "/nri-property-from-usa", "/nri-property-from-uk", "/luxury-apartments-ahmedabad"]) {
    assert.ok(!PAGE_MERGES[protectedPath], `protected page must not be merged away: ${protectedPath}`);
  }
});

test("internal links never point at noindex combo pages, merged pages or missing /ahmedabad pages", () => {
  for (let i = 0; i < getTotalComboBatches(); i++) {
    for (const href of getComboSitemapBatch(i)) {
      const parsed = parseComboSegments(href.slice(3).split("/"))!;
      for (const cluster of filterLinkableClusters(getRelatedCombos(parsed))) {
        for (const link of cluster.links) {
          assert.ok(!PAGE_MERGES[link.href], `${href} links to merged page ${link.href}`);
          if (link.href.startsWith("/p/")) assert.ok(isIndexableComboHref(link.href), `${href} links to noindex ${link.href}`);
          else if (link.href.startsWith("/ahmedabad/")) assert.ok(knownPaths.has(link.href), `${href} links to missing ${link.href}`);
        }
      }
    }
  }
  for (const page of ALL_CONTENT_HUB_PAGES) {
    for (const href of linkableHrefs(page.relatedListingHrefs)) {
      assert.ok(!PAGE_MERGES[href], `${page.href} links to merged page ${href}`);
      if (href.startsWith("/p/")) assert.ok(isIndexableComboHref(href), `${page.href} links to noindex ${href}`);
    }
  }
});

test("every blog link target renders", () => {
  const missing = BLOG_LINK_TARGETS.filter((t) => !knownPaths.has(t.href)).map((t) => t.href);
  assert.deepEqual(missing, []);
});

// ─── Combo pages ────────────────────────────────────────────────────────────

/** The matcher as it was before combo-matching.ts, kept verbatim for comparison. */
function originalMatch(parsed: ParsedCombo) {
  const loc = parsed.location;
  const type = parsed.type;
  const bhk = parsed.bhk;
  return STATIC_PROPERTIES.filter((p) => {
    if (loc) {
      const locSlug = loc.slug.toLowerCase();
      const propLoc = (p.locationLabel ?? "").toLowerCase();
      const propSlug = (p.location ?? "").toLowerCase();
      if (!propLoc.includes(locSlug) && !propSlug.includes(locSlug) &&
          !locSlug.split("-").some((word) => propLoc.includes(word) || propSlug.includes(word))) {
        return false;
      }
    }
    if (type && p.category) {
      const typeMap: Record<string, string[]> = {
        "luxury-flats": ["apartment", "condo", "condominium"],
        "penthouses": ["penthouse", "penthouse-suite"],
        "villas": ["villa", "bungalow", "townhouse", "townhome", "row-house", "estate"],
        "duplex": ["duplex", "duplex-condo"],
        "office-space": ["commercial-office", "office", "office-condo"],
        "retail-space": ["commercial-retail", "retail", "showroom"],
        "commercial-plots": ["commercial-plot", "plot"],
        "warehouse": ["warehouse"],
      };
      const validCategories = typeMap[type.slug] ?? [];
      if (validCategories.length > 0 && !validCategories.some((c) => p.category?.includes(c))) return false;
    }
    if (bhk && type?.bhkApplicable && p.configuration) {
      if (!p.configuration.includes(bhk.shortLabel)) return false;
    }
    return true;
  }).slice(0, 12);
}

function* everyCombo(): Generator<string[]> {
  for (const l of SEO_LOCATIONS) {
    yield [l.slug];
    for (const t of SEO_PROPERTY_TYPES) {
      yield [l.slug, t.slug];
      if (t.bhkApplicable) for (const b of SEO_BHK_OPTIONS) {
        yield [l.slug, t.slug, b.slug];
        for (const r of SEO_BUDGET_RANGES) yield [l.slug, t.slug, b.slug, r.slug];
      }
    }
  }
}

test("legacy combo matching is identical to the original for every combo", () => {
  delete process.env.SEO_COMBO_STRICT_MATCHING;
  let checked = 0;
  for (const segments of everyCombo()) {
    const parsed = parseComboSegments(segments)!;
    const ids = (ps: StaticProperty[]) => ps.map((p) => p.slug).join(",");
    assert.equal(ids(matchComboProperties(parsed, STATIC_PROPERTIES)), ids(originalMatch(parsed)), segments.join("/"));
    checked++;
  }
  assert.ok(checked > 5000, `checked ${checked}`);
});

test("strict matching filters by real budget, BHK and exact location", () => {
  process.env.SEO_COMBO_STRICT_MATCHING = "true";
  try {
    const underOneCr = matchComboProperties(parseComboSegments(["thaltej", "luxury-flats", "4-bhk", "under-1-cr"])!, STATIC_PROPERTIES);
    assert.equal(underOneCr.length, 0, "no listing under ₹1 Cr exists");
    const driveIn = matchComboProperties(parseComboSegments(["drive-in-road"])!, STATIC_PROPERTIES);
    assert.equal(driveIn.length, 0, `"road" must not match every Road listing: ${driveIn.map((p) => p.locationLabel)}`);
    const thaltej = matchComboProperties(parseComboSegments(["thaltej"])!, STATIC_PROPERTIES);
    assert.ok(thaltej.length > 0 && thaltej.every((p) => p.location === "thaltej" || /thaltej/i.test(p.locationLabel)));
  } finally {
    delete process.env.SEO_COMBO_STRICT_MATCHING;
  }
});

test("price and BHK parsing", () => {
  assert.deepEqual(parsePriceRangeCr("₹5.50 Cr – ₹8.25 Cr"), [5.5, 8.25]);
  assert.deepEqual(parsePriceRangeCr("₹14.50 Cr"), [14.5, 14.5]);
  assert.deepEqual(parsePriceRangeCr("₹75 Lakh – ₹1.2 Cr"), [0.75, 1.2]);
  assert.equal(parsePriceRangeCr("Price on request"), null);
  assert.deepEqual([...parseBhkCounts("4, 5, 6 & 7 BHK Apartments")].sort(), [4, 5, 6, 7]);
  assert.deepEqual([...parseBhkCounts("4 BHK | 5 BHK Penthouse Duplex")].sort(), [4, 5]);
  assert.deepEqual([...parseBhkCounts("4 & 5 BHK Simplex | 5 & 6 BHK Duplex")].sort(), [4, 5, 6]);
});

test("combo sitemap lists only indexable, allowed-type pages", () => {
  for (const strict of [false, true]) {
    if (strict) process.env.SEO_COMBO_STRICT_MATCHING = "true";
    else delete process.env.SEO_COMBO_STRICT_MATCHING;
    const hrefs = Array.from({ length: getTotalComboBatches(2500) }, (_, i) => getComboSitemapBatch(i, 2500)).flat();
    assert.ok(hrefs.length > 0 && hrefs.length < 1000, `${hrefs.length} combo URLs`);
    assert.ok(!hrefs.some((h) => /retail-space|warehouse|commercial-plots/.test(h)));
    if (strict) assert.ok(!hrefs.some((h) => /for-investment|for-self-use|high-roi|rental-income/.test(h)));
  }
  delete process.env.SEO_COMBO_STRICT_MATCHING;
});

test("templated combo pages state no return or appreciation figures", () => {
  // These templates fill every location, so any % return in them is not
  // location data (see docs/seo/content-claims-review.csv).
  const claim = /\d+(?:\.\d+)?\s*(?:–|-|to)?\s*\d*(?:\.\d+)?\s*%[^.]{0,40}(appreciation|yield|return|cagr)/i;
  for (const segments of everyCombo()) {
    const page = generateComboPage(parseComboSegments(segments)!);
    const text = JSON.stringify(page);
    assert.ok(!claim.test(text), `${segments.join("/")}: ${text.match(claim)?.[0]}`);
  }
});

// ─── HTML sanitising ────────────────────────────────────────────────────────

test("sanitizer strips scripts, handlers, styles and unsafe links", () => {
  const { html, linksRemoved } = sanitizeArticleHtml(
    `<h1>Title</h1><p onclick="x()" style="color:red">Hi <script>alert(1)</script><a href="javascript:alert(1)">bad</a>` +
      `<a href="https://evil.example/x">ext</a><a href="//evil.example">proto</a><img src=x onerror=alert(1)></p>` +
      `<iframe src="https://x"></iframe><!-- c --><p>1 < 2 & 3 > 2</p>`,
    knownPaths
  );
  assert.equal(html, "<h2>Title</h2><p>Hi badextproto</p><p>1 &lt; 2 & 3 &gt; 2</p>");
  assert.deepEqual(linksRemoved, ["javascript:alert(1)", "https://evil.example/x", "//evil.example"]);
});

test("sanitizer keeps valid internal links and rewrites legacy ones", () => {
  const { html, linksKept, linksRewritten, linksRemoved } = sanitizeArticleHtml(
    `<p><a href="/locations/thaltej" target="_blank">Thaltej</a>, <a href="/sindhu-bhavan-road-properties">SBR</a>, ` +
      `<a href="https://www.pikorua.in/penthouses-ahmedabad?x=1">penthouses</a>, <a href="/made-up-page">x</a> <a href="/locations/shela">open`,
    knownPaths
  );
  assert.equal(
    html,
    `<p><a href="/locations/thaltej">Thaltej</a>, <a href="/locations/sindhu-bhavan">SBR</a>, ` +
      `<a href="/penthouses-ahmedabad">penthouses</a>, x <a href="/locations/shela">open</a>`
  );
  assert.deepEqual(linksKept, ["/locations/thaltej", "/penthouses-ahmedabad", "/locations/shela"]);
  assert.deepEqual(linksRewritten, ["/locations/sindhu-bhavan"]);
  assert.deepEqual(linksRemoved, ["/made-up-page"]);
});

// ─── Risk checks ────────────────────────────────────────────────────────────

test("regulated topics are detected", () => {
  assert.deepEqual(detectRegulatedTopics("NRIs must follow FEMA and pay TDS under Section 195."), ["FEMA", "TDS / withholding tax"]);
  assert.deepEqual(detectRegulatedTopics("Thaltej has good schools and parks."), []);
});

test("guarantee claims are caught but honest negations are allowed", () => {
  assert.deepEqual(findGuaranteeClaims("This tower offers assured returns of 12%."), ["assured returns"]);
  assert.deepEqual(findGuaranteeClaims("No advisor can guarantee returns in real estate."), []);
  assert.deepEqual(findGuaranteeClaims("It is a risk-free bet."), ["risk-free"]);
});

test("figures not in the source are flagged", () => {
  const article = "Prices reached ₹12,500 per sq.ft, up 18% this year, with 4,000 crore invested and ₹5.50 Cr entry.";
  assert.deepEqual(findUnsupportedFigures(article, "rates of 12500 per sq ft and growth of 18 percent; 5.5 cr"), ["4,000 crore"]);
  assert.equal(findUnsupportedFigures(article, "").length, 4);
});

// ─── Duplicates (pairs taken from the real 2026 AI-draft backlog) ───────────

const backlog: ExistingPostRef[] = [
  { id: "1", slug: "million-minds-tech-city-ahmedabad-luxury-real-estate", title: "Million Minds Tech City: What It Means for Ahmedabad Luxury Real Estate" },
  { id: "2", slug: "south-bopal-resset-group-land-acquisition-ahmedabad-luxury-market", title: "Resset Group's South Bopal Land Acquisition and the Luxury Market" },
  { id: "3", slug: "ahmedabad-luxury-housing-venus-group-universe", title: "Venus Group's The Universe: Ahmedabad Luxury Housing" },
];

test("same story from a different outlet is a duplicate", () => {
  assert.equal(findTopicDuplicate("Ahmedabad's Million Minds Tech City and luxury real estate", backlog)?.id, "1");
  assert.equal(findTopicDuplicate("Resset Group South Bopal acquisition: Ahmedabad luxury property", backlog)?.id, "2");
  assert.equal(findTopicDuplicate("The Universe by Venus Group in Ahmedabad", backlog)?.id, "3");
});

test("padded AI titles are still caught through the slug", () => {
  // Real 2026-09-02 / 2026-09-04 drafts that repeated earlier stories.
  assert.equal(findTopicDuplicate(
    "Resset Group's South Bopal Acquisition: A Deep Dive into Ahmedabad's Luxury Property Trajectory", backlog,
    "resset-group-south-bopal-acquisition-ahmedabad-luxury-property")?.id, "2");
  assert.equal(findTopicDuplicate(
    "Ahmedabad's Ascent: How Million Minds Tech City Elevates Luxury Real Estate Near GIFT City", backlog,
    "ahmedabad-million-minds-tech-city-luxury-real-estate")?.id, "1");
});

test("different stories are not duplicates", () => {
  assert.equal(findTopicDuplicate("Ahmedabad Metro phase 2 opens to Gandhinagar", backlog), null);
  assert.equal(findTopicDuplicate("Rupee weakness gives NRIs an edge in Ahmedabad", backlog), null);
});

// ─── Metadata ───────────────────────────────────────────────────────────────

test("SEO titles fit before the brand suffix", () => {
  assert.equal(normalizeSeoTitle("Thaltej Luxury Flats Guide | PIKORUA Realty", "x"), "Thaltej Luxury Flats Guide");
  const long = normalizeSeoTitle(
    "Ahmedabad Luxury Real Estate Boom 2026: What HNI and NRI Buyers Should Know Now",
    "Ahmedabad Luxury Real Estate Boom 2026: What HNI and NRI Buyers Should Know Now"
  );
  assert.ok(long.length <= SEO_TITLE_MAX && !/[\s:,-]$/.test(long), long);
  assert.ok(!/\s(and|or|the|of|for|in|to|with)$/i.test(normalizeSeoTitle("x", "Real estate investment for NRIs and why you should look for the best and the brightest homes")));
});

// ─── The gate end to end ────────────────────────────────────────────────────

function paragraph(seed: string) {
  return `<p>${Array.from({ length: 60 }, (_, i) => `${seed}${i % 7 === 0 ? "." : ""}`).join(" ")} family buyers weigh schools, privacy and resale depth.</p>`;
}
function makeDraft(overrides: Record<string, unknown> = {}) {
  const sections = ["Context", "Corridor impact", "Supply and pricing", "What buyers should do"]
    .map((h, i) => `<h2>${h}</h2>${paragraph(`word${i}a`)}${paragraph(`word${i}b`)}${paragraph(`word${i}c`)}`)
    .join("");
  return {
    title: "How the new Sabarmati riverfront link changes Thaltej living",
    slug: "Sabarmati Riverfront Link Thaltej!",
    category: "corridor-spotlight",
    htmlContent: `<p>Intro mentions <a href="/locations/thaltej">Thaltej</a> and <a href="/sindhu-bhavan-road-properties">Sindhu Bhavan Road</a>.</p>${sections}`,
    seoTitle: "Sabarmati Riverfront Link and Thaltej Homes | PIKORUA Realty",
    seoDescription: "What the new riverfront link means for Thaltej homeowners and luxury buyers, from commute times to resale. Schedule a private advisory.",
    excerpt: "A new riverfront link reshapes how Thaltej connects to the city — here is what it means for buyers.",
    faqs: [
      { question: "Does the link reduce commute times?", answer: "It shortens the drive to the riverfront for residents on the western corridors." },
      { question: "Is Thaltej still a good address?", answer: "It remains one of the city's established luxury corridors with schools nearby." },
      { question: "Should buyers wait?", answer: "That depends on the family's timeline and the specific building being considered." },
    ],
    ...overrides,
  };
}

test("a clean draft publishes, with slug, title and links normalised", () => {
  const result = evaluateDraft({ raw: makeDraft(), sourceText: "", existing: backlog, knownPaths });
  assert.equal(result.decision, "publish", result.reasons.join("; "));
  assert.equal(result.draft!.slug, "sabarmati-riverfront-link-thaltej");
  assert.equal(result.draft!.seoTitle, "Sabarmati Riverfront Link and Thaltej Homes");
  assert.deepEqual(result.metrics.linksRewritten, ["/locations/sindhu-bhavan"]);
});

test("thin, malformed and duplicate drafts are rejected", () => {
  assert.equal(evaluateDraft({ raw: makeDraft({ htmlContent: "<h2>a</h2>".repeat(300) }), sourceText: "", existing: [], knownPaths }).decision, "reject");
  assert.equal(evaluateDraft({ raw: { title: "x" }, sourceText: "", existing: [], knownPaths }).decision, "reject");
  const dup = evaluateDraft({ raw: makeDraft({ title: "Million Minds Tech City and Ahmedabad's luxury housing" }), sourceText: "", existing: backlog, knownPaths });
  assert.equal(dup.decision, "reject");
  assert.match(dup.reasons[0], /Duplicate topic/);
});

test("regulated, guaranteed or unsupported-figure drafts are held", () => {
  const regulated = evaluateDraft({
    raw: makeDraft({ excerpt: "What FEMA and repatriation rules mean for NRIs buying a Thaltej home this year." }),
    sourceText: "", existing: [], knownPaths,
  });
  assert.equal(regulated.decision, "hold");
  assert.match(regulated.reasons[0], /Regulated topic \(FEMA, repatriation\)/);

  const guarantee = evaluateDraft({
    raw: makeDraft({ excerpt: "Thaltej flats now come with assured rental income for every buyer this season." }),
    sourceText: "", existing: [], knownPaths,
  });
  assert.equal(guarantee.decision, "hold");

  const figures = evaluateDraft({
    raw: makeDraft({ excerpt: "Rates rose 14% to ₹13,000 per sq.ft, 22% more units and ₹9.5 Cr homes sold out." }),
    sourceText: "rates rose 14 percent", existing: [], knownPaths,
  });
  assert.equal(figures.decision, "hold");
  assert.match(figures.reasons.join(" "), /figures not found in the source/);
});

// ─── News relevance ─────────────────────────────────────────────────────────

test("news relevance filter (headlines from the live feed, 29 Oct 2026)", () => {
  assert.ok(isRelevantHeadline("Gujarat realty launches moderate, developers bet on festive revival", "luxury-residential"));
  assert.ok(isRelevantHeadline("AUDA Plot Auction Exposes Ahmedabad’s Uneven Real Estate Boom", "luxury-residential"));
  assert.ok(!isRelevantHeadline("Gujarat: Farmer kidnapped over land deal; Congress leader’s name surfaces", "luxury-residential"));
  assert.ok(!isRelevantHeadline("Fafda-jalebi sales dip in Ahmedabad as inflation pushes up festive prices", "luxury-residential"));
  assert.ok(!isRelevantHeadline("Sunny Deol’s home tour: A look inside his luxury properties in Juhu", "luxury-residential"));
  assert.ok(isRelevantHeadline("Real estate investment for NRIs: Why you shouldn't treat your property in India as passive asset", "nri"));
  assert.ok(!isRelevantHeadline("In 2007, Bryan Cranston bought a California beach bungalow for $2.5 million", "nri"));
  assert.ok(isRelevantHeadline("South West Ahmedabad Sports Arena to get 36m-wide, 7km link", "infrastructure"));
});

// ─── Editorial queue ────────────────────────────────────────────────────────

test("every editorial brief links to a page that renders and cites https sources", () => {
  for (const brief of EDITORIAL_QUEUE) {
    assert.ok(knownPaths.has(brief.linkTo), `${brief.id}: ${brief.linkTo}`);
    assert.ok(brief.sources.every((src) => src.url.startsWith("https://")), brief.id);
    assert.ok(brief.facts.length === 0 || brief.sources.length > 0, `${brief.id}: facts without sources`);
  }
  assert.equal(new Set(EDITORIAL_QUEUE.map((b) => b.id)).size, EDITORIAL_QUEUE.length);
});

test("briefs are not topic duplicates of each other or of existing static posts", () => {
  const refs = EDITORIAL_QUEUE.map((b) => ({ id: b.id, slug: b.id, title: b.title }));
  for (const brief of EDITORIAL_QUEUE) {
    assert.equal(findTopicDuplicate(brief.title, refs.filter((r) => r.id !== brief.id)), null, brief.id);
  }
  assert.ok(pickNextBrief(new Set(), []) !== null);
});

test("the brief picker skips used briefs and topics already covered", () => {
  const first = EDITORIAL_QUEUE[0];
  assert.equal(pickNextBrief(new Set(), [])?.id, first.id);
  assert.equal(pickNextBrief(new Set([BRIEF_SOURCE_PREFIX + first.id]), [])?.id, EDITORIAL_QUEUE[1].id);
  const covered = [{ id: "x", slug: first.id, title: first.title }];
  assert.notEqual(pickNextBrief(new Set(), covered)?.id, first.id);
  assert.equal(pickNextBrief(new Set(EDITORIAL_QUEUE.map((b) => BRIEF_SOURCE_PREFIX + b.id)), []), null);
});

test("brief source text grounds the figure check", () => {
  const noFacts = EDITORIAL_QUEUE.find((b) => b.facts.length === 0)!;
  assert.match(briefToSourceText(noFacts), /state no specific figures/);
  // The 4 BHK brief's angle mentions "4"; that must not support a "4%" claim.
  assert.deepEqual(findUnsupportedFigures("A yield of 4% is typical in Thaltej.", briefFactsText(noFacts)), ["4%"]);
});

// ─── Auto-publish (BLOG_AUTOPUBLISH=true: nothing waits for a person) ───────

test("labelled worked examples are not counted as unsupported figures", () => {
  const example = "Example: if a ₹5 crore apartment rents for ₹1.25 lakh a month, its gross rental yield is 3% a year.";
  assert.equal(isExampleSentence(example), true);
  assert.deepEqual(findUnsupportedFigures(example, ""), []);
  // A market claim dressed as an example (no "if"/"suppose") still counts.
  assert.equal(isExampleSentence("Example: Thaltej prices rose 18% last year."), false);
  assert.deepEqual(findUnsupportedFigures("Example: Thaltej prices rose 18% last year.", ""), ["18%"]);
});

test("key numbers keep only figures that are in the source", () => {
  const gate = evaluateDraft({
    raw: makeDraft({ keyNumbers: [{ value: "₹1,250 crore", label: "project investment" }, { value: "18%", label: "price growth" }] }),
    sourceText: "The developer will invest ₹1,250 crore in the project.",
    existing: [], knownPaths,
  });
  assert.deepEqual(gate.draft!.keyNumbers, [{ value: "₹1,250 crore", label: "project investment" }]);
  assert.deepEqual(gate.metrics.keyNumbersDropped, ["18%"]);
});

const riskyBody = (extra: string) => {
  const d = makeDraft();
  return (d.htmlContent as string).replace("</p>", ` ${extra}</p>`);
};

test("auto-publish: a regulated-topic draft publishes with a note instead of being held", () => {
  const raw = makeDraft({ excerpt: "What FEMA and repatriation rules mean for NRIs buying a Thaltej home this year." });
  const gate = evaluateDraft({ raw, sourceText: "", existing: [], knownPaths });
  assert.equal(gate.decision, "hold");
  const final = finalizeForAutoPublish(gate, "", knownPaths);
  assert.equal(final.ok, true);
  assert.match(final.ok ? final.notes.join(" ") : "", /Regulated topic/);
});

test("auto-publish: guarantee wording and unsourced figures are removed, the rest publishes", () => {
  const raw = makeDraft({ htmlContent: riskyBody("Buyers here enjoy assured returns every year. Prices rose 18% in 2025. Example: if a home rents for ₹1 lakh a month, that is ₹12 lakh a year.") });
  const gate = evaluateDraft({ raw, sourceText: "", existing: [], knownPaths });
  const final = finalizeForAutoPublish(gate, "", knownPaths);
  assert.equal(final.ok, true, final.ok ? "" : final.reason);
  if (!final.ok) return;
  assert.equal(final.removed.length, 2);
  assert.doesNotMatch(final.draft.htmlContent, /assured returns|18%/);
  assert.match(final.draft.htmlContent, /Example: if a home rents/);
});

test("auto-publish: risky title or excerpt, or too little left after removal, is discarded", () => {
  const badExcerpt = evaluateDraft({ raw: makeDraft({ excerpt: "Thaltej homes now come with guaranteed returns for every buyer this season." }), sourceText: "", existing: [], knownPaths });
  assert.equal(finalizeForAutoPublish(badExcerpt, "", knownPaths).ok, false);
  // Every paragraph is one long sentence with an invented figure: nothing usable is left.
  const longSentence = (seed: string) => `<p>${Array.from({ length: 80 }, (_, i) => `${seed}${i}`).join(" ")} rose 18% in a year.</p>`;
  const sections = ["A", "B", "C", "D"].map((h) => `<h2>${h}</h2>${longSentence(`${h}x`)}${longSentence(`${h}y`)}${longSentence(`${h}z`)}`).join("");
  const thin = evaluateDraft({ raw: makeDraft({ htmlContent: `<p><a href="/locations/thaltej">Thaltej</a> and <a href="/locations/bodakdev">Bodakdev</a>.</p>${sections}` }), sourceText: "", existing: [], knownPaths });
  assert.notEqual(thin.decision, "reject", thin.reasons.join("; "));
  const final = finalizeForAutoPublish(thin, "", knownPaths);
  assert.equal(final.ok, false);
  assert.match(final.ok ? "" : final.reason, /Too thin/);
});

test("figures in any currency are checked against the source", () => {
  const cases: [string, string][] = [
    ["A villa in Dubai costs $238,000.", "$238,000"],
    ["Prices start at US$1.2 million.", "US$1.2 million"],
    ["The London flat sold for £450,000.", "£450,000"],
    ["Budgets of €300k are common.", "€300k"],
    ["Homes near the Marina go for AED 1.5 million.", "AED 1.5 million"],
    ["Rents are Dhs 8,000 a month.", "Dhs 8,000"],
    ["A deposit of 250,000 dollars is needed.", "250,000 dollars"],
    ["Savings of 500,000 USD were moved.", "500,000 USD"],
    ["The flat costs Rs 5 crore.", "Rs 5 crore"],
    ["Budgets reach INR 50 lakh.", "INR 50 lakh"],
    ["Fees are ¥10,000.", "¥10,000"],
    ["Condos list at SGD 800,000 and S$900,000.", "SGD 800,000"],
    ["A ₹2.5 crore home.", "₹2.5 crore"],
  ];
  for (const [sentence, figure] of cases) {
    assert.ok(findUnsupportedFigures(sentence, "").includes(figure), `${figure} should be detected in: ${sentence}`);
    assert.deepEqual(findUnsupportedFigures(sentence, sentence), [], `${figure} is supported when the source states it`);
  }
  // Sizes, configurations and years are not money figures.
  assert.deepEqual(findUnsupportedFigures("A 4 BHK of 3,500 sq.ft. completed in 2026 on a 500 sq yd plot.", ""), []);
  // A labelled example in dollars is still exempt.
  assert.deepEqual(findUnsupportedFigures("Example: if you remit $100,000 at a rate of 83, that is ₹83 lakh.", ""), []);
  // Dollar key numbers are kept when the source states them.
  const gate = evaluateDraft({
    raw: makeDraft({ keyNumbers: [{ value: "$238,000", label: "Dubai villa price" }, { value: "£9,999", label: "invented" }] }),
    sourceText: "The villa was listed at $238,000.", existing: [], knownPaths,
  });
  assert.deepEqual(gate.draft!.keyNumbers, [{ value: "$238,000", label: "Dubai villa price" }]);
});

test("key numbers box is escaped, sourced, and empty without figures", () => {
  assert.equal(keyNumbersHtml(undefined, "X"), "");
  const html = keyNumbersHtml([{ value: "₹1,250 crore", label: "investment <b>planned</b>" }], "Times of India");
  assert.match(html, /^<aside class="key-numbers"><p>Key numbers<\/p><ul><li><strong>₹1,250 crore<\/strong> investment &lt;b&gt;planned&lt;\/b&gt;<\/li><\/ul><p><em>Source: Times of India<\/em><\/p><\/aside>/);
});

test("disclaimers: general always, topic notes by content, sources when credited", () => {
  const ids = (text: string, src = false) => getAutomatedPostDisclaimers(text, src).map((d) => d.id);
  assert.deepEqual(ids("A walk around Bodakdev lanes."), ["general"]);
  assert.deepEqual(ids("NRIs paying TDS on the sale under FEMA rules.", true), ["general", "tax", "nri", "sources"]);
  assert.ok(ids("The Metro extension to GIFT City and a 3% yield.").includes("infrastructure"));
  assert.ok(ids("The Metro extension to GIFT City and a 3% yield.").includes("figures"));
});

// ─── Report ─────────────────────────────────────────────────────────────────

if (failures.length) {
  console.error(failures.join("\n"));
  console.error(`\n${failures.length} failed, ${passed} passed`);
  process.exit(1);
}
console.log(`SEO / blog pipeline checks passed: ${passed} tests.`);
