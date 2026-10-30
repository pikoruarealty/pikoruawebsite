"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { query, queryOne, upsert, toJson, errorMessage } from "@/lib/db";
import { MEDIA_BASE } from "@/lib/media";
import { promises as fs } from "fs";
import path from "path";
import { fetchRealEstateNews, generateBlogDraftFromNews } from "@/lib/ai/blogAutomation";
import { submitToIndexNow } from "@/lib/index-now";
import { notifyGoogleIndexing } from "@/lib/google-indexing";
import { SITE_URL } from "@/lib/seo";
import { revalidateBlogPaths, revalidateSitemap } from "@/lib/blog-revalidation";
import { getAutoBlogPause, getRecentAutoBlogRuns, isAutoPublishEnabled, setAutoBlogPause } from "@/lib/ai/blogPipeline";

import crypto, { createHash } from "crypto";

// Get admin email and password from environment variables
const getAdminEmail = () => process.env.ADMIN_EMAIL || "pikoruarealtymarketing@gmail.com";
const getAdminPassword = () => process.env.ADMIN_PASSWORD || "";

// Generate a stable session token from credentials
const getSessionToken = () => {
  const email = getAdminEmail();
  const password = getAdminPassword();
  return createHash("sha256").update(`${email}:${password}`).digest("hex");
};

/**
 * Validates credentials and sets the session cookie.
 */
export async function loginAction(email: string, password: string) {
  const adminEmail = getAdminEmail();
  const adminPassword = getAdminPassword();

  if (!adminPassword) {
    return { success: false, error: "Admin login is not configured." };
  }
  
  if (email === adminEmail && password === adminPassword) {
    const cookieStore = await cookies();
    cookieStore.set("admin_session", getSessionToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });
    return { success: true };
  }
  return { success: false, error: "Invalid email or password. Please try again." };
}

