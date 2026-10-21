import "server-only";

import { cache } from "react";
import { query, queryOne } from "@/lib/db";
import { MEDIA_BASE } from "@/lib/media";
import { STATIC_PROPERTIES, type StaticProperty } from "@/lib/data/properties";
import type { Testimonial, AboutPageContent, GeneralFaq } from "@/types";
import type { BlogPost } from "@/types/blog";

// Helper to convert local image paths to absolute media URLs if needed.
// (In db-seeding we keep relative paths; this function ensures they render correctly)
export function getMediaUrl(localPath: string): string {
  if (!localPath) return "";
  if (localPath.startsWith("http")) return localPath;
  if (localPath.startsWith("/properties/") || localPath.startsWith("/images/")) {
    return `${MEDIA_BASE}${localPath}`;
  }
  return localPath;
}

function sanitizeTextArray(arr: string[]): string[] {
  if (!arr) return [];
  const replacements: { pattern: RegExp; replacement: string }[] = [
    { pattern: /\bMaruti 360\b/gi, replacement: "this development" },
    { pattern: /\bIkebana\b/gi, replacement: "this residence" },
    { pattern: /\bPashmina\b/gi, replacement: "this residence" },
    { pattern: /\bSwati Senor\b/gi, replacement: "this development" },
    { pattern: /\bAnurita\b/gi, replacement: "this bungalow estate" },
    { pattern: /\bBelagio\b/gi, replacement: "this design" },
    { pattern: /\bAnamika\b/gi, replacement: "this project" },
    { pattern: /\bTriveni 84\b/gi, replacement: "this development" },
    { pattern: /\bAvant\b/gi, replacement: "this development" },
    { pattern: /\bCapstone\b/gi, replacement: "this development" },
    { pattern: /\bEminence 96\b/gi, replacement: "this development" },
    { pattern: /\bBelrosa\b/gi, replacement: "this project" },
    { pattern: /\bRashmi\b/gi, replacement: "this project" },
    { pattern: /\bVaikunth\b/gi, replacement: "this estate" },
    { pattern: /\bNorthpark\b/gi, replacement: "this villa project" },
    { pattern: /\bKalrav Alpines\b/gi, replacement: "this plot development" },
    { pattern: /\bWestpark\b/gi, replacement: "this development" },
    { pattern: /\bAtman\b/gi, replacement: "this development" },
    { pattern: /\bShaligram Luxuria\b/gi, replacement: "this development" },
    { pattern: /\bKimana\b/gi, replacement: "this project" },
  ];

  return arr.map(text => {
    let cleaned = text;
    replacements.forEach(({ pattern, replacement }) => {
      cleaned = cleaned.replace(pattern, replacement);
    });
    // Capitalize first letter of each sentence
    cleaned = cleaned.replace(/(^\s*|[.!?]\s+)([a-z])/g, (_, prefix, char) => prefix + char.toUpperCase());
    return cleaned;
  });
}

function mapDbPropertyToStatic(db: any): StaticProperty {
  const staticProp = STATIC_PROPERTIES.find(p => p.id === db.id || p.slug === db.slug);

  const price = db.price || staticProp?.price;
  const description = db.description && db.description.length > 0
    ? db.description
    : (staticProp?.description || []);
  const highlights = db.highlights && db.highlights.length > 0
    ? db.highlights
    : (staticProp?.highlights || []);

  return {
    id: db.id,
    slug: db.slug,
    name: db.name,
    category: db.category,
    location: db.location,
    locationLabel: db.location_label,
    configuration: db.configuration,
    sizeRange: db.size_range,
    status: db.status,
    coverImage: getMediaUrl(db.cover_image),
    images: (db.images || []).map(getMediaUrl),
    isFeatured: db.is_featured,
    price: price,
    priceOnRequest: db.price_on_request ?? staticProp?.priceOnRequest,
    description: sanitizeTextArray(description),
    highlights: sanitizeTextArray(highlights),
    builtUpArea: db.built_up_area || staticProp?.builtUpArea || undefined,
    plotArea: db.plot_area || staticProp?.plotArea || undefined,
    floor: db.floor || staticProp?.floor || undefined,
    suitableFor: db.suitable_for || staticProp?.suitableFor || undefined,
    amenitiesSummary: db.amenities_summary || staticProp?.amenitiesSummary || undefined,
    seoTitle: db.seo_title || staticProp?.seoTitle || undefined,
    seoDescription: db.seo_description || staticProp?.seoDescription || undefined,
    isActive: db.is_active !== undefined ? db.is_active : true,
    imageAlts: db.image_alts || {},
  };
}

