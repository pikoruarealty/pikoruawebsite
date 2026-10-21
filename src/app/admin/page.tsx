import { checkSession, getAllPagesSeo } from "./actions";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import {
  getSupabaseProperties,
  getSupabaseAllTestimonials,
  getSupabaseBlogs,
  getSupabaseAboutPageContent,
  getSupabaseHomePageContent,
  getSupabaseGeneralFaqs,
} from "@/lib/db/queries";
import { STATIC_PROPERTIES, type StaticProperty } from "@/lib/data/properties";
import { STATIC_BLOG_POSTS } from "@/lib/data/blog";
import type { Testimonial } from "@/types";
import type { BlogPost } from "@/types/blog";


export const metadata = {
  title: "Console — PIKORUA Realty",
  robots: { index: false, follow: false },
};

// Force dynamic rendering so cookie checks happen on every request
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const isAuthed = await checkSession();

  if (!isAuthed) {
    return <AdminLogin />;
  }

  // Fetch initial content data from the database for the dashboard
  let properties: StaticProperty[] = [];
  let testimonials: Testimonial[] = [];
  let blogs: BlogPost[] = [];
  let aboutContent: any = null;
  let homeContent: any = null;
  let pagesSeo: any[] = [];
  let generalFaqs: any[] = [];

  try {
    properties = await getSupabaseProperties();
    // Fall back to static properties if database has none
    if (properties.length === 0) {
      properties = STATIC_PROPERTIES;
    }
  } catch (err) {
    console.error("Error fetching properties for admin page:", err);
    properties = STATIC_PROPERTIES;
  }

  try {
    testimonials = await getSupabaseAllTestimonials();
  } catch (err) {
    console.error("Error fetching testimonials for admin page:", err);
  }

  try {
    blogs = await getSupabaseBlogs();
    if (blogs.length === 0) {
      blogs = STATIC_BLOG_POSTS;
    }
  } catch (err) {
    console.error("Error fetching blogs for admin page:", err);
    blogs = STATIC_BLOG_POSTS;
  }

  try {
    aboutContent = await getSupabaseAboutPageContent();
  } catch (err) {
    console.error("Error fetching about page content for admin page:", err);
  }

  try {
    homeContent = await getSupabaseHomePageContent();
  } catch (err) {
    console.error("Error fetching home page content for admin page:", err);
  }

  try {
    pagesSeo = await getAllPagesSeo();
  } catch (err) {
    console.error("Error fetching pages SEO for admin page:", err);
  }

  try {
    generalFaqs = await getSupabaseGeneralFaqs();
  } catch (err) {
    console.error("Error fetching general FAQs for admin page:", err);
  }

  return (
    <AdminDashboard
      initialProperties={properties}
      initialTestimonials={testimonials}
      initialBlogs={blogs}
      initialAboutContent={aboutContent}
      initialHomeContent={homeContent}
      initialPagesSeo={pagesSeo}
      initialGeneralFaqs={generalFaqs}
    />
  );
}