/**
 * Removes session cookie to log out.
 */
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.set("admin_session", "", {
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
  revalidatePath("/admin");
  return { success: true };
}

/**
 * Checks if the user is authenticated on the server side.
 */
export async function checkSession() {
  // Without a configured password the token is computable from the default
  // email alone, so no session is valid (loginAction refuses too).
  if (!getAdminPassword()) return false;
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  return session?.value === getSessionToken();
}

/**
 * Guard utility for checking authentication inside actions.
 */
async function requireAuth() {
  const isAuthed = await checkSession();
  if (!isAuthed) {
    throw new Error("Unauthorized access. Please log in.");
  }
}

/**
 * Fetches all leads along with their consultation bookings and property enquiries.
 */
export async function getLeads() {
  await requireAuth();

  try {
    // Same shape PostgREST returned for `*, consultation_bookings (*), property_enquiries (*)`.
    return await query(`
      SELECT l.*,
        COALESCE((SELECT json_agg(cb) FROM consultation_bookings cb WHERE cb.lead_id = l.id), '[]'::json) AS consultation_bookings,
        COALESCE((SELECT json_agg(pe) FROM property_enquiries pe WHERE pe.lead_id = l.id), '[]'::json) AS property_enquiries
      FROM leads l
      ORDER BY l.created_at DESC
    `);
  } catch (error) {
    console.error("Error fetching leads:", error);
    throw new Error(errorMessage(error));
  }
}

/**
 * Updates a lead's status and logs an event in the audit trail.
 */
export async function updateLeadStatus(leadId: string, status: string) {
  await requireAuth();

  // Update status
  try {
    await query("UPDATE leads SET status = $1 WHERE id = $2", [status, leadId]);
  } catch (statusError) {
    console.error("Error updating lead status:", statusError);
    throw new Error(errorMessage(statusError));
  }

  // Create audit event
  try {
    await query(
      "INSERT INTO lead_events (lead_id, type, payload) VALUES ($1, 'status_changed', $2)",
      [leadId, toJson({ status })]
    );
  } catch (eventError) {
    console.error("Error logging lead event:", eventError);
  }

  return { success: true };
}

/**
 * Automatically generates property SEO tags in the background.
 */
async function autoGeneratePropertySeo(property: any) {
  const title = property.name || "";
  const config = property.configuration || "";
  const loc = property.locationLabel || property.location_label || "";
  const desc = Array.isArray(property.description) ? property.description.join(" ") : (property.description || "");
  const highlights = Array.isArray(property.highlights) ? property.highlights.join(", ") : (property.highlights || "");

  try {
    const res = await generatePropertySeoAction(title, config, loc, desc, highlights);
    if (res.success && res.metadata) {
      return {
        seoTitle: res.metadata.seoTitle,
        seoDescription: res.metadata.seoDescription
      };
    }
  } catch (err) {
    console.error("Error generating automatic property SEO:", err);
  }
  return null;
}

/**
 * Creates or updates a property in the database.
 */
export async function createOrUpdateProperty(property: any) {
  await requireAuth();

  let seoTitle = property.seoTitle || property.seo_title || null;
  let seoDescription = property.seoDescription || property.seo_description || null;

  if (!seoTitle || !seoDescription) {
    const seoResult = await autoGeneratePropertySeo(property);
    if (seoResult) {
      if (!seoTitle) seoTitle = seoResult.seoTitle;
      if (!seoDescription) seoDescription = seoResult.seoDescription;
    }
  }

  const dbProperty = {
    id: property.id,
    slug: property.slug,
    name: property.name,
    category: property.category,
    location: property.location,
    location_label: property.locationLabel || property.location_label,
    configuration: property.configuration,
    size_range: property.sizeRange || property.size_range,
    status: property.status,
    cover_image: property.coverImage || property.cover_image,
    images: property.images || [],
    is_featured: property.isFeatured !== undefined ? property.isFeatured : property.is_featured,
    price: property.price || "Price on Request",
    price_on_request: property.priceOnRequest !== undefined ? property.priceOnRequest : property.price_on_request,
    description: property.description || [],
    highlights: property.highlights || [],
    built_up_area: property.builtUpArea || property.built_up_area || null,
    plot_area: property.plotArea || property.plot_area || null,
    floor: property.floor || null,
    suitable_for: property.suitableFor || property.suitable_for || null,
    seo_title: seoTitle,
    seo_description: seoDescription,
    is_active: property.isActive !== undefined ? property.isActive : (property.is_active !== undefined ? property.is_active : true),
    image_alts: property.imageAlts || property.image_alts || {},
  };

  try {
    await upsert("properties", dbProperty, { jsonColumns: ["image_alts"] });
  } catch (error) {
    console.error("Error upserting property:", error);
    throw new Error(errorMessage(error));
  }

  // Revalidate frontend caches
  revalidatePath("/properties");
  revalidatePath(`/properties/${property.slug}`);
  revalidateSitemap("properties");

  // Trigger Google Indexing API ping in background
  const absoluteUrl = `https://pikorua.in/properties/${property.slug}`;
  triggerGoogleIndexing(absoluteUrl, "URL_UPDATED");

  return { success: true };
}

/**
 * Updates only the image_alts column for a property. Used by the bulk
 * "Generate Missing Alt Text" action so it doesn't have to resend every
 * other property field (unlike createOrUpdateProperty's full upsert) just
 * to persist AI-generated alt text.
 */
export async function updatePropertyImageAlts(id: string, imageAlts: Record<string, string>) {
  await requireAuth();

  try {
    await query("UPDATE properties SET image_alts = $1 WHERE id = $2", [toJson(imageAlts), id]);
  } catch (error) {
    console.error("Error updating property image alts:", error);
    throw new Error(errorMessage(error));
  }

  revalidatePath("/properties");
  return { success: true };
}

/**
 * Deletes a property from the database.
 */
export async function deleteProperty(id: string, slug: string) {
  await requireAuth();

  try {
    await query("DELETE FROM properties WHERE id = $1", [id]);
  } catch (error) {
    console.error("Error deleting property:", error);
    throw new Error(errorMessage(error));
  }

  // Revalidate frontend caches
  revalidatePath("/properties");
  revalidatePath(`/properties/${slug}`);
  revalidateSitemap("properties");

  // Trigger Google Indexing API deletion in background
  const absoluteUrl = `https://pikorua.in/properties/${slug}`;
  triggerGoogleIndexing(absoluteUrl, "URL_DELETED");

  return { success: true };
}

/**
 * Creates or updates a testimonial in the database.
 */
export async function createOrUpdateTestimonial(testimonial: any) {
  await requireAuth();

  const dbTestimonial = {
    id: testimonial.id || undefined, // undefined lets Postgres auto-generate UUID on insert
    client_name: testimonial.clientName || testimonial.client_name,
    quote: testimonial.quote,
    context: testimonial.context,
    source: testimonial.source || "google",
    rating: testimonial.rating || null,
    is_featured: testimonial.isFeatured !== undefined ? testimonial.isFeatured : testimonial.is_featured,
    is_published: testimonial.isPublished !== undefined ? testimonial.isPublished : testimonial.is_published,
  };

  try {
    await upsert("testimonials", dbTestimonial);
  } catch (error) {
    console.error("Error upserting testimonial:", error);
    throw new Error(errorMessage(error));
  }

  revalidatePath("/testimonials");

  return { success: true };
}

/**
 * Deletes a testimonial from the database.
 */
export async function deleteTestimonial(id: string) {
  await requireAuth();

  try {
    await query("DELETE FROM testimonials WHERE id = $1", [id]);
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    throw new Error(errorMessage(error));
  }

  revalidatePath("/testimonials");

  return { success: true };
}

/**
 * Saves an uploaded image to MEDIA_DIR on disk (served by Nginx under /media).
 */
export async function uploadImageAction(formData: FormData) {
  try {
    await requireAuth();
  } catch {
    return { success: false, error: "Unauthorized. Please log in again." };
  }

  const mediaDir = process.env.MEDIA_DIR;
  if (!mediaDir) {
    return { success: false, error: "MEDIA_DIR is not configured." };
  }

  const file = formData.get("file") as File;
  if (!file || !file.name) {
    return { success: false, error: "No file provided." };
  }

  const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
  if (!ALLOWED_UPLOAD_EXTENSIONS.has(fileExt)) {
    return { success: false, error: `File type .${fileExt} is not allowed.` };
  }
  const fileName = `${Math.random().toString(36).substring(2, 10)}-${Date.now()}.${fileExt}`;
  const filePath = `properties/${fileName}`;

  let buffer: Buffer;
  try {
    const arrayBuffer = await file.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  } catch (e: any) {
    return { success: false, error: "Failed to read file: " + e.message };
  }

  try {
    const absolutePath = path.join(mediaDir, filePath);
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    // "wx" fails instead of overwriting if the name somehow already exists.
    await fs.writeFile(absolutePath, buffer, { flag: "wx" });
  } catch (e) {
    console.error("Media upload error:", e);
    return { success: false, error: "Failed to save file: " + errorMessage(e) };
  }

  return { success: true, url: `${MEDIA_BASE}/${filePath}` };
}

const ALLOWED_UPLOAD_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "avif", "gif", "mp4"]);

