import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getPublishedBlogPosts, resolvePublicBlogPost, STATIC_BLOG_POSTS } from "@/lib/data/blog";
import { getRenderableGeoPages, getRenderablePublicPaths, getSitemapPropertySlugs } from "@/lib/data/public-routes";
import type { BlogPost } from "@/types/blog";
import { ABROAD_CALL_FALLBACK_HREF, ABROAD_COUNTRY_LINKS, showsBuyingFromAbroad } from "@/lib/data/buying-from-abroad";
import { describeCallTime, windowInIst } from "@/lib/call-time";
import { mentionsReturnFigures } from "@/lib/data/returns-disclaimer";

function getBaseline404Paths(): string[] {
  return readFileSync("docs/seo/baseline-live-2026-10-29.csv", "utf8")
    .split(/\r?\n/)
    .slice(1)
    .flatMap((line) => {
      const match = line.match(/^"([^\"]+)","(\d{3})"/);
      if (!match || match[2] !== "404") return [];
      return [new URL(match[1]).pathname];
    });
}

const baseline404Paths = getBaseline404Paths();
assert.equal(baseline404Paths.length, 29, "the saved live baseline should contain all 29 route 404s");

const publicPaths = getRenderablePublicPaths();
for (const path of baseline404Paths) {
  assert.equal(publicPaths.has(path), false, `404 route must stay out of generated links and sitemaps: ${path}`);
}

const renderableGeoPages = getRenderableGeoPages();
assert.equal(
  new Set(renderableGeoPages.map((page) => page.href)).size,
  renderableGeoPages.length,
  "renderable geo pages must have unique sitemap hrefs"
);
assert.ok(publicPaths.has("/locations/rajpath-club"), "a mapped locality page should remain public");

const staticPost = STATIC_BLOG_POSTS[0];
const databasePost: BlogPost = {
  ...staticPost,
  id: "db-copy",
  title: "Database version",
  isActive: true,
  pendingReview: false,
};
const inactivePost: BlogPost = { ...databasePost, isActive: false };
const pendingPost: BlogPost = { ...databasePost, pendingReview: true };

assert.equal(resolvePublicBlogPost(staticPost.slug, null), staticPost, "static-only posts should stay public");
assert.equal(resolvePublicBlogPost(databasePost.slug, databasePost), databasePost, "published database posts should render");
assert.equal(resolvePublicBlogPost(inactivePost.slug, inactivePost), null, "inactive rows must suppress static fallback");
assert.equal(resolvePublicBlogPost(pendingPost.slug, pendingPost), null, "review drafts must not render publicly");

const staticFallbacksWithDatabaseRows = getPublishedBlogPosts([inactivePost]);
assert.equal(
  staticFallbacksWithDatabaseRows.some((post) => post.slug === staticPost.slug),
  false,
  "an inactive database row must suppress its same-slug static sitemap entry"
);

const duplicateDbPost: BlogPost = { ...databasePost, id: "duplicate-db-copy" };
const publishedWithStaticOnly = getPublishedBlogPosts([inactivePost, databasePost, duplicateDbPost]);
assert.equal(
  publishedWithStaticOnly.filter((post) => post.slug === staticPost.slug).length,
  1,
  "a canonical blog slug should appear only once in the public sitemap"
);
assert.ok(
  publishedWithStaticOnly.some((post) => post.slug === STATIC_BLOG_POSTS[1].slug),
  "static-only posts should remain listed when published database posts exist"
);

// Every DB post unpublished: the remaining static posts stay public, but the
// ones a DB row withdrew do not come back (blog index, feed and llms.txt use
// this same list).
const withdrawnOnly = getPublishedBlogPosts([inactivePost, { ...pendingPost, id: "pending", slug: STATIC_BLOG_POSTS[1].slug }]);
assert.deepEqual(
  withdrawnOnly.map((post) => post.slug),
  STATIC_BLOG_POSTS.slice(2).map((post) => post.slug),
  "with no published DB rows, only static posts without a DB row are public"
);

