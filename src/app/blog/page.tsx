import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getPublishedBlogPosts } from "@/lib/data/blog";
import { getSupabaseBlogs } from "@/lib/db/queries";
import { createMetadata, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  ...createMetadata({
    title: "Luxury Real Estate Insights",
    description:
      "Expert perspectives on Ahmedabad's luxury residential corridors, off-market advisory reports, and HNI/NRI real estate guides.",
    path: "/blog",
    image: "/blog/blog-pikorua-consulting-cover.png",
  }),
  // RSS auto-discovery: browsers, feed readers, and AI crawlers pick this up
  // from the <link rel="alternate"> tag Next.js renders in the <head>.
  alternates: {
    canonical: `${SITE_URL}/blog`,
    types: {
      "application/rss+xml": `${SITE_URL}/blog/feed.xml`,
    },
  },
};

// ISR: re-render at most daily. Blog saves, approvals and deletions call
// revalidateBlogPaths() (src/lib/blog-revalidation.ts) to refresh it at once.
export const revalidate = 86400;

export default async function BlogListingPage() {
  // Same publication rule as the post pages and /sitemap/blog.xml.
  const posts = getPublishedBlogPosts(await getSupabaseBlogs(false));

  const featuredPost = posts.find((post) => post.isFeatured) || posts[0];
  const regularPosts = posts.filter((post) => post.id !== featuredPost?.id);

  return (
    <>
      <Header alwaysSolid />
      <main id="main-content" className="bg-lux-black text-ivory min-h-screen">

        {/* ── Hero Section ────────────────────────────────────── */}
        <section
          className="relative bg-lux-black pt-28 pb-12 lg:pt-40 lg:pb-16 overflow-hidden border-b border-white/[0.05]"
          aria-label="Blog header"
        >
          {/* Atmospheric radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-champagne-gold/[0.04] rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[200px] bg-champagne-gold/[0.025] rounded-full blur-[100px]" />
          </div>

          {/* Faint grid texture */}
          <div
            className="absolute inset-0 opacity-[0.025] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(200,164,93,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(200,164,93,0.5) 1px, transparent 1px)",
              backgroundSize: "80px 80px",
            }}
            aria-hidden="true"
          />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Headline */}
            <h1 className="font-display text-[clamp(1.25rem,2.2vw,1.75rem)] font-normal text-ivory leading-tight uppercase tracking-wider mb-6">
              Insights & Advisory
            </h1>

            {/* Sub-line */}
            <p className="text-[13px] text-ivory/45 font-sans font-light leading-relaxed max-w-md">
              Perspectives on market structures, corridor valuations, and legal
              frameworks of high-value residential acquisitions in Ahmedabad.
            </p>


          </div>
        </section>

        {/* ── Featured Post ────────────────────────────────────── */}
        {featuredPost && (
          <section
            className="py-16 lg:py-24"
            aria-label="Featured article"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">



              <Link
                href={`/blog/${featuredPost.slug}`}
                className="group block grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center"
              >
                {/* Image */}
                <div className="lg:col-span-7 relative aspect-[16/10] overflow-hidden border border-white/[0.07] rounded-sm transition-all duration-500 shadow-2xl">
                  <Image
                    src={featuredPost.coverImage}
                    alt={featuredPost.title}
                    fill
                    quality={75}
                    preload
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover object-center"
                  />
                  {/* Dual gradient: bottom and left edge */}
                  <div className="absolute inset-0 bg-gradient-to-t from-lux-black/55 via-transparent to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-lux-black/20 via-transparent to-transparent" />
                </div>

                {/* Info */}
                <div className="lg:col-span-5 flex flex-col justify-center">
                  {/* Meta row */}
                  <div className="flex items-center gap-2 mb-5">
                    <span className="text-[10px] font-sans tracking-wide text-ivory/35">
                      {new Date(featuredPost.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <h2 className="font-display text-[clamp(1.6rem,3.2vw,2.4rem)] font-normal text-ivory mb-5 leading-[1.15]">
                    {featuredPost.title}
                  </h2>

                  <p className="text-sm font-sans text-ivory/50 leading-relaxed mb-8">
                    {featuredPost.excerpt}
                  </p>

                  <div className="border-t border-white/[0.06] pt-6">
                    <span className="group/cta inline-flex items-center gap-2.5 text-[11px] font-sans uppercase tracking-[0.22em] text-champagne-gold hover:text-antique-gold transition-colors duration-200">
                      Read Full Report
                      <span>→</span>
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </section>
        )}

        {/* ── Section Divider ──────────────────────────────────── */}
        {regularPosts.length > 0 && (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" aria-hidden="true" />
          </div>
        )}

        {/* ── Recent Analysis Grid ─────────────────────────────── */}
        {regularPosts.length > 0 && (
          <section className="py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

              {/* Section heading */}
              <div className="flex items-center gap-4 mb-12">
                <div className="w-5 h-px bg-champagne-gold/50" aria-hidden="true" />
                <h2 className="font-display text-[clamp(1rem,2vw,1.35rem)] font-normal text-ivory uppercase tracking-[0.18em]">
                  Recent Analysis
                </h2>
                <div className="flex-1 h-px bg-white/[0.05]" aria-hidden="true" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 lg:gap-9">
                {regularPosts.map((post) => (
                  <article key={post.id} className="h-full group">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="flex flex-col h-full border border-white/[0.07] bg-soft-black/20 rounded-sm overflow-hidden"
                    >
                      {/* Cover image */}
                      <div className="relative aspect-[16/10] overflow-hidden flex-shrink-0">
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          quality={75}
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-lux-black/40 via-transparent to-transparent" />
                      </div>

                      {/* Card body */}
                      <div className="p-6 flex-1 flex flex-col">


                        {/* Title */}
                        <h3 className="font-display text-[0.95rem] text-ivory mb-3 leading-[1.3] font-normal flex-grow">
                          {post.title}
                        </h3>

                        {/* Excerpt */}
                        <p className="text-[12px] font-sans text-ivory/40 leading-relaxed line-clamp-2 mb-6">
                          {post.excerpt}
                        </p>

                        {/* Footer row */}
                        <div className="mt-auto pt-4 border-t border-white/[0.05] flex items-center justify-between">
                          <time
                            dateTime={post.publishedAt}
                            className="text-[10px] font-sans text-ivory/30"
                          >
                            {new Date(post.publishedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </time>

                          <span className="inline-flex items-center gap-1.5 text-[10px] font-sans uppercase tracking-[0.2em] text-champagne-gold group-hover:text-antique-gold transition-colors duration-200">
                            Read Analysis
                            <span>→</span>
                          </span>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Empty state if no posts beyond featured ──────────── */}
        {regularPosts.length === 0 && featuredPost && (
          <section className="py-16 border-t border-white/[0.04]">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
              <p className="text-xs font-sans text-ivory/30 uppercase tracking-[0.2em]">
                More insights coming soon
              </p>
            </div>
          </section>
        )}

      </main>
      <Footer />
    </>
  );
}