/**
 * Automatically generates blog SEO tags, excerpt, and FAQs in the background.
 */
async function autoGenerateBlogSeo(blog: any) {
  const title = blog.title || "";
  const excerpt = blog.excerpt || "";
  const contentText = Array.isArray(blog.content) ? blog.content.join(" ") : (blog.content || "");
  const htmlContent = blog.htmlContent || blog.html_content || "";

  try {
    const res = await generateBlogMetadataAction(title, contentText || excerpt, htmlContent);
    if (res.success && res.metadata) {
      return {
        seoTitle: res.metadata.seoTitle,
        seoDescription: res.metadata.seoDescription,
        excerpt: res.metadata.excerpt,
        faqs: res.metadata.faqs
      };
    }
  } catch (err) {
    console.error("Error generating automatic blog SEO:", err);
  }
  return null;
}

/**
 * Creates or updates a blog post in the database.
 */
export async function createOrUpdateBlogPost(blog: any) {
  await requireAuth();

  const cleanSlug = blog.slug ? blog.slug.replace(/^\//, "") : "";

  let seoTitle = blog.seoTitle || blog.seo_title || null;
  let seoDescription = blog.seoDescription || blog.seo_description || null;
  let excerpt = blog.excerpt || null;
  let faqs = blog.faqs || [];

  if (!seoTitle || !seoDescription) {
    const seoResult = await autoGenerateBlogSeo(blog);
    if (seoResult) {
      if (!seoTitle) seoTitle = seoResult.seoTitle;
      if (!seoDescription) seoDescription = seoResult.seoDescription;
      if (!excerpt) excerpt = seoResult.excerpt;
      if (!faqs || faqs.length === 0) faqs = seoResult.faqs;
    }
  }

  const dbBlog = {
    id: blog.id,
    slug: cleanSlug,
    title: blog.title,
    category: blog.category,
    category_label: blog.categoryLabel || blog.category_label,
    published_at: blog.publishedAt || blog.published_at || new Date().toISOString().split("T")[0],
    read_time: blog.readTime || blog.read_time || "5 min read",
    excerpt: excerpt,
    cover_image: blog.coverImage || blog.cover_image,
    author_name: blog.authorName || blog.author_name || "Jitendra",
    author_role: blog.authorRole || blog.author_role || "PIKORUA Realty",
    author_avatar: blog.authorAvatar || blog.author_avatar || "/images/founder.jpg",
    is_featured: blog.isFeatured !== undefined ? blog.isFeatured : blog.is_featured,
    content: blog.content || [],
    seo_title: seoTitle,
    seo_description: seoDescription,
    is_active: blog.isActive !== undefined ? blog.isActive : (blog.is_active !== undefined ? blog.is_active : true),
    html_content: blog.htmlContent || blog.html_content || null,
    faqs: faqs,
  };

  let previousSlug: string | undefined;
  try {
    if (dbBlog.id) {
      previousSlug = (await queryOne<{ slug: string }>("SELECT slug FROM blogs WHERE id = $1", [dbBlog.id]))?.slug;
    }
    await upsert("blogs", dbBlog, { jsonColumns: ["faqs"] });
    // Saving a pending AI draft as Active is an approval: without clearing
    // the flag the post stays hidden from the public queries.
    if (dbBlog.is_active) {
      await query("UPDATE blogs SET pending_review = false WHERE id = $1 AND pending_review", [dbBlog.id]);
    }
  } catch (error) {
    console.error("Error upserting blog post:", error);
    throw new Error(errorMessage(error));
  }

  // Revalidate frontend caches (both URLs when the slug was changed)
  revalidateBlogPaths([cleanSlug, previousSlug]);

  // Trigger Google Indexing API ping in background
  const absoluteUrl = `https://pikorua.in/blog/${cleanSlug}`;
  triggerGoogleIndexing(absoluteUrl, "URL_UPDATED");

  return { success: true };
}

/**
 * Approves an AI-drafted blog post: publishes it and clears the pending
 * review flag. Manually-authored posts never carry this flag, so calling
 * this on one is a no-op beyond forcing is_active true.
 */
export async function approveBlogDraft(id: string) {
  await requireAuth();

  let data: { slug: string } | null;
  try {
    data = await queryOne<{ slug: string }>(
      "UPDATE blogs SET pending_review = false, is_active = true WHERE id = $1 RETURNING slug",
      [id]
    );
  } catch (error) {
    console.error("Error approving blog draft:", error);
    throw new Error(errorMessage(error));
  }
  if (!data) {
    throw new Error("Blog post not found.");
  }

  revalidateBlogPaths([data.slug]);

  // Fire-and-forget: notify search engines of the new URL immediately.
  // Must never block or throw — any failure is non-fatal.
  if (data?.slug) {
    const postUrl = `${SITE_URL}/blog/${data.slug}`;
    Promise.all([
      submitToIndexNow([postUrl, `${SITE_URL}/blog`]),
      notifyGoogleIndexing([postUrl]),
    ]).catch((err) => console.error("[indexing] blog approval submission error:", err));
  }

  return { success: true };
}

/**
 * State of the automated blog for the admin Blogs tab: whether it publishes
 * directly, whether an admin has paused it, and the latest runs.
 */
export async function getBlogAutomationStatus() {
  await requireAuth();
  try {
    const [pause, runs] = await Promise.all([getAutoBlogPause(), getRecentAutoBlogRuns(6)]);
    return { available: true as const, autopublish: isAutoPublishEnabled(), ...pause, runs };
  } catch (error) {
    console.error("Error reading blog automation status:", error);
    return { available: false as const, error: "Automation tables missing (apply migrations 014 and 015)." };
  }
}

/**
 * Pauses automated posting. `resumeOn` is a YYYY-MM-DD date (posting resumes
 * at 00:00 IST that day), "indefinite" (until resumed), or null to resume now.
 * Errors are returned, not thrown: production builds hide thrown messages.
 */
export async function setBlogAutomationPause(resumeOn: string | null): Promise<{ success: boolean; error?: string }> {
  await requireAuth();

  let until: string | null = null;
  if (resumeOn === "indefinite") {
    until = "infinity";
  } else if (resumeOn !== null) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(resumeOn)) return { success: false, error: "Pick a valid date." };
    until = `${resumeOn}T00:00:00+05:30`;
    if (!(new Date(until).getTime() > Date.now())) return { success: false, error: "The resume date must be in the future." };
  }

  try {
    await setAutoBlogPause(until);
  } catch (error) {
    console.error("Error setting blog automation pause:", error);
    return { success: false, error: "Could not save the pause (is migration 015 applied?)." };
  }
  return { success: true };
}

