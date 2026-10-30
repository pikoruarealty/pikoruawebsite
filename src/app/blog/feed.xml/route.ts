/**
 * /blog/feed.xml — RSS 2.0 feed for PIKORUA Realty Insights
 *
 * Consumed by:
 *   • Google Discover / Bing News (fresh content signals)
 *   • Perplexity, ChatGPT browsing (AI citation source discovery)
 *   • Content aggregators and real-estate news hubs (backlink sources)
 *   • RSS readers used by NRI advisory communities
 *
 * Spec compliance:
 *   • RSS 2.0 core elements
 *   • Dublin Core (dc:creator, dc:date)
 *   • Media RSS (media:content for cover images)
 *   • content:encoded for full HTML body (enables AI full-text ingestion)
 *
 * ISR: re-generated at most daily. Blog saves, approvals and deletions call
 * revalidateBlogPaths() (src/lib/blog-revalidation.ts) to refresh it at once.
 */

import { NextResponse } from "next/server";
import { getPublishedBlogPosts } from "@/lib/data/blog";
import { getSupabaseBlogs } from "@/lib/db/queries";
import { absoluteUrl, SITE_URL, SITE_NAME } from "@/lib/seo";

export const revalidate = 86400;
export const runtime = "nodejs";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function rfcDate(isoDate: string): string {
  try {
    return new Date(isoDate).toUTCString();
  } catch {
    return new Date().toUTCString();
  }
}

export async function GET() {
  // Same publication rule as the post pages and /sitemap/blog.xml.
  const posts = getPublishedBlogPosts(await getSupabaseBlogs(false));

  // Sort newest-first
  const sorted = [...posts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const feedUrl = `${SITE_URL}/blog/feed.xml`;
  const blogUrl = `${SITE_URL}/blog`;

  const items = sorted
    .map((post) => {
      const postUrl = absoluteUrl(`/blog/${post.slug}`);
      const coverUrl = post.coverImage
        ? absoluteUrl(post.coverImage)
        : absoluteUrl("/logo.png");

      // Prefer rich HTML body; fall back to joined paragraphs
      const htmlBody =
        post.htmlContent ||
        post.content
          .map((p) => `<p>${escapeXml(p)}</p>`)
          .join("\n");

      return `
    <item>
      <title>${escapeXml(post.seoTitle || post.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description>${escapeXml(post.seoDescription || post.excerpt)}</description>
      <pubDate>${rfcDate(post.publishedAt)}</pubDate>
      <dc:creator>${escapeXml(post.author.name)}</dc:creator>
      <dc:date>${post.publishedAt}</dc:date>
      <category>${escapeXml(post.categoryLabel)}</category>
      <media:content
        url="${escapeXml(coverUrl)}"
        medium="image"
        type="image/jpeg"
      />
      <media:thumbnail url="${escapeXml(coverUrl)}" />
      <content:encoded><![CDATA[${htmlBody}]]></content:encoded>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:media="http://search.yahoo.com/mrss/"
  xmlns:atom="http://www.w3.org/2005/Atom"
>
  <channel>
    <title>${escapeXml(SITE_NAME)} Insights</title>
    <link>${blogUrl}</link>
    <description>Market reports, NRI advisory guides, and corridor analysis from ${escapeXml(SITE_NAME)} — Ahmedabad's private luxury real estate advisory.</description>
    <language>en-IN</language>
    <managingEditor>connect@pikorua.in (${escapeXml(SITE_NAME)})</managingEditor>
    <webMaster>connect@pikorua.in (${escapeXml(SITE_NAME)})</webMaster>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <ttl>60</ttl>
    <image>
      <url>${absoluteUrl("/logo.png")}</url>
      <title>${escapeXml(SITE_NAME)} Insights</title>
      <link>${blogUrl}</link>
    </image>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      // CDN cache 10 min, stale up to 1 hour
      "Cache-Control": "public, max-age=600, stale-while-revalidate=3600",
    },
  });
}
