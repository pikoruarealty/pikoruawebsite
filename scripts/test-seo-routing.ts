import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getPublishedBlogPosts, resolvePublicBlogPost, STATIC_BLOG_POSTS } from "@/lib/data/blog";
import { getRenderableGeoPages, getRenderablePublicPaths, getSitemapPropertySlugs } from "@/lib/data/public-routes";
import type { BlogPost } from "@/types/blog";

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
    { slug: "4-5-bhk-penthouse-duplex-7300-15500-sindhu-bhavan", isActive: true },
  ],
  [staticA, staticB]
);
assert.deepEqual(propertySlugs.sort(), ["db-only-active", staticB].sort(), "property sitemap: active DB + unowned static, no redirects");

console.log(`SEO routing checks passed: ${baseline404Paths.length} known 404s excluded; blog publication rules aligned.`);