/**
 * Deletes a blog post from the database.
 */
export async function deleteBlogPost(id: string, slug: string) {
  await requireAuth();

  try {
    await query("DELETE FROM blogs WHERE id = $1", [id]);
  } catch (error) {
    console.error("Error deleting blog post:", error);
    throw new Error(errorMessage(error));
  }

  // Revalidate frontend caches
  revalidateBlogPaths([slug]);

  // Trigger Google Indexing API deletion in background
  const absoluteUrl = `https://pikorua.in/blog/${slug}`;
  triggerGoogleIndexing(absoluteUrl, "URL_DELETED");

  return { success: true };
}

/**
 * Updates About page content singleton in the pages table.
 */
export async function createOrUpdateAboutPage(aboutContent: any) {
  await requireAuth();

  try {
    await upsert("pages", {
      id: "about",
      title: "About Page",
      content: aboutContent,
      updated_at: new Date().toISOString()
    }, { jsonColumns: ["content"] });
  } catch (error) {
    console.error("Error upserting About page:", error);
    throw new Error(errorMessage(error));
  }

  revalidatePath("/about");
  revalidatePath("/");

  return { success: true };
}

/**
 * General helper to get page content (like SEO details) from the pages table.
 */
export async function getPageSeo(id: string) {
  try {
    return await queryOne("SELECT * FROM pages WHERE id = $1", [id]);
  } catch (error) {
    console.error(`Error fetching page SEO for ${id}:`, error);
    return null;
  }
}

/**
 * General helper to fetch all page records for page-level SEO management.
 */
export async function getAllPagesSeo() {
  await requireAuth();
  try {
    return await query("SELECT id, title, content FROM pages");
  } catch (error) {
    console.error("Error fetching all pages SEO:", error);
    throw new Error(errorMessage(error));
  }
}

export async function createOrUpdatePageSeo(id: string, title: string, content: any) {
  await requireAuth();

  // Fetch existing content to prevent overwriting other fields (e.g. on About page)
  const existingPage = await queryOne("SELECT content FROM pages WHERE id = $1", [id]);

  const existingContent = existingPage?.content && typeof existingPage.content === "object" ? existingPage.content : {};
  const mergedContent = {
    ...existingContent,
    ...content,
  };

  try {
    await upsert("pages", {
      id,
      title,
      content: mergedContent,
      updated_at: new Date().toISOString()
    }, { jsonColumns: ["content"] });
  } catch (error) {
    console.error(`Error upserting page SEO for ${id}:`, error);
    throw new Error(errorMessage(error));
  }

  // Revalidate cache
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/properties");
  revalidatePath("/testimonials");
  revalidatePath("/contact");

  return { success: true };
}

