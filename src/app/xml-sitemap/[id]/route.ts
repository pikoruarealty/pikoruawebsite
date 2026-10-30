/**
 * Sub-sitemap route for combinatorial pages.
 *
 * /sitemap/[id].xml — each file contains up to 2,500 combo page URLs.
 * The main /sitemap.xml (see sitemap.ts) acts as the index listing these.
 *
 * Example:
 *   /sitemap/p-0.xml → first 2,500 combo URLs (highest priority)
 *   /sitemap/p-1.xml → next 2,500
 *   /sitemap/geo.xml → existing GEO landing pages
 *   /sitemap/blog.xml → published blog posts (DB + static fallback posts)
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getComboSitemapBatch, getTotalComboBatches } from "@/lib/data/combo-seeder";
import { getRenderableGeoPages, getSitemapPropertySlugs } from "@/lib/data/public-routes";
import { STATIC_PROPERTIES } from "@/lib/data/properties";
import { getPublishedBlogPosts } from "@/lib/data/blog";
import { ALL_CONTENT_HUB_PAGES } from "@/lib/data/content-hubs";
import { getSupabaseAllPropertySlugsWithDates, getSupabaseBlogs } from "@/lib/db/queries";
import { absoluteUrl } from "@/lib/seo";

const BATCH_SIZE = 2500;

const LAST_MOD = "2026-07-21T12:00:00+05:30";

/** A DB timestamp or date string as a sitemap <lastmod>, else the default. */
function toLastMod(value: string | undefined): string {
  if (!value) return LAST_MOD;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? LAST_MOD : date.toISOString();
}

function xmlEscape(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildSitemapXml(urls: { loc: string; lastmod: string; priority: string }[]): string {
  const items = urls
    .map(
      ({ loc, lastmod, priority }) =>
        `  <url>\n    <loc>${xmlEscape(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <priority>${priority}</priority>\n  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</urlset>`;
}

function buildIndexXml(sitemapUrls: string[]): string {
  const items = sitemapUrls
    .map(
      (url) =>
        `  <sitemap>\n    <loc>${xmlEscape(url)}</loc>\n    <lastmod>${LAST_MOD}</lastmod>\n  </sitemap>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</sitemapindex>`;
}

export const dynamic = "force-static";
export const revalidate = 86400; // regenerate sub-sitemaps daily

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await params;
  // Strip .xml extension — support both /sitemap/index and /sitemap/index.xml
  const id = rawId.replace(/\.xml$/, "");

  // ── /sitemap/index.xml — sitemap index ────────────────────────────────────
  if (id === "index") {
    const totalBatches = getTotalComboBatches(BATCH_SIZE);
    const urls: string[] = [];

    // Content hub sub-sitemap
    urls.push(absoluteUrl("/sitemap/content.xml"));

    // Blog posts sub-sitemap
    urls.push(absoluteUrl("/sitemap/blog.xml"));

    // GEO sub-sitemap
    urls.push(absoluteUrl("/sitemap/geo.xml"));

    // Properties sub-sitemap
    urls.push(absoluteUrl("/sitemap/properties.xml"));

    // Combo sub-sitemaps
    for (let i = 0; i < totalBatches; i++) {
      urls.push(absoluteUrl(`/sitemap/p-${i}.xml`));
    }

    return new NextResponse(buildIndexXml(urls), {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
      },
    });
  }

  // ── /sitemap/content.xml — content hub authority pages ─────────────────────
  if (id === "content") {
    const urls = ALL_CONTENT_HUB_PAGES.map((page) => ({
      loc: absoluteUrl(page.href),
      lastmod: LAST_MOD,
      priority: "0.82",
    }));
    return new NextResponse(buildSitemapXml(urls), {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=86400",
      },
    });
  }

  // ── /sitemap/geo.xml — GEO landing pages ──────────────────────────────────
  // Only pages that render at their href — 29 data-defined hrefs 404 (see
  // src/lib/data/public-routes.ts).
  if (id === "geo") {
    const urls = getRenderableGeoPages().map((page) => ({
      loc: absoluteUrl(page.href),
      lastmod: LAST_MOD,
      priority: "0.72",
    }));
    return new NextResponse(buildSitemapXml(urls), {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=86400",
      },
    });
  }

  // ── /sitemap/properties.xml — property detail pages ───────────────────────
  // Active DB properties plus static entries that have no DB row (see
  // getSitemapPropertySlugs).
  if (id === "properties") {
    const dbProperties = await getSupabaseAllPropertySlugsWithDates();
    const updatedAt = new Map(dbProperties.map((p) => [p.slug, p.updatedAt]));
    const slugs = getSitemapPropertySlugs(dbProperties, STATIC_PROPERTIES.map((p) => p.slug));
    const urls = slugs.map((slug) => ({
      loc: absoluteUrl(`/properties/${slug}`),
      lastmod: toLastMod(updatedAt.get(slug)),
      priority: "0.60",
    }));
    return new NextResponse(buildSitemapXml(urls), {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=86400",
      },
    });
  }

  // ── /sitemap/blog.xml — published blog posts ──────────────────────────────
  // Published DB posts, plus static posts that have no DB row at all (a DB
  // row that is inactive or pending review means the post was taken down).
  if (id === "blog") {
    const dbPosts = await getSupabaseBlogs(false);
    const published = getPublishedBlogPosts(dbPosts);
    const urls = published.map((post) => ({
      loc: absoluteUrl(`/blog/${post.slug}`),
      lastmod: toLastMod(post.updatedAt || post.publishedAt),
      priority: "0.65",
    }));
    return new NextResponse(buildSitemapXml(urls), {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  // ── /sitemap/p-[n].xml — combo page batches ───────────────────────────────
  const batchMatch = id.match(/^p-(\d+)$/);
  if (batchMatch) {
    const batchIndex = parseInt(batchMatch[1], 10);
    const totalBatches = getTotalComboBatches(BATCH_SIZE);

    if (batchIndex >= totalBatches) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const hrefs = getComboSitemapBatch(batchIndex, BATCH_SIZE);
    const urls = hrefs.map((href, idx) => ({
      loc: absoluteUrl(href),
      lastmod: LAST_MOD,
      // Higher batch = lower priority (first batch = highest priority)
      priority: batchIndex === 0 ? (idx < 500 ? "0.70" : "0.55") : "0.50",
    }));

    return new NextResponse(buildSitemapXml(urls), {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=86400",
      },
    });
  }

  return new NextResponse("Not Found", { status: 404 });
}