function mapDbTestimonialToTypes(db: any): Testimonial {
  return {
    _id: db.id,
    clientName: db.client_name,
    quote: db.quote,
    context: db.context,
    source: db.source,
    rating: db.rating || undefined,
    isFeatured: db.is_featured,
    isPublished: db.is_published,
    reviewUrl: db.review_url || undefined,
  };
}

export const getSupabaseProperties = cache(async function getSupabaseProperties(filters?: {
  location?: string;
  category?: string;
  onlyActive?: boolean;
}): Promise<StaticProperty[]> {
  try {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filters?.location) {
      params.push(filters.location);
      conditions.push(`location = $${params.length}`);
    }
    if (filters?.category) {
      params.push(filters.category);
      conditions.push(`category = $${params.length}`);
    }
    if (filters?.onlyActive) {
      conditions.push("is_active = true");
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const rows = await query(
      `SELECT * FROM properties ${where} ORDER BY is_featured DESC, created_at DESC`,
      params
    );

    return rows.map(mapDbPropertyToStatic);
  } catch (err) {
    console.error("Unhandled error in getSupabaseProperties:", err);
    return [];
  }
});

export const getSupabaseFeaturedProperties = cache(async function getSupabaseFeaturedProperties(): Promise<StaticProperty[]> {
  try {
    const rows = await query(
      "SELECT * FROM properties WHERE is_featured = true AND is_active = true ORDER BY created_at DESC"
    );
    return rows.map(mapDbPropertyToStatic);
  } catch (err) {
    console.error("Unhandled error in getSupabaseFeaturedProperties:", err);
    return [];
  }
});

export const getSupabasePropertyBySlug = cache(async function getSupabasePropertyBySlug(slug: string): Promise<StaticProperty | null> {
  try {
    const row = await queryOne("SELECT * FROM properties WHERE slug = $1", [slug]);
    return row ? mapDbPropertyToStatic(row) : null;
  } catch (err) {
    console.error("Unhandled error in getSupabasePropertyBySlug:", err);
    return null;
  }
});

export const getSupabaseAllPropertySlugs = cache(async function getSupabaseAllPropertySlugs(): Promise<string[]> {
  try {
    const rows = await query<{ slug: string }>("SELECT slug FROM properties WHERE is_active = true");
    return rows.map((r) => r.slug);
  } catch (err) {
    console.error("Unhandled error in getSupabaseAllPropertySlugs:", err);
    return [];
  }
});

export const getSupabaseAllPropertySlugsWithDates = cache(async function getSupabaseAllPropertySlugsWithDates(): Promise<
  { slug: string; updatedAt: string }[]
> {
  try {
    const rows = await query<{ slug: string; updated_at: string }>(
      "SELECT slug, updated_at FROM properties WHERE is_active = true"
    );
    return rows.map((r) => ({ slug: r.slug, updatedAt: r.updated_at }));
  } catch (err) {
    console.error("Unhandled error in getSupabaseAllPropertySlugsWithDates:", err);
    return [];
  }
});

export const getSupabaseFeaturedTestimonials = cache(async function getSupabaseFeaturedTestimonials(): Promise<Testimonial[]> {
  try {
    const rows = await query(
      "SELECT * FROM testimonials WHERE is_featured = true AND is_published = true ORDER BY created_at DESC LIMIT 3"
    );
    return rows.map(mapDbTestimonialToTypes);
  } catch (err) {
    console.error("Unhandled error in getSupabaseFeaturedTestimonials:", err);
    return [];
  }
});