export async function createOrUpdateHomePage(homeContent: any) {
  await requireAuth();

  // Load existing page settings (like SEO) to avoid overwriting them
  const existingPage = await queryOne("SELECT content FROM pages WHERE id = 'home'");

  const existingContent = existingPage?.content && typeof existingPage.content === "object" ? existingPage.content : {};
  const mergedContent = {
    ...existingContent,
    ...homeContent,
  };

  try {
    await upsert("pages", {
      id: "home",
      title: "Home Page",
      content: mergedContent,
      updated_at: new Date().toISOString()
    }, { jsonColumns: ["content"] });
  } catch (error) {
    console.error("Error upserting Home page:", error);
    throw new Error(errorMessage(error));
  }

  revalidatePath("/");

  return { success: true };
}

/**
 * Creates or updates a general FAQ in the database.
 */
export async function createOrUpdateGeneralFaq(faq: any) {
  await requireAuth();

  const dbFaq = {
    id: faq.id || undefined, // auto-generate UUID if not present
    question: faq.question,
    answer: faq.answer,
    display_order: faq.display_order !== undefined ? faq.display_order : (faq.displayOrder || 0),
    category: faq.category || "general",
  };

  try {
    await upsert("general_faqs", dbFaq);
  } catch (error) {
    console.error("Error upserting general FAQ:", error);
    throw new Error(errorMessage(error));
  }

  // Revalidate public pages where FAQs are displayed
  revalidatePath("/contact");
  revalidatePath("/properties");

  return { success: true };
}

/**
 * Deletes a general FAQ from the database.
 */
export async function deleteGeneralFaq(id: string) {
  await requireAuth();

  try {
    await query("DELETE FROM general_faqs WHERE id = $1", [id]);
  } catch (error) {
    console.error("Error deleting general FAQ:", error);
    throw new Error(errorMessage(error));
  }

  // Revalidate public pages
  revalidatePath("/contact");
  revalidatePath("/properties");

  return { success: true };
}

/**
 * Call OpenRouter to automatically generate SEO title, description, excerpt, and FAQs.
 */
export async function generateBlogMetadataAction(title: string, contentText: string, htmlContent?: string) {
  try {
    await requireAuth();
  } catch {
    return { success: false, error: "Unauthorized. Please log in again." };
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return { success: false, error: "AI features are not configured (OPENROUTER_API_KEY is not set)" };
  }

  // Use the HTML content if plain text is empty
  const sourceContent = contentText || htmlContent || "";
  if (!title || !sourceContent) {
    return { success: false, error: "Title and content are required to generate metadata." };
  }

  // Strip HTML tags for processing if htmlContent was used
  const cleanText = sourceContent.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const sampleContent = cleanText.substring(0, 8000); // Send first 8k chars to prevent hitting token limits

  const systemPrompt = `You are an expert SEO, GEO, and AEO optimization assistant for PIKORUA Realty, a private luxury real estate advisory in Ahmedabad.
Analyze the provided blog article's title and content. Your analysis and outputs must be STRICTLY focused on real estate, property details, valuations, local corridors, and real estate market dynamics. Filter out and ignore any non-real-estate themes or off-topic generic details.

You MUST adhere to the following best practices for meta tags and content generation:
1. Meta Title:
   - Must be between 50 and 60 characters (max 60 characters).
   - Start with primary keywords from the post (e.g. "Sindhu Bhavan Road Penthouses", "Ahmedabad Real Estate Market").
   - Include the location "Ahmedabad".
   - Conclude with the brand suffix: " | PIKORUA Realty".
2. Meta Description:
   - Must be between 120 and 150 characters (max 150 characters).
   - Provide a clear value/benefit statement summarizing the article's real estate insight.
   - Use high-intent action words (e.g. "Read our analysis", "Explore the corridors", "Get private insights").
   - Must end with a compelling call to action.
3. Excerpt:
   - A concise, high-impact summary in under 155 characters.
4. FAQs (3 to 5 pairs):
   - Questions must match real, searcher-intent queries (e.g. "What is the average price of 4 BHK on Ambli Road?").
   - Answers must be direct, clear, and specify real estate details (pricing figures, built-up areas, specific corridors), using under 2 sentences.

You must respond with ONLY a single, valid JSON object matching the following structure:
{
  "seoTitle": "string",
  "seoDescription": "string",
  "excerpt": "string",
  "faqs": [
    {
      "question": "string",
      "answer": "string"
    }
  ]
}
Do not include any introductory text, explaining paragraphs, or markdown code blocks (e.g. do not wrap the JSON in \`\`\`json). Return only the raw JSON.`;

  const userPrompt = `Title: ${title}
Content snippet:
${sampleContent}`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://pikorua.in", // Optional, for OpenRouter analytics
        "X-Title": "PIKORUA Realty Console",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return { success: false, error: `OpenRouter API error: ${response.status} - ${errText}` };
    }

    const result = await response.json();
    const responseText = result.choices?.[0]?.message?.content;
    if (!responseText) {
      return { success: false, error: "OpenRouter returned an empty response." };
    }

    // Clean markdown code blocks if the model returned them
    let cleanJson = responseText.trim();
    if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }

    const metadata = JSON.parse(cleanJson);
    return { success: true, metadata };
  } catch (error: any) {
    console.error("Error in generateBlogMetadataAction:", error);
    return { success: false, error: error.message || "Failed to generate metadata." };
  }
}

