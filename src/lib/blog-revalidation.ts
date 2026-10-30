import "server-only";

import { revalidatePath } from "next/cache";

/**
 * Refreshes every cached public surface that lists or renders blog posts,
 * after a post is saved, approved, published, deactivated or deleted.
 *
 * Blog data comes from the DB through React `cache()`, which carries no cache
 * tags, so revalidateTag() does not reach these pages — only revalidatePath()
 * does. Pass every slug the change affects (e.g. the old and new slug on a
 * rename).
 */
export function revalidateBlogPaths(slugs: (string | null | undefined)[]) {
  revalidatePath("/blog");
  revalidatePath("/blog/feed.xml");
  revalidateSitemap("blog");
  revalidatePath("/llms.txt");
  revalidatePath("/llms-full.txt");
  for (const slug of new Set(slugs.map((s) => s?.replace(/^\//, "")).filter(Boolean))) {
    revalidatePath(`/blog/${slug}`);
  }
}

/**
 * Refreshes one /sitemap/<id>.xml child sitemap. It is served through the
 * /sitemap/:id → /xml-sitemap/:id rewrite, and its cache entry is tagged with
 * whichever path generated it: the public /sitemap/… URL when rendered on
 * request (verified on a 16.2.7 build), the /xml-sitemap/… route path when
 * prerendered. Revalidate both.
 */
export function revalidateSitemap(id: "blog" | "properties") {
  revalidatePath(`/sitemap/${id}.xml`);
  revalidatePath(`/xml-sitemap/${id}.xml`);
}
