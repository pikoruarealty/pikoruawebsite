import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getPublishedBlogPosts, resolvePublicBlogPost } from "@/lib/data/blog";
import { getSupabaseBlogs, getSupabaseBlogBySlug } from "@/lib/db/queries";
import { renderFormattedText } from "@/lib/utils";
import { ENTITY_IDS } from "@/lib/entity-profile";
import { absoluteUrl, createMetadata, serializeJsonLd, SITE_NAME, SITE_URL } from "@/lib/seo";
import { getLandingPagesBySlugs, getRelatedLandingPagesForText } from "@/lib/data/geo";
import { AUTOMATED_BYLINE } from "@/lib/ai/blogQuality";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const dbBlogs = await getSupabaseBlogs(false);
  return getPublishedBlogPosts(dbBlogs).map((post) => ({
    slug: post.slug,
  }));
}

// ISR: re-render at most daily. Blog saves, approvals and deletions call
// revalidateBlogPaths() (src/lib/blog-revalidation.ts) to refresh it at once.
export const revalidate = 86400;

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = resolvePublicBlogPost(slug, await getSupabaseBlogBySlug(slug));
  if (!post) return {};

  return createMetadata({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.coverImage,
    type: "article",
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = resolvePublicBlogPost(slug, await getSupabaseBlogBySlug(slug));

  if (!post) {
    notFound();
  }


  // Get reading time and date
  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const relatedLandingPages = post.relatedLandingSlugs?.length
    ? getLandingPagesBySlugs(post.relatedLandingSlugs)
    : getRelatedLandingPagesForText(`${post.title} ${post.excerpt} ${post.htmlContent ? post.htmlContent.replace(/<[^>]+>/g, " ") : post.content.join(" ")}`);

  const canonicalUrl = absoluteUrl(`/blog/${post.slug}`);
  const bodyText = post.htmlContent ? post.htmlContent.replace(/<[^>]+>/g, " ") : post.content.join(" ");
  const wordCount = bodyText.split(/\s+/).filter(Boolean).length;
  const dateModified = post.updatedAt || post.publishedAt;

  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${canonicalUrl}#article`,
    headline: post.title,
    description: post.excerpt,
    image: absoluteUrl(post.coverImage),
    datePublished: post.publishedAt,
    dateModified: dateModified,
    wordCount: wordCount,
    // Unreviewed automated posts are credited to the organisation, not a person.
    author: post.author.name === AUTOMATED_BYLINE.name
      ? { "@type": "Organization", "@id": ENTITY_IDS.realEstateAgent, name: SITE_NAME }
      : {
          "@type": "Person",
          name: post.author.name,
          worksFor: {
            "@type": "RealEstateAgent",
            "@id": ENTITY_IDS.realEstateAgent,
            name: SITE_NAME,
          },
        },
    publisher: {
      "@type": "Organization",
      "@id": ENTITY_IDS.realEstateAgent,
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/logo.png"),
      },
    },
    mainEntityOfPage: canonicalUrl,
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Insights",
        item: absoluteUrl("/blog"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: canonicalUrl,
      },
    ],
  };

  const combinedBlogSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        ...blogPostingSchema,
        "@context": undefined,
      },
      {
        ...breadcrumbSchema,
        "@context": undefined,
      },
      // FAQ rich result schema — only emitted when FAQs are present
      ...(post.faqs && post.faqs.length > 0 ? [{
        "@type": "FAQPage",
        mainEntity: post.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      }] : []),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(combinedBlogSchema) }}
      />
      <Header alwaysSolid />
      <main id="main-content" className="bg-lux-black text-ivory min-h-screen">
        <article className="pt-32 pb-24 lg:pt-36 lg:pb-32">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            
            {/* Back button */}
            <div className="mb-10">
              <Link
                href="/blog"
                className="group inline-flex items-center gap-2 text-xs font-sans uppercase tracking-[0.2em] text-champagne-gold/70 hover:text-champagne-gold transition-colors duration-150"
              >
                <span className="transform group-hover:-translate-x-1 transition-transform duration-300">←</span>
                Back to Blog
              </Link>
            </div>

            {/* Header info */}
            <header className="mb-10">


              <h1 className="font-display text-[clamp(1.75rem,4.5vw,2.75rem)] font-normal text-ivory leading-[1.15] mb-8 uppercase tracking-wide">
                {post.title}
              </h1>

              {/* Metadata */}
              <div className="flex items-center justify-between border-y border-white/[0.06] py-5">
                <time dateTime={post.publishedAt} className="text-xs font-sans text-ivory/60">
                  {formattedDate}
                </time>
                <span className="text-xs font-sans tracking-wide text-ivory/40">
                  {post.readTime}
                </span>
              </div>
            </header>

            {/* Cover image */}
            <div className="relative aspect-[16/9] w-full overflow-hidden border border-white/[0.06] rounded-sm bg-soft-black/20 mb-12">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                quality={75}
                preload
                sizes="(max-width: 1024px) 100vw, 800px"
                className="object-cover object-center"
              />
            </div>

            {/* Content body */}
            <div className="font-sans text-ivory/60 text-[15px] sm:text-base leading-[1.8] max-w-3xl mx-auto space-y-6 sm:space-y-8">
              {post.htmlContent ? (
                // DOCX-imported content: single styled HTML block
                <div
                  className="prose-blog"
                  dangerouslySetInnerHTML={{ __html: post.htmlContent }}
                />
              ) : (
                // Plain-text paragraph array: rendered element-by-element
                post.content.map((paragraph, index) => {
                  const isHeading = paragraph.startsWith("### ");
                  const isListItem = paragraph.startsWith("- ") || paragraph.startsWith("* ");

                  if (isHeading) {
                    return (
                      <h3 
                        key={index}
                        className="font-display text-lg sm:text-xl text-white uppercase tracking-wider mt-10 mb-4 font-normal"
                        dangerouslySetInnerHTML={{ __html: renderFormattedText(paragraph.substring(4)) }}
                      />
                    );
                  }

                  if (isListItem) {
                    return (
                      <div key={index} className="flex items-start gap-2.5 my-2 pl-4 text-ivory/70">
                        <span className="w-1.5 h-1.5 rounded-full bg-champagne-gold/75 mt-2 flex-shrink-0 animate-pulse" />
                        <span dangerouslySetInnerHTML={{ __html: renderFormattedText(paragraph.substring(2)) }} />
                      </div>
                    );
                  }

                  // Style the first paragraph slightly larger as an intro
                  if (index === 0) {
                    return (
                      <p 
                        key={index} 
                        className="text-ivory/80 text-[17px] sm:text-lg leading-[1.7] font-normal font-sans border-l-2 border-champagne-gold/40 pl-5 italic mb-8"
                        dangerouslySetInnerHTML={{ __html: renderFormattedText(paragraph) }}
                      />
                    );
                  }
                  return (
                    <p 
                      key={index} 
                      dangerouslySetInnerHTML={{ __html: renderFormattedText(paragraph) }}
                    />
                  );
                })
              )}
            </div>

            {/* FAQ Accordion — AEO section */}
            {post.faqs && post.faqs.length > 0 && (
              <div className="mt-16 lg:mt-20 max-w-3xl mx-auto">
                <p className="text-[10px] uppercase tracking-[0.25em] text-champagne-gold font-sans mb-6">Frequently Asked Questions</p>
                <div className="divide-y divide-white/[0.06]">
                  {post.faqs.map((faq, idx) => (
                    <details
                      key={idx}
                      className="group py-4 cursor-pointer"
                    >
                      <summary className="flex items-start justify-between gap-4 list-none cursor-pointer">
                        <h3 className="font-sans text-sm text-ivory/85 font-normal leading-snug">{faq.question}</h3>
                        <span className="text-champagne-gold/60 mt-0.5 flex-shrink-0 text-xs transition-transform group-open:rotate-45">+</span>
                      </summary>
                      <p className="mt-3 font-sans text-sm text-ivory/50 leading-relaxed pr-8">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom CTA block */}
            <div className="mt-16 lg:mt-24 border border-champagne-gold/15 bg-white/[0.01] backdrop-blur-md p-8 lg:p-10 rounded-sm text-center relative overflow-hidden max-w-3xl mx-auto">
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-champagne-gold/5 blur-[50px] pointer-events-none" />
              <div className="w-8 h-px bg-champagne-gold/40 mx-auto mb-6" aria-hidden="true" />
              
              <h3 className="font-display text-lg sm:text-xl text-ivory mb-3 uppercase tracking-wider">
                Begin a Private Conversation
              </h3>
              
              <p className="text-xs font-sans text-ivory/45 max-w-md mx-auto leading-relaxed mb-8">
                Whether you are exploring luxury investments, seeking a signature penthouses, or require private representation for a high-value sale, our advisory desk responds personally.
              </p>

              <Link
                href="/contact"
                className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 text-xs font-sans uppercase tracking-[0.2em] text-champagne-gold border border-champagne-gold/30 hover:border-champagne-gold/65 hover:bg-champagne-gold/[0.04] transition-all duration-300 min-h-[48px]"
              >
                Discuss Privately
                <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Link>
            </div>

            {/* Related landing-page guides */}
            {relatedLandingPages.length > 0 && (
              <div className="mt-16 lg:mt-20 max-w-3xl mx-auto">
                <p className="text-[10px] uppercase tracking-[0.25em] text-champagne-gold font-sans mb-6">
                  Related Guides
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedLandingPages.map((related) => (
                    <Link
                      key={related.href}
                      href={related.href}
                      className="group border border-white/[0.07] rounded-sm p-5 hover:border-champagne-gold/35 transition-colors"
                    >
                      <span className="text-[10px] uppercase tracking-[0.2em] text-ivory/35 font-sans">
                        {related.eyebrow}
                      </span>
                      <h3 className="mt-3 font-display text-lg uppercase tracking-wide text-ivory group-hover:text-champagne-gold transition-colors">
                        {related.label}
                      </h3>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