// Property sitemap: the detail route renders a DB row whenever one exists,
// so an inactive row must hide its same-slug static entry as well.
const [staticA, staticB] = ["static-a", "static-b"];
const propertySlugs = getSitemapPropertySlugs(
  [
    { slug: staticA, isActive: false },
    { slug: "db-only-active", isActive: true },
    { slug: "db-only-inactive", isActive: false },
    { slug: "5-bhk-3300-6300-sindhu-bhavan", isActive: true },
  ],
  [staticA, staticB]
);
assert.deepEqual(propertySlugs.sort(), ["db-only-active", staticB].sort(), "property sitemap: active DB + unowned static, no redirects");

// "Buying from abroad" block: on every page except NRI pages; every country
// guide it links to, and the fallback call target, must render.
{
  const renderable = getRenderablePublicPaths();
  for (const { href } of ABROAD_COUNTRY_LINKS) {
    assert.ok(renderable.has(href), `buying-from-abroad country link does not render: ${href}`);
  }
  assert.ok(renderable.has(ABROAD_CALL_FALLBACK_HREF.split("#")[0]), "buying-from-abroad fallback call page must render");
  for (const path of ["/", "/properties", "/luxury-apartments-ahmedabad", "/locations/bodakdev", "/learn/rera-gujarat-guide", "/invest/commonwealth-games-2030-ahmedabad-property", "/blog/sindhu-bhavan-road-luxury-market-guide", "/locations/vaishno-devi-circle"]) {
    assert.ok(showsBuyingFromAbroad(path), `buying-from-abroad should show on ${path}`);
  }
  for (const path of ["/nri", "/nri/usa", "/nri/uk/buy-property-ahmedabad", "/nri-property-from-uk", "/invest/nri-property-investment-guide-ahmedabad", "/blog/nri-guide-asset-curation-gujarat", "/learn/how-to-buy-property-as-nri-ahmedabad"]) {
    assert.ok(!showsBuyingFromAbroad(path), `buying-from-abroad should not show on NRI page ${path}`);
  }
}

// Call-time line: visitor's window plus the India time, within the 100-char limit.
{
  const winter = new Date("2026-01-15T12:00:00Z");
  const summer = new Date("2026-07-15T12:00:00Z");
  assert.equal(windowInIst("Europe/London", "evening", winter), "10:30 PM–2:30 AM IST");
  assert.equal(windowInIst("Europe/London", "evening", summer), "9:30 PM–1:30 AM IST");
  assert.equal(windowInIst("America/New_York", "evening", winter), "3:30 AM–7:30 AM IST");
  assert.equal(windowInIst("Asia/Dubai", "morning", winter), "10:30 AM–1:30 PM IST");
  assert.equal(describeCallTime("Europe/London", "evening", winter), "Evening 5–9 PM, London time (10:30 PM–2:30 AM IST)");
  assert.equal(describeCallTime("Asia/Kolkata", "morning", winter), "Morning 9 AM–12 PM, India time");
  assert.equal(describeCallTime("America/Los_Angeles", "any", winter), "Any time, California time");
  assert.equal(describeCallTime("America/Argentina/Buenos_Aires", "afternoon", winter), "Afternoon 12–5 PM, Buenos Aires time (8:30 PM–1:30 AM IST)");
}

// "Returns are not guaranteed" note: return / price-rise figures yes, tax rates no.
for (const text of [
  "Prices could see a 15–20% rise around the Games.",
  "Gross rental yield is 3.2–4.5% in Thaltej.",
  "Values appreciated 30-50% over five years.",
  "An 18–24% annualised total return.",
  "with projections of 15-20% benefits for landowners in the short term",
]) {
  assert.ok(mentionsReturnFigures(text), `should flag return figure: ${text}`);
}
for (const text of [
  "Long-term capital gains are taxed at 12.5% without indexation.",
  "Stamp duty is 4.9% and registration 1%.",
  "No one can promise a price rise.",
]) {
  assert.ok(!mentionsReturnFigures(text), `should not flag: ${text}`);
}

console.log(`SEO routing checks passed: ${baseline404Paths.length} known 404s excluded; blog publication rules aligned.`);