export const getSupabaseAllTestimonials = cache(async function getSupabaseAllTestimonials(): Promise<Testimonial[]> {
  try {
    const rows = await query("SELECT * FROM testimonials WHERE is_published = true ORDER BY created_at DESC");
    return rows.map(mapDbTestimonialToTypes);
  } catch (err) {
    console.error("Unhandled error in getSupabaseAllTestimonials:", err);
    return [];
  }
});

function mapDbBlogToBlogPost(db: any): BlogPost {
  return {
    id: db.id,
    slug: db.slug ? db.slug.replace(/^\//, "") : "",
    title: db.title,
    category: db.category,
    categoryLabel: db.category_label,
    publishedAt: db.published_at,
    readTime: db.read_time,
    excerpt: db.excerpt,
    coverImage: getMediaUrl(db.cover_image),
    author: {
      name: db.author_name,
      role: db.author_role,
      avatar: getMediaUrl(db.author_avatar),
    },
    isFeatured: db.is_featured,
    content: db.content || [],
    htmlContent: db.html_content || undefined,
    faqs: db.faqs || [],
    seoTitle: db.seo_title || undefined,
    seoDescription: db.seo_description || undefined,
    isActive: db.is_active !== undefined ? db.is_active : true,
    updatedAt: db.updated_at || db.published_at,
    pendingReview: db.pending_review ?? false,
    source: db.source ?? "manual",
  };
}

export const getSupabaseBlogs = cache(async function getSupabaseBlogs(onlyActive = false): Promise<BlogPost[]> {
  try {
    const where = onlyActive ? "WHERE is_active = true AND pending_review = false" : "";
    const rows = await query(`SELECT * FROM blogs ${where} ORDER BY created_at DESC`);
    return rows.map(mapDbBlogToBlogPost);
  } catch (err) {
    console.error("Unhandled error in getSupabaseBlogs:", err);
    return [];
  }
});

export const getSupabaseBlogBySlug = cache(async function getSupabaseBlogBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const row = await queryOne(
      "SELECT * FROM blogs WHERE (slug = $1 OR slug = $2) AND is_active = true AND pending_review = false LIMIT 1",
      [slug, `/${slug}`]
    );
    return row ? mapDbBlogToBlogPost(row) : null;
  } catch (err) {
    console.error("Unhandled error in getSupabaseBlogBySlug:", err);
    return null;
  }
});

export const getSupabaseAboutPageContent = cache(async function getSupabaseAboutPageContent(): Promise<AboutPageContent | null> {
  try {
    const row = await queryOne<{ content: AboutPageContent }>("SELECT content FROM pages WHERE id = 'about'");
    const content = row?.content;
    if (!content) return null;

    return {
      ...content,
      founderAvatar: content.founderAvatar ? getMediaUrl(content.founderAvatar) : undefined,
    };
  } catch (err) {
    console.error("Unhandled error in getSupabaseAboutPageContent:", err);
    return null;
  }
});

export const getPageSeoData = cache(async function getPageSeoData(id: string): Promise<{ seoTitle?: string; seoDescription?: string } | null> {
  try {
    const row = await queryOne("SELECT content FROM pages WHERE id = $1", [id]);
    if (!row || !row.content) return null;
    const content = row.content as any;
    return {
      seoTitle: content.seoTitle || undefined,
      seoDescription: content.seoDescription || undefined,
    };
  } catch (err) {
    console.error(`Unhandled error in getPageSeoData for ${id}:`, err);
    return null;
  }
});

export const getSupabaseHomePageContent = cache(async function getSupabaseHomePageContent(): Promise<any | null> {
  try {
    const row = await queryOne("SELECT content FROM pages WHERE id = 'home'");
    return row?.content || null;
  } catch (err) {
    console.error("Unhandled error in getSupabaseHomePageContent:", err);
    return null;
  }
});

export const getSupabaseGeneralFaqs = cache(async function getSupabaseGeneralFaqs(): Promise<GeneralFaq[]> {
  try {
    return await query<GeneralFaq>("SELECT * FROM general_faqs ORDER BY display_order ASC, created_at ASC");
  } catch (err) {
    console.error("Unhandled error in getSupabaseGeneralFaqs:", err);
    return [];
  }
});