/**
 * Call OpenRouter to automatically generate Property SEO tags.
 */
export async function generatePropertySeoAction(
  title: string,
  configuration: string,
  locationLabel: string,
  description: string,
  highlightsText: string
) {
  try {
    await requireAuth();
  } catch {
    return { success: false, error: "Unauthorized. Please log in again." };
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return { success: false, error: "AI features are not configured (OPENROUTER_API_KEY is not set)" };
  }

  if (!title || !configuration || !locationLabel) {
    return { success: false, error: "Title, configuration, and location are required." };
  }

  const systemPrompt = `You are an expert SEO, GEO, and AEO optimization assistant for PIKORUA Realty, a private luxury real estate advisory in Ahmedabad.
Analyze the luxury residential property details provided. Your output must strictly focus on luxury real estate.

You MUST adhere to the following best practices for meta tags:
1. Meta Title:
   - Must be between 50 and 60 characters (max 60 characters).
   - Start with configuration and location (e.g. "4 BHK Penthouse in Sindhu Bhavan Road", "5 BHK Duplex Villa in Ambli").
   - Include the location "Ahmedabad".
   - Conclude with the brand suffix: " | PIKORUA Realty".
2. Meta Description:
   - Must be between 120 and 150 characters (max 150 characters).
   - Summarize the property's key facts (built-up area, specifications, price on request).
   - End with a clear action-oriented call to action (e.g. "Request a private walkthrough.", "Schedule a private consultation.").

Do not include any introductory text, explaining paragraphs, or markdown code blocks (e.g. do not wrap the JSON in \`\`\`json).
Return ONLY a single, valid JSON object matching the following structure:
{
  "seoTitle": "string",
  "seoDescription": "string"
}`;

  const userPrompt = `Property Details:
Title: ${title}
Type/Configuration: ${configuration}
Location: ${locationLabel}
Description: ${description ? description.substring(0, 1000) : ""}
Highlights: ${highlightsText ? highlightsText.substring(0, 1000) : ""}`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://pikorua.in",
        "X-Title": "PIKORUA Realty Console",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return { success: false, error: `OpenRouter API error: ${response.status} - ${errText}` };
    }

    const result = await response.json();
    const responseText = result.choices?.[0]?.message?.content;
    if (!responseText) {
      return { success: false, error: "OpenRouter returned an empty response." };
    }

    let cleanJson = responseText.trim();
    if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }

    const metadata = JSON.parse(cleanJson);
    return { success: true, metadata };
  } catch (error: any) {
    console.error("Error in generatePropertySeoAction:", error);
    return { success: false, error: error.message || "Failed to generate metadata." };
  }
}

/**
 * Call OpenRouter to automatically generate Page SEO tags for main site pages.
 */
export async function generatePageSeoAction(pageId: string, pageContext?: string) {
  try {
    await requireAuth();
  } catch {
    return { success: false, error: "Unauthorized. Please log in again." };
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return { success: false, error: "AI features are not configured (OPENROUTER_API_KEY is not set)" };
  }

  const pageNames: Record<string, string> = {
    home: "Home Page (Curated luxury real estate overview of Ahmedabad's Western Corridors)",
    properties: "Properties List Page (A showcase/collection of 4 BHK and 5 BHK apartments, penthouses, duplexes, villas, plots for sale)",
    about: "About Page (PIKORUA Realty's founding story by Jitendra, principles of discretion, locations we serve)",
    testimonials: "Testimonials Page (Verified reviews and experiences from elite luxury home buyers and NRI clients in Ahmedabad)",
    contact: "Contact Page (Private consultation request form, Power of Attorney for NRIs, custom property briefs)",
  };

  const pageTitle = pageNames[pageId] || `${pageId} page`;

  const systemPrompt = `You are an expert SEO, GEO, and AEO optimization assistant for PIKORUA Realty, a private luxury real estate advisory in Ahmedabad.
Analyze the target page context. Your output must strictly focus on luxury real estate.

You MUST adhere to the following best practices for meta tags:
1. Meta Title:
   - Must be between 50 and 60 characters (max 60 characters).
   - Incorporate key terms relevant to the page's focus (e.g. "Curated Luxury Properties", "Private Real Estate Consultation", "Luxury Real Estate Advisory").
   - Include the location "Ahmedabad".
   - Conclude with the brand suffix: " | PIKORUA Realty".
2. Meta Description:
   - Must be between 120 and 150 characters (max 150 characters).
   - Entice premium buyers, sellers, or investors by describing the private advisory model or listing curation.
   - End with a clear action-oriented call to action (e.g. "Begin a private conversation.", "Browse our curated portfolio.").

Do not include any introductory text, explaining paragraphs, or markdown code blocks (e.g. do not wrap the JSON in \`\`\`json).
Return ONLY a single, valid JSON object matching the following structure:
{
  "seoTitle": "string",
  "seoDescription": "string"
}`;

  const userPrompt = `Page ID: ${pageId}
Page Purpose: ${pageTitle}
Optional Context: ${pageContext || ""}`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://pikorua.in",
        "X-Title": "PIKORUA Realty Console",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return { success: false, error: `OpenRouter API error: ${response.status} - ${errText}` };
    }

    const result = await response.json();
    const responseText = result.choices?.[0]?.message?.content;
    if (!responseText) {
      return { success: false, error: "OpenRouter returned an empty response." };
    }

    let cleanJson = responseText.trim();
    if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }

    const metadata = JSON.parse(cleanJson);
    return { success: true, metadata };
  } catch (error: any) {
    console.error("Error in generatePageSeoAction:", error);
    return { success: false, error: error.message || "Failed to generate metadata." };
  }
}

/**
 * Fetches the latest luxury real estate news from Google News RSS feed.
 * Core logic lives in src/lib/ai/blogAutomation.ts so the unattended cron
 * job (which has no admin session) can call it too.
 */
export async function fetchRealEstateNewsAction() {
  try {
    await requireAuth();
  } catch {
    return { success: false as const, error: "Unauthorized. Please log in again." };
  }
  return fetchRealEstateNews();
}

/**
 * Automatically drafts a complete luxury real estate blog post based on a news headline or link.
 * Core logic lives in src/lib/ai/blogAutomation.ts (see fetchRealEstateNewsAction above).
 */
export async function generateBlogFromNewsAction(title: string, url?: string, customText?: string) {
  try {
    await requireAuth();
  } catch {
    return { success: false as const, error: "Unauthorized. Please log in again." };
  }
  return generateBlogDraftFromNews(title, url, customText);
}

/**
 * Call OpenRouter (multimodal Gemini 2.5 Flash) to analyze the property image and generate an SEO-optimized Alt text.
 */
export async function generateImageAltAction(
  imageUrl: string,
  propertyName?: string,
  propertyLocation?: string,
  propertyConfig?: string
) {
  try {
    await requireAuth();
  } catch {
    return { success: false, error: "Unauthorized. Please log in again." };
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return { success: false, error: "AI features are not configured (OPENROUTER_API_KEY is not set)" };
  }

  if (!imageUrl) {
    return { success: false, error: "Image URL is required." };
  }

  const systemPrompt = `You are an expert SEO, GEO, and image optimization assistant for PIKORUA Realty, a private luxury real estate advisory in Ahmedabad.
Analyze the provided property photograph. Write a highly descriptive, search-engine-optimized image ALT text tag (maximum 120 characters) that describes the scene and includes relevant real estate keywords.

Strict Rules:
1. Ground details: Use details from the property info if provided (Project name: "${propertyName || "Luxury Residence"}", Location: "${propertyLocation || "Ahmedabad"}", Type: "${propertyConfig || "Residential"}").
2. Focus: Focus on structural layout, materials, luxury fittings, views, and room type (e.g. "double-height living room", "Italian marble flooring", "curated balcony deck", "glass facade").
3. Suffix: Conclude with "| PIKORUA Realty" if character limit allows, but prioritize description.
4. Output: Return ONLY the raw plain text description, no JSON, no quotes, no introductory text, no markdown. Limit to 120 characters.`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://pikorua.in",
        "X-Title": "PIKORUA Realty Console",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Describe this luxury real estate property image for SEO Alt text."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        temperature: 0.3,
        max_tokens: 100
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return { success: false, error: `OpenRouter API error: ${response.status} - ${errText}` };
    }

    const result = await response.json();
    const altText = result.choices?.[0]?.message?.content?.trim();
    if (!altText) {
      return { success: false, error: "OpenRouter returned an empty response." };
    }

    // Strip quotation marks if AI returned them
    const cleanAlt = altText.replace(/^["']|["']$/g, "").trim();
    return { success: true, altText: cleanAlt };
  } catch (error: any) {
    console.error("Error in generateImageAltAction:", error);
    return { success: false, error: error.message || "Failed to generate image alt." };
  }
}

/**
 * Call OpenRouter (Gemini 2.5 Flash) to generate a personalized luxury WhatsApp follow-up greeting.
 */
export async function generateLeadReplyAction(
  leadName: string,
  category?: string,
  location?: string,
  budget?: string,
  message?: string
) {
  try {
    await requireAuth();
  } catch {
    return { success: false, error: "Unauthorized. Please log in again." };
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return { success: false, error: "OPENROUTER_API_KEY is not configured." };
  }

  const systemPrompt = `You are Jitendra, founder of PIKORUA Realty, an elite private real estate advisory in Ahmedabad.
Write a highly natural, short WhatsApp follow-up message to reply to a new lead.

Pattern to follow:
"Hi [Client Name], saw your inquiry about [specific preference]. Are you free for a quick 2-minute call today? - Jitendra, PIKORUA Realty"

Strict Guidelines:
1. Target Name: Replace "[Client Name]" with the actual lead's name: "${leadName}". It must be dynamically populated (e.g. "Hi Amit,").
2. Contextual Preference: Replace "[specific preference]" with a concise description based on the client's details: Category: "${category || ""}", Location: "${location || ""}", Budget: "${budget || ""}", Custom message: "${message || ""}".
   - E.g. If category is "penthouse", write "a custom penthouse".
   - E.g. If location is "Ambli" and budget is "5 Cr", write "a property in Ambli within a 5 Cr budget".
   - E.g. If they filled a general enquiry, write "our private property advisory in Ahmedabad".
   - Keep it short, natural, and concise.
3. Call to Action: Always ask: "Are you free for a quick 2-minute call today?"
4. Suffix: Conclude exactly with: " - Jitendra, PIKORUA Realty"
5. Formatting: Do not use quotes, JSON, or markdown. Return ONLY the raw plain text of the WhatsApp message. Keep the message under 180 characters.`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://pikorua.in",
        "X-Title": "PIKORUA Realty Console",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }],
        temperature: 0.5,
        max_tokens: 150
      })
    });

    if (!response.ok) {
      return { success: false, error: `API error: ${response.status}` };
    }

    const result = await response.json();
    const replyText = result.choices?.[0]?.message?.content?.trim();
    if (!replyText) {
      return { success: false, error: "Empty response from AI." };
    }

    // Clean quotes if any
    const cleanReply = replyText.replace(/^["']|["']$/g, "").trim();
    return { success: true, replyText: cleanReply };
  } catch (error: any) {
    console.error("Error in generateLeadReplyAction:", error);
    return { success: false, error: error.message || "Failed to generate lead reply." };
  }
}

/**
 * Signs a JWT using Node's native crypto module and exchanges it for a Google OAuth access token.
 */
async function getGoogleAuthToken(serviceAccountJson: string): Promise<string> {
  const account = JSON.parse(serviceAccountJson);
  const rawKey = account.private_key || "";
  const privateKey = rawKey.replace(/\\n/g, "\n");
  const clientEmail = account.client_email;

  const header = {
    alg: "RS256",
    typ: "JWT"
  };

  const now = Math.floor(Date.now() / 1000);
  const claimSet = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/indexing",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now
  };

  const base64UrlEncode = (str: string) => {
    return Buffer.from(str)
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedClaimSet = base64UrlEncode(JSON.stringify(claimSet));
  const signatureInput = `${encodedHeader}.${encodedClaimSet}`;

  // Sign using RS256
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(signatureInput);
  const signature = sign.sign(privateKey, "base64");
  const encodedSignature = signature
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const jwt = `${signatureInput}.${encodedSignature}`;

  // Exchange JWT for access token
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to exchange JWT for token: ${text}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Fires background requests to notify Google Indexing API when properties/blogs change.
 */
async function triggerGoogleIndexing(url: string, type: "URL_UPDATED" | "URL_DELETED") {
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    console.log("Google Indexing API is not configured (missing GOOGLE_SERVICE_ACCOUNT_JSON). Skipping ping for URL:", url);
    return;
  }

  try {
    const accessToken = await getGoogleAuthToken(serviceAccountJson);
    const response = await fetch("https://indexing.googleapis.com/v3/urlNotifications:publish", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url: url,
        type: type
      })
    });

    if (response.ok) {
      console.log(`Successfully pinged Google Indexing API (${type}) for URL: ${url}`);
    } else {
      const errText = await response.text();
      console.warn(`Google Indexing API returned error: ${response.status} - ${errText} for URL: ${url}`);
    }
  } catch (error) {
    console.error("Failed to run Google Indexing API background ping:", error);
  }
}

/**
 * Test or manually trigger a Google Indexing API submission.
 */
export async function submitToGoogleIndexingAction(url: string, type: "URL_UPDATED" | "URL_DELETED") {
  try {
    await requireAuth();
  } catch {
    return { success: false, error: "Unauthorized." };
  }

  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    return {
      success: false,
      error: "GOOGLE_SERVICE_ACCOUNT_JSON is not configured in environment variables.",
      instructions: [
        "1. Create a project in Google Cloud Console.",
        "2. Enable the Web Search Indexing API.",
        "3. Create a Service Account and download the JSON key file.",
        "4. In Google Search Console, add the Service Account email as an Owner of the property https://pikorua.in",
        "5. Paste the entire JSON file contents as the GOOGLE_SERVICE_ACCOUNT_JSON environment variable."
      ]
    };
  }

  try {
    const accessToken = await getGoogleAuthToken(serviceAccountJson);
    const response = await fetch("https://indexing.googleapis.com/v3/urlNotifications:publish", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url: url,
        type: type
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return { success: false, error: `Google Indexing API error: ${response.status} - ${errText}` };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error in submitToGoogleIndexingAction:", error);
    return { success: false, error: error.message || "Failed to submit to Google Indexing." };
  }
}




