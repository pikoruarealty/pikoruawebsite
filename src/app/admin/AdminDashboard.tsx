"use client";

import { useState, useEffect, useRef } from "react";
import {
  logoutAction,
  getLeads,
  updateLeadStatus,
  createOrUpdateProperty,
  deleteProperty,
  updatePropertyImageAlts,
  createOrUpdateTestimonial,
  deleteTestimonial,
  uploadImageAction,
  createOrUpdateBlogPost,
  deleteBlogPost,
  approveBlogDraft,
  createOrUpdateAboutPage,
  createOrUpdatePageSeo,
  createOrUpdateHomePage,
  createOrUpdateGeneralFaq,
  deleteGeneralFaq,
  generateBlogMetadataAction,
  generatePropertySeoAction,
  generatePageSeoAction,
  fetchRealEstateNewsAction,
  generateBlogFromNewsAction,
  generateImageAltAction,
  generateLeadReplyAction,
  submitToGoogleIndexingAction,
  getBlogAutomationStatus,
  setBlogAutomationPause,
} from "./actions";
import { STATIC_PROPERTIES, type StaticProperty } from "@/lib/data/properties";
import {
  Loader2,
  LogOut,
  Users,
  Building,
  Quote,
  Plus,
  Edit,
  Trash2,
  X,
  Flame,
  Upload,
  Eye,
  ExternalLink,
  BookOpen,
  FileText,
  Download,
  Globe,
  Home,
  HelpCircle,
  Sparkles,
  CheckCircle,
  CirclePause,
} from "lucide-react";
import type { Lead, Testimonial, GeneralFaq } from "@/types";
import type { BlogPost } from "@/types/blog";
import Image from "next/image";

/** The date `days` from now in India, as YYYY-MM-DD. */
const istDateFromNow = (days: number) =>
  new Date(Date.now() + days * 86_400_000).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

const generateDiscreetSlug = (config: string, size: string, loc: string): string => {
  const clean = (str: string) => {
    return (str || "")
      .toLowerCase()
      .replace(/&/g, "-")
      .replace(/[\u2013\u2014-]/g, "-") // en-dash, em-dash, hyphen
      .replace(/[·\.,\/]/g, "-")
      .replace(/[^a-z0-9\s-]/g, "") // remove punctuation
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/(^-|-$)/g, "");
  };
  const c = clean(config);
  const s = clean(size);
  const l = clean(loc);
  return [c, s, l].filter(Boolean).join("-").replace(/-+/g, "-");
};

const generateAutoExcerpt = (contentStr: string): string => {
  if (!contentStr) return "";
  const clean = contentStr
    .replace(/###\s+/g, "") // Remove headings
    .replace(/\*\*/g, "")   // Remove bold
    .replace(/\*/g, "")     // Remove italic
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1") // Extract link labels
    .replace(/\s+/g, " ")
    .trim();

  if (clean.length <= 155) return clean;
  const sub = clean.slice(0, 155);
  const lastSpace = sub.lastIndexOf(" ");
  if (lastSpace > 100) {
    return sub.slice(0, lastSpace) + "...";
  }
  return sub + "...";
};

interface HtmlContentEditorProps {
  value: string;
  onChange: (value: string) => void;
}

function HtmlContentEditor({ value, onChange }: HtmlContentEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const lastValueRef = useRef(value);

  // Sync state to DOM on mount and when it changes from outside
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value;
      lastValueRef.current = value;
    }
  }, [value]);

  const handleInput = () => {
    if (ref.current) {
      const html = ref.current.innerHTML;
      lastValueRef.current = html;
      onChange(html);
    }
  };

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      className="prose-blog w-full min-h-[200px] max-h-[500px] overflow-y-auto bg-lux-black border border-champagne-gold/20 hover:border-champagne-gold/40 focus:border-champagne-gold focus:outline-none rounded-sm px-4 py-3 text-xs cursor-text transition-colors"
    />
  );
}

interface AdminDashboardProps {
  initialProperties: StaticProperty[];
  initialTestimonials: Testimonial[];
  initialBlogs: BlogPost[];
  initialAboutContent: any;
  initialHomeContent?: any;
  initialPagesSeo: any[];
  initialGeneralFaqs: GeneralFaq[];
}

export default function AdminDashboard({
  initialProperties,
  initialTestimonials,
  initialBlogs,
  initialAboutContent,
  initialHomeContent,
  initialPagesSeo,
  initialGeneralFaqs,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"leads" | "properties" | "testimonials" | "blogs" | "home" | "about" | "seo" | "faqs">("leads");

  // General FAQs state
  const [generalFaqs, setGeneralFaqs] = useState<GeneralFaq[]>(initialGeneralFaqs || []);
  const [editingGeneralFaq, setEditingGeneralFaq] = useState<any | null>(null);
  const [isGeneralFaqModalOpen, setIsGeneralFaqModalOpen] = useState(false);

  // Leads state
  const [leads, setLeads] = useState<any[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [waReplyLead, setWaReplyLead] = useState<any | null>(null);
  const [waReplyMessage, setWaReplyMessage] = useState<string>("");
  const [loadingWaReply, setLoadingWaReply] = useState<boolean>(false);

  // Properties state
  const [properties, setProperties] = useState<StaticProperty[]>(initialProperties);
  const [editingProperty, setEditingProperty] = useState<any | null>(null);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<"cover" | number | null>(null);

  // Testimonials state
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials);
  const [editingTestimonial, setEditingTestimonial] = useState<any | null>(null);
  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);

  // Blogs state
  const [blogs, setBlogs] = useState<BlogPost[]>(initialBlogs);
  const [editingBlog, setEditingBlog] = useState<any | null>(null);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [uploadingBlogImage, setUploadingBlogImage] = useState<boolean>(false);
  const [uploadingAuthorAvatar, setUploadingAuthorAvatar] = useState<boolean>(false);
  const [docxUploading, setDocxUploading] = useState<boolean>(false);
  const [generatingAiMetadata, setGeneratingAiMetadata] = useState<boolean>(false);
  const [generatingPropertySeo, setGeneratingPropertySeo] = useState<boolean>(false);
  const [generatingPageSeo, setGeneratingPageSeo] = useState<Record<string, boolean>>({});

  // News Drafter state
  const [isNewsDrafterOpen, setIsNewsDrafterOpen] = useState<boolean>(false);
  const [newsFeed, setNewsFeed] = useState<Array<{ title: string; link: string; pubDate: string; source: string }>>([]);
  const [fetchingNews, setFetchingNews] = useState<boolean>(false);
  const [generatingBlogFromNews, setGeneratingBlogFromNews] = useState<boolean>(false);
  const [customNewsTitle, setCustomNewsTitle] = useState<string>("");
  const [customNewsUrl, setCustomNewsUrl] = useState<string>("");
  const [customNewsText, setCustomNewsText] = useState<string>("");
  const [activeNewsTab, setActiveNewsTab] = useState<"feed" | "custom">("feed");

  // Image tagging states
  const [generatingImageAlts, setGeneratingImageAlts] = useState<Record<string, boolean>>({});
  const [generatingAllImageAlts, setGeneratingAllImageAlts] = useState<boolean>(false);
  const [bulkAltProgress, setBulkAltProgress] = useState<{ current: number; total: number; active: boolean; propertyName: string }>({
    current: 0,
    total: 0,
    active: false,
    propertyName: "",
  });

  const [generatingLeadReply, setGeneratingLeadReply] = useState<Record<string, boolean>>({});

  // Google Indexing states
  const [testIndexingUrl, setTestIndexingUrl] = useState<string>("https://pikorua.in");
  const [testingIndexing, setTestingIndexing] = useState<boolean>(false);
  const [indexingTestResult, setIndexingTestResult] = useState<any | null>(null);

  // About Page state
  const defaultAboutContent = {
    heroTitle: "Built on Relationships.\nDefined by Discretion.",
    heroDescription: "A private real estate advisory in Ahmedabad, founded on confidential representation and deep location intelligence.",
    founderQuote: "I started PIKORUA because the finest homes in Ahmedabad deserved a quieter way to be found — and sold.",
    founderName: "Jitendra",
    founderRole: "PIKORUA Realty",
    founderAvatar: "/images/founder.jpg",
    founderStory: [
      "PIKORUA Realty was founded with a singular vision: to bring a professional, confidential, and highly curated advisory service to Ahmedabad's luxury real estate landscape.",
      "Observing the transaction friction and lack of privacy on public search platforms, we set out to build an off-market agency where transactions are handled with complete discretion and absolute client-first dedication."
    ],
    principles: [
      { label: "Discretion", body: "Your search, your sale, your investment — handled with complete confidentiality. No exposure without your consent." },
      { label: "Curation", body: "We bring you a shortlist that matters. Not a hundred options — four that are right for you specifically." },
      { label: "Presence", body: "From first conversation to handover, we remain involved. Not a platform. An advisor." }
    ]
  };

  const getStoryString = (story: any) => {
    if (!story) return "";
    if (Array.isArray(story)) return story.join("\n\n");
    return String(story);
  };

  const [aboutContent, setAboutContent] = useState<any>(() => {
    const raw = initialAboutContent || defaultAboutContent;
    return {
      ...defaultAboutContent,
      ...raw,
      founderStory: getStoryString(raw.founderStory)
    };
  });
  const [uploadingAboutAvatar, setUploadingAboutAvatar] = useState<boolean>(false);
  const [uploadingHeroVideo, setUploadingHeroVideo] = useState<boolean>(false);
  const [uploadingHeroPoster, setUploadingHeroPoster] = useState<boolean>(false);

  // Home Page Content state
  const defaultHomeContent = {
    heroHeadline1: "Trust what",
    heroHeadline2: "most luxury buyers",
    heroHeadline3: "have trusted.",
    heroSubhead: "A private advisory for those who seek address over algorithm — buying, selling, or investing in Ahmedabad.",
    positioningStatement: "PIKORUA is a private gateway to Ahmedabad's finest residences — for those who seek address over algorithm.",
    heroVideoUrl: "",
    heroPosterUrl: "",
    stats: [
      { value: "11+", label: "Years of Trust" },
      { value: "90+", label: "Select Properties Curated" },
      { value: "8+", label: "Presence in Cities" },
      { value: "1500+", label: "Happy Clients" },
    ],
    virtualTours: [
      { id: "G17NU0mliT4", title: "Off Thaltej - Shilaj Road", subtitle: "Smart Sized Luxury 4 BHK Apartments" },
      { id: "mAJ7w6keKSM", title: "Vaishno Devi Circle", subtitle: "Luxury 4 & 5 BHK Community" },
      { id: "aWqhcmZqBdc", title: "Off Sindhu Bhavan Road", subtitle: "Smart Sized Luxury 4 & 5 BHK Apartments" },
      { id: "i0k7ewRHgZk", title: "Off Sindhu Bhavan Road", subtitle: "Ultra Luxury 4 & 5 BHK Residences" },
      { id: "aWjAEc_rAJU", title: "Thaltej Shilaj Road", subtitle: "Luxury 4 BHK Apartments" },
      { id: "GwQq098ICLY", title: "Iskon - Ambli Road", subtitle: "Iconic 4 BHK & Penthouse" },
      { id: "RVkRTQj4rw0", title: "Iskon - Ambli Road", subtitle: "Smart Sized Luxury 4 BHK Residences" },
      { id: "Fbd5LFA6m3I", title: "Ambli - Bopal Road", subtitle: "Ultra Luxury Bungalow Collection" },
      { id: "Mt3tY4SNJ_M", title: "Science City Road", subtitle: "Iconic 4 & 5 BHK with Panoramic Views" },
      { id: "b2ZzzwdSbmQ", title: "Sindhu Bhavan Road", subtitle: "Large & Luxury 4 & 5 BHK Apartments" },
    ],
    partners: [
      { name: "Adani Realty", src: "/partners/adani.png", width: 700, height: 140 },
      { name: "A. Shridhar", src: "/partners/ashridhar.png", width: 600, height: 137 },
      { name: "The Capstone Developers", src: "/partners/capstone.png", width: 300, height: 107 },
      { name: "Constera Realty", src: "/partners/constera.png", width: 222, height: 50 },
      { name: "Gala Group", src: "/partners/gala.png", width: 100, height: 133 },
      { name: "Godrej Properties", src: "/partners/godrej.png", width: 1783, height: 854 },
      { name: "Goyal & Co.", src: "/partners/goyal.png", width: 139, height: 68 },
      { name: "HN Safal", src: "/partners/hnsafal-dark.png", width: 300, height: 165 },
      { name: "Maruti Group", src: "/partners/maruti-dark.png", width: 200, height: 52 },
      { name: "Ravi Desai Group", src: "/partners/ravidesai.png", width: 2640, height: 733 },
      { name: "Satyamev Group", src: "/partners/satyamev.png", width: 500, height: 129 },
      { name: "Shaligram Group", src: "/partners/shaligram.png", width: 600, height: 301 },
      { name: "Sun Builders", src: "/partners/sun.png", width: 1200, height: 1314 },
      { name: "Swati Procon", src: "/partners/swati.png", width: 1080, height: 142 },
      { name: "Triveni Group", src: "/partners/triveni.png", width: 250, height: 139 },
      { name: "Venus Infrastructure", src: "/partners/venus.png", width: 1418, height: 303 },
    ],
  };

  const [homeContent, setHomeContent] = useState<any>(() => {
    const raw = initialHomeContent || {};
    return {
      ...defaultHomeContent,
      ...raw,
      stats: raw.stats || defaultHomeContent.stats,
      virtualTours: raw.virtualTours || defaultHomeContent.virtualTours,
      partners: raw.partners || defaultHomeContent.partners,
    };
  });

  const handleSaveHomeContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await createOrUpdateHomePage(homeContent);
      alert("Home Page content updated successfully!");
    } catch (err: any) {
      alert("Error saving Home Page content: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Page SEO Settings state
  const [seoState, setSeoState] = useState<Record<string, { title: string; seoTitle: string; seoDescription: string }>>(() => {
    const defaultSeo: Record<string, { title: string; seoTitle: string; seoDescription: string }> = {
      home: { title: "Home Page", seoTitle: "", seoDescription: "" },
      properties: { title: "Properties List Page", seoTitle: "", seoDescription: "" },
      about: { title: "About Page", seoTitle: "", seoDescription: "" },
      testimonials: { title: "Testimonials Page", seoTitle: "", seoDescription: "" },
      contact: { title: "Contact Page", seoTitle: "", seoDescription: "" },
    };

    if (initialPagesSeo) {
      initialPagesSeo.forEach((item) => {
        if (defaultSeo[item.id]) {
          defaultSeo[item.id] = {
            title: item.title,
            seoTitle: item.content?.seoTitle || "",
            seoDescription: item.content?.seoDescription || "",
          };
        }
      });
    }

    return defaultSeo;
  });

  const handleSavePageSeo = async (id: string, e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const pageSeo = seoState[id];
      await createOrUpdatePageSeo(id, pageSeo.title, {
        seoTitle: pageSeo.seoTitle,
        seoDescription: pageSeo.seoDescription,
      });
      alert(`${pageSeo.title} SEO settings updated successfully!`);
    } catch (err: any) {
      alert("Error saving page SEO: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // General loading & actions
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch leads on mount / tab change
  const fetchLeadsData = async () => {
    setLoadingLeads(true);
    try {
      const data = await getLeads();
      setLeads(data);
    } catch (err) {
      console.error("Failed to load leads:", err);
    } finally {
      setLoadingLeads(false);
    }
  };

  useEffect(() => {
    if (activeTab === "leads") {
      fetchLeadsData();
    }
  }, [activeTab]);

  // Automated blog: publish mode, admin pause and latest runs (Blogs tab)
  const [automation, setAutomation] = useState<Awaited<ReturnType<typeof getBlogAutomationStatus>> | null>(null);
  const [pauseResumeOn, setPauseResumeOn] = useState("");
  const [minResumeOn] = useState(() => istDateFromNow(1));

  useEffect(() => {
    if (activeTab !== "blogs") return;
    let cancelled = false;
    getBlogAutomationStatus()
      .then((status) => !cancelled && setAutomation(status))
      .catch((err) => console.error("Failed to load blog automation status:", err));
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  const handleSetAutomationPause = async (resumeOn: string | null) => {
    setActionLoading(true);
    try {
      const result = await setBlogAutomationPause(resumeOn);
      if (!result.success) {
        alert(result.error);
        return;
      }
      setPauseResumeOn("");
      setAutomation(await getBlogAutomationStatus());
    } catch (err: unknown) {
      alert("Error updating automated posting: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = async () => {
    if (confirm("Are you sure you want to log out of the console?")) {
      await logoutAction();
      window.location.reload();
    }
  };

  const handleExportCSV = () => {
    if (!leads || leads.length === 0) {
      alert("No lead submissions available to export.");
      return;
    }

    const headers = [
      "Date Submitted",
      "Name",
      "Phone",
      "WhatsApp",
      "Email",
      "Source",
      "Status",
      "Hot Lead",
      "Budget",
      "Location Preference",
      "Category",
      "Purpose",
      "Timeline",
      "Callback Time",
      "Property Reference",
      "Message",
      "UTM Source",
      "UTM Medium",
      "UTM Campaign",
      "Consultation Date",
      "Consultation Time",
      "Consultation Purpose",
      "Consultation Notes",
      "Property Enquiry Ref",
      "Property Enquiry Msg"
    ];

    const rows = leads.map((lead) => {
      const booking = lead.consultation_bookings?.[0] || {};
      const enquiry = lead.property_enquiries?.[0] || {};
      const utm = typeof lead.utm === "object" && lead.utm !== null ? lead.utm : {};

      return [
        lead.created_at ? new Date(lead.created_at).toLocaleString("en-IN") : "",
        lead.name || "",
        lead.phone || "",
        lead.whatsapp || "",
        lead.email || "",
        lead.source || "",
        lead.status || "",
        lead.is_hot ? "YES" : "NO",
        lead.budget_band || "",
        lead.location || "",
        lead.category || "",
        lead.purpose || "",
        lead.timeline || "",
        lead.preferred_callback_time || "",
        lead.property_ref || "",
        lead.message || "",
        utm.source || utm.utm_source || "",
        utm.medium || utm.utm_medium || "",
        utm.campaign || utm.utm_campaign || "",
        booking.preferred_date || "",
        booking.preferred_time || "",
        booking.purpose || "",
        booking.notes || "",
        enquiry.property_ref || "",
        enquiry.message || ""
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((val) => {
            const stringVal = String(val);
            // Escape double quotes and wrap values in quotes if they contain quotes, commas, or newlines
            const escaped = stringVal.replace(/"/g, '""');
            if (escaped.includes(",") || escaped.includes("\n") || escaped.includes('"')) {
              return `"${escaped}"`;
            }
            return escaped;
          })
          .join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `pikorua_leads_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Lead Actions
  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      await updateLeadStatus(leadId, newStatus);
      // update state locally
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
      );
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  // Property Actions
  const handleOpenAddProperty = () => {
    setEditingProperty({
      id: "prop-" + Math.random().toString(36).substring(2, 9),
      slug: "",
      name: "",
      category: "apartment",
      location: "iskon-ambli",
      locationLabel: "Iskon-Ambli Road",
      configuration: "",
      sizeRange: "",
      status: "ready-to-move",
      coverImage: "",
      images: [],
      isFeatured: false,
      price: "",
      priceOnRequest: true,
      description: "", // handled as single text string, parsed on save
      highlights: "",  // handled as single text string, parsed on save
      builtUpArea: "",
      plotArea: "",
      floor: "",
      suitableFor: "",
      seoTitle: "",
      seoDescription: "",
      isActive: true,
    });
    setIsPropertyModalOpen(true);
  };

  const handleOpenEditProperty = (prop: StaticProperty) => {
    setEditingProperty({
      ...prop,
      description: prop.description ? prop.description.join("\n") : "",
      highlights: prop.highlights ? prop.highlights.join("\n") : "",
      seoTitle: prop.seoTitle || "",
      seoDescription: prop.seoDescription || "",
      isActive: prop.isActive !== undefined ? prop.isActive : true,
    });
    setIsPropertyModalOpen(true);
  };

  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProperty.name || !editingProperty.slug) {
      alert("Name and Slug are required.");
      return;
    }

    setActionLoading(true);
    try {
      // Parse multi-line strings back to arrays
      const descArray = editingProperty.description
        ? editingProperty.description.split("\n").filter((l: string) => l.trim() !== "")
        : [];
      const highlightsArray = editingProperty.highlights
        ? editingProperty.highlights.split("\n").filter((l: string) => l.trim() !== "")
        : [];

      const payload = {
        ...editingProperty,
        description: descArray,
        highlights: highlightsArray,
      };

      await createOrUpdateProperty(payload);

      // Reload properties dynamically
      setProperties((prev) => {
        const exists = prev.some((p) => p.id === payload.id);
        if (exists) {
          return prev.map((p) => (p.id === payload.id ? payload : p));
        } else {
          return [payload, ...prev];
        }
      });

      setIsPropertyModalOpen(false);
      setEditingProperty(null);
    } catch (err: any) {
      alert("Error saving property: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProperty = async (id: string, slug: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? This action is permanent.`)) {
      setActionLoading(true);
      try {
        await deleteProperty(id, slug);
        setProperties((prev) => prev.filter((p) => p.id !== id));
      } catch (err: any) {
        alert("Error deleting property: " + err.message);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>, index: "cover" | number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const triggerBackgroundTagging = async (url: string) => {
      setGeneratingImageAlts((prev) => ({ ...prev, [url]: true }));
      try {
        const res = await generateImageAltAction(
          url,
          editingProperty.name || undefined,
          editingProperty.locationLabel || undefined,
          editingProperty.configuration || undefined
        );
        if (res.success && res.altText) {
          setEditingProperty((prev: any) => {
            const alts = { ...(prev.imageAlts || {}) };
            alts[url] = res.altText;
            return { ...prev, imageAlts: alts };
          });
        }
      } catch (err) {
        console.error("Background auto-tagging failed:", err);
      } finally {
        setGeneratingImageAlts((prev) => ({ ...prev, [url]: false }));
      }
    };

    setUploadingImage(index);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await uploadImageAction(formData);
      if (result.success && result.url) {
        const uploadedUrl = result.url;
        if (index === "cover") {
          setEditingProperty((prev: any) => ({ ...prev, coverImage: uploadedUrl }));
        } else if (index === -1) {
          // add to gallery
          setEditingProperty((prev: any) => ({
            ...prev,
            images: [...(prev.images || []), uploadedUrl],
          }));
          triggerBackgroundTagging(uploadedUrl);
        } else {
          // update gallery index
          setEditingProperty((prev: any) => {
            const copy = [...(prev.images || [])];
            copy[index] = uploadedUrl;
            return { ...prev, images: copy };
          });
          triggerBackgroundTagging(uploadedUrl);
        }
      } else if (!result.success) {
        alert("Upload failed: " + (result.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploadingImage(null);
    }
  };

  const removeGalleryImage = (index: number) => {
    setEditingProperty((prev: any) => {
      const copy = [...(prev.images || [])];
      copy.splice(index, 1);
      return { ...prev, images: copy };
    });
  };

  // Testimonial Actions
  const handleOpenAddTestimonial = () => {
    setEditingTestimonial({
      clientName: "",
      quote: "",
      context: "",
      source: "google",
      rating: 5,
      isFeatured: false,
      isPublished: true,
    });
    setIsTestimonialModalOpen(true);
  };

  const handleOpenEditTestimonial = (testimonial: Testimonial) => {
    setEditingTestimonial({
      id: testimonial._id,
      clientName: testimonial.clientName,
      quote: testimonial.quote,
      context: testimonial.context,
      source: testimonial.source,
      rating: testimonial.rating || 5,
      isFeatured: testimonial.isFeatured,
      isPublished: testimonial.isPublished,
    });
    setIsTestimonialModalOpen(true);
  };

  const handleSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTestimonial.clientName || !editingTestimonial.quote) {
      alert("Name and Quote are required.");
      return;
    }

    setActionLoading(true);
    try {
      await createOrUpdateTestimonial(editingTestimonial);

      // Reload page data
      window.location.reload();
    } catch (err: any) {
      alert("Error saving testimonial: " + err.message);
      setActionLoading(false);
    }
  };

  const handleDeleteTestimonial = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}'s review?`)) {
      setActionLoading(true);
      try {
        await deleteTestimonial(id);
        setTestimonials((prev) => prev.filter((t) => t._id !== id));
      } catch (err: any) {
        alert("Error deleting testimonial: " + err.message);
      } finally {
        setActionLoading(false);
      }
    }
  };

  // Blog Actions
  const handleOpenAddBlog = () => {
    setEditingBlog({
      id: "blog-" + Math.random().toString(36).substring(2, 9),
      slug: "",
      title: "",
      category: "market-report",
      categoryLabel: "Market Report",
      publishedAt: new Date().toISOString().split("T")[0],
      readTime: "5 min read",
      excerpt: "",
      coverImage: "",
      authorName: "Jitendra",
      authorRole: "PIKORUA Realty",
      authorAvatar: "/images/founder.jpg",
      isFeatured: false,
      content: "", // handled as single text string, parsed on save
      htmlContent: "",
      faqs: [],
      seoTitle: "",
      seoDescription: "",
      isActive: true,
    });
    setIsBlogModalOpen(true);
  };

  const handleOpenEditBlog = (blog: BlogPost) => {
    setEditingBlog({
      ...blog,
      authorName: blog.author?.name || "Jitendra",
      authorRole: blog.author?.role || "PIKORUA Realty",
      authorAvatar: blog.author?.avatar || "/images/founder.jpg",
      content: blog.content ? blog.content.join("\n\n") : "",
      htmlContent: blog.htmlContent || "",
      faqs: blog.faqs || [],
      seoTitle: blog.seoTitle || "",
      seoDescription: blog.seoDescription || "",
      isActive: blog.isActive !== undefined ? blog.isActive : true,
    });
    setIsBlogModalOpen(true);
  };

  const handleApproveBlog = async (id: string) => {
    setActionLoading(true);
    try {
      await approveBlogDraft(id);
      setBlogs((prev) =>
        prev.map((b) => (b.id === id ? { ...b, pendingReview: false, isActive: true } : b))
      );
    } catch (err: any) {
      alert("Error approving blog draft: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Deep-link support: an "Approve & Publish" email links to /admin?reviewBlog=<id>
  useEffect(() => {
    const reviewId = new URLSearchParams(window.location.search).get("reviewBlog");
    if (!reviewId || blogs.length === 0) return;
    const target = blogs.find((b) => b.id === reviewId);
    if (target) {
      setActiveTab("blogs");
      handleOpenEditBlog(target);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blogs]);

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog.title || !editingBlog.slug) {
      alert("Title and Slug are required.");
      return;
    }

    setActionLoading(true);
    try {
      const rawContent = editingBlog.content;
      const contentArray = rawContent
        ? (Array.isArray(rawContent)
            ? rawContent
            : (rawContent as string).split("\n\n").map((p: string) => p.trim()).filter((p: string) => p !== ""))
        : [];

      const categoryLabels: Record<string, string> = {
        "market-report": "Market Report",
        "advisory": "Private Advisory",
        "nri-insights": "NRI Insights",
        "corridor-spotlight": "Corridor Spotlight",
        "luxury-living": "Luxury Living",
      };
      
      const contentStr = Array.isArray(rawContent) ? rawContent.join("\n\n") : (rawContent || "");
      const generatedExcerpt = editingBlog.excerpt || generateAutoExcerpt(contentStr);

      const payload = {
        ...editingBlog,
        category: editingBlog.category || "advisory",
        categoryLabel: categoryLabels[editingBlog.category || "advisory"] || "Private Advisory",
        excerpt: generatedExcerpt,
        content: contentArray,
      };

      await createOrUpdateBlogPost(payload);

      setBlogs((prev) => {
        const exists = prev.some((b) => b.id === payload.id);
        const mappedBlog: BlogPost = {
          id: payload.id,
          slug: payload.slug,
          title: payload.title,
          category: payload.category,
          categoryLabel: payload.categoryLabel,
          publishedAt: payload.publishedAt,
          readTime: payload.readTime,
          excerpt: payload.excerpt,
          coverImage: payload.coverImage,
          author: {
            name: payload.authorName,
            role: payload.authorRole,
            avatar: payload.authorAvatar,
          },
          isFeatured: payload.isFeatured,
          content: payload.content,
          htmlContent: payload.htmlContent || undefined,
          faqs: payload.faqs || [],
        };

        if (exists) {
          return prev.map((b) => (b.id === payload.id ? mappedBlog : b));
        } else {
          return [mappedBlog, ...prev];
        }
      });

      setIsBlogModalOpen(false);
      setEditingBlog(null);
    } catch (err: any) {
      alert("Error saving blog: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBlog = async (id: string, slug: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"? This action is permanent.`)) {
      setActionLoading(true);
      try {
        await deleteBlogPost(id, slug);
        setBlogs((prev) => prev.filter((b) => b.id !== id));
      } catch (err: any) {
        alert("Error deleting blog: " + err.message);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleUploadBlogImage = async (e: React.ChangeEvent<HTMLInputElement>, field: "coverImage" | "authorAvatar") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (field === "coverImage") setUploadingBlogImage(true);
    else setUploadingAuthorAvatar(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await uploadImageAction(formData);
      if (result.success && result.url) {
        setEditingBlog((prev: any) => ({ ...prev, [field]: result.url }));
      } else if (!result.success) {
        alert("Upload failed: " + (result.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploadingBlogImage(false);
      setUploadingAuthorAvatar(false);
    }
  };

  // General FAQ actions
  const handleOpenAddGeneralFaq = () => {
    setEditingGeneralFaq({
      question: "",
      answer: "",
      display_order: generalFaqs.length,
      category: "general",
    });
    setIsGeneralFaqModalOpen(true);
  };

  const handleOpenEditGeneralFaq = (faq: GeneralFaq) => {
    setEditingGeneralFaq({ ...faq });
    setIsGeneralFaqModalOpen(true);
  };

  const handleSaveGeneralFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGeneralFaq.question || !editingGeneralFaq.answer) {
      alert("Question and Answer are required.");
      return;
    }
    setActionLoading(true);
    try {
      await createOrUpdateGeneralFaq(editingGeneralFaq);
      // Refetch or update local list
      // Since it's upsert, we can query it or simply reload the list or patch the state.
      // To keep it 100% synced with actual generated database IDs, let's reload window or update state.
      // The best is window.location.reload() or patching state. Let's reload window after success so we fetch fresh database IDs.
      window.location.reload();
    } catch (err: any) {
      alert("Error saving FAQ: " + err.message);
      setActionLoading(false);
    }
  };

  const handleDeleteGeneralFaq = async (id: string, question: string) => {
    if (confirm(`Are you sure you want to delete this FAQ: "${question.substring(0, 40)}..."?`)) {
      setActionLoading(true);
      try {
        await deleteGeneralFaq(id);
        setGeneralFaqs((prev) => prev.filter((f) => f.id !== id));
      } catch (err: any) {
        alert("Error deleting FAQ: " + err.message);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleGenerateAiMetadata = async () => {
    if (!editingBlog.title) {
      alert("Please enter a Title first before generating AI metadata.");
      return;
    }
    const contentText = editingBlog.content || "";
    const htmlContent = editingBlog.htmlContent || "";
    if (!contentText && !htmlContent) {
      alert("Please upload a DOCX file or write some content first.");
      return;
    }

    setGeneratingAiMetadata(true);
    try {
      const result = await generateBlogMetadataAction(editingBlog.title, contentText, htmlContent);
      if (result.success && result.metadata) {
        const { seoTitle, seoDescription, excerpt, faqs } = result.metadata;
        setEditingBlog((prev: any) => ({
          ...prev,
          seoTitle: seoTitle || prev.seoTitle,
          seoDescription: seoDescription || prev.seoDescription,
          excerpt: excerpt || prev.excerpt,
          faqs: faqs && faqs.length > 0 ? faqs : prev.faqs,
        }));
        alert("SEO Meta tags and FAQs successfully generated by AI!");
      } else {
        alert("Failed to generate metadata: " + (result.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("AI Generation failed: " + err.message);
    } finally {
      setGeneratingAiMetadata(false);
    }
  };

  const handleGeneratePropertySeo = async () => {
    if (!editingProperty.name || !editingProperty.configuration || !editingProperty.locationLabel) {
      alert("Please fill in Name, Configuration, and Location first.");
      return;
    }
    setGeneratingPropertySeo(true);
    try {
      const result = await generatePropertySeoAction(
        editingProperty.name,
        editingProperty.configuration,
        editingProperty.locationLabel,
        editingProperty.description || "",
        editingProperty.highlights || ""
      );
      if (result.success && result.metadata) {
        const { seoTitle, seoDescription } = result.metadata;
        setEditingProperty((prev: any) => ({
          ...prev,
          seoTitle: seoTitle || prev.seoTitle,
          seoDescription: seoDescription || prev.seoDescription,
        }));
        alert("Property SEO Meta tags successfully generated by AI!");
      } else {
        alert("Failed to generate SEO: " + (result.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("AI Generation failed: " + err.message);
    } finally {
      setGeneratingPropertySeo(false);
    }
  };

  const handleTagSingleImage = async (imageUrl: string) => {
    if (!editingProperty.name || !editingProperty.locationLabel) {
      alert("Please enter Property Name and Location first so the AI has context.");
      return;
    }
    setGeneratingImageAlts((prev) => ({ ...prev, [imageUrl]: true }));
    try {
      const result = await generateImageAltAction(
        imageUrl,
        editingProperty.name,
        editingProperty.locationLabel,
        editingProperty.configuration || ""
      );
      if (result.success && result.altText) {
        const alts = { ...(editingProperty.imageAlts || {}) };
        alts[imageUrl] = result.altText;
        setEditingProperty((prev: any) => ({ ...prev, imageAlts: alts }));
      } else {
        alert("Failed to tag image: " + (result.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Image tagging failed: " + err.message);
    } finally {
      setGeneratingImageAlts((prev) => ({ ...prev, [imageUrl]: false }));
    }
  };

  const handleTagAllImages = async () => {
    const images = editingProperty.images || [];
    if (images.length === 0) {
      alert("There are no images in the gallery to tag.");
      return;
    }
    if (!editingProperty.name || !editingProperty.locationLabel) {
      alert("Please enter Property Name and Location first so the AI has context.");
      return;
    }
    setGeneratingAllImageAlts(true);
    try {
      const alts = { ...(editingProperty.imageAlts || {}) };
      let successCount = 0;
      for (const imgUrl of images) {
        // Tag only if it doesn't already have an alt text
        if (!alts[imgUrl]) {
          const result = await generateImageAltAction(
            imgUrl,
            editingProperty.name,
            editingProperty.locationLabel,
            editingProperty.configuration || ""
          );
          if (result.success && result.altText) {
            alts[imgUrl] = result.altText;
            successCount++;
          }
        }
      }
      setEditingProperty((prev: any) => ({ ...prev, imageAlts: alts }));
      alert(`Auto-tagging completed! Successfully tagged ${successCount} new images.`);
    } catch (err: any) {
      alert("Auto-tagging failed: " + err.message);
    } finally {
      setGeneratingAllImageAlts(false);
    }
  };

  // Bulk-tags every property in the portfolio that has at least one image
  // missing alt text, persisting to the database after each property so partial
  // progress survives if the browser tab closes mid-run.
  const handleBulkGenerateMissingAlts = async () => {
    const targets = properties.filter((p) => {
      const images = Array.from(new Set([p.coverImage, ...(p.images || [])].filter(Boolean)));
      const alts = p.imageAlts || {};
      return images.some((img) => !alts[img]);
    });

    if (targets.length === 0) {
      alert("Every property already has alt text on all its images.");
      return;
    }

    const totalImages = targets.reduce((sum, p) => {
      const images = Array.from(new Set([p.coverImage, ...(p.images || [])].filter(Boolean)));
      const alts = p.imageAlts || {};
      return sum + images.filter((img) => !alts[img]).length;
    }, 0);

    setBulkAltProgress({ current: 0, total: totalImages, active: true, propertyName: "" });

    let processed = 0;
    let taggedProperties = 0;
    try {
      for (const property of targets) {
        const images = Array.from(new Set([property.coverImage, ...(property.images || [])].filter(Boolean)));
        const alts = { ...(property.imageAlts || {}) };
        let changed = false;

        for (const imgUrl of images) {
          if (!alts[imgUrl]) {
            setBulkAltProgress((prev) => ({ ...prev, propertyName: property.name }));
            try {
              const result = await generateImageAltAction(
                imgUrl,
                property.name,
                property.locationLabel,
                property.configuration || ""
              );
              if (result.success && result.altText) {
                alts[imgUrl] = result.altText;
                changed = true;
              }
            } catch (err) {
              console.error(`Failed alt text for ${imgUrl}:`, err);
            }
            processed++;
            setBulkAltProgress((prev) => ({ ...prev, current: processed }));
          }
        }

        if (changed) {
          await updatePropertyImageAlts(property.id, alts);
          setProperties((prev) => prev.map((p) => (p.id === property.id ? { ...p, imageAlts: alts } : p)));
          taggedProperties++;
        }
      }
      alert(`Alt text generated for ${taggedProperties} of ${targets.length} properties (${processed} images).`);
    } catch (err: any) {
      alert("Bulk alt-text generation stopped early: " + err.message);
    } finally {
      setBulkAltProgress({ current: 0, total: 0, active: false, propertyName: "" });
    }
  };

  const handleWhatsAppAiReply = async (lead: any) => {
    if (!lead.phone) {
      alert("No phone number available for this lead.");
      return;
    }
    
    setWaReplyLead(lead);
    setWaReplyMessage("");
    setLoadingWaReply(true);
    
    try {
      const result = await generateLeadReplyAction(
        lead.name,
        lead.category || undefined,
        lead.location || undefined,
        lead.budget_band || undefined,
        lead.message || undefined
      );

      if (result.success && result.replyText) {
        setWaReplyMessage(result.replyText);
      } else {
        setWaReplyMessage("Failed to draft AI reply: " + (result.error || "Unknown error"));
      }
    } catch (err: any) {
      setWaReplyMessage("AI Reply Generation failed: " + err.message);
    } finally {
      setLoadingWaReply(false);
    }
  };

  const sendWhatsAppMessage = () => {
    if (!waReplyLead || !waReplyMessage) return;

    // Clean phone number format
    let cleanPhone = waReplyLead.phone.replace(/\D/g, "");
    if (cleanPhone.length === 10) {
      cleanPhone = "91" + cleanPhone;
    }
    
    // Encode message for URL
    const encodedText = encodeURIComponent(waReplyMessage);
    
    // Detect mobile vs desktop
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // On mobile, launch the native app directly
      window.location.href = `whatsapp://send?phone=${cleanPhone}&text=${encodedText}`;
    } else {
      // On desktop, open WhatsApp Web directly in a new tab (bypassing the splash page)
      window.open(`https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`, "_blank", "noopener,noreferrer");
    }
    
    // Close the reply modal
    setWaReplyLead(null);
    setWaReplyMessage("");
  };

  const handleRunIndexingTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testIndexingUrl) return;

    setTestingIndexing(true);
    setIndexingTestResult(null);

    try {
      const result = await submitToGoogleIndexingAction(testIndexingUrl, "URL_UPDATED");
      setIndexingTestResult(result);
    } catch (err: any) {
      setIndexingTestResult({ success: false, error: err.message });
    } finally {
      setTestingIndexing(false);
    }
  };

  const handleGeneratePageSeo = async (pageId: string) => {
    setGeneratingPageSeo((prev) => ({ ...prev, [pageId]: true }));
    try {
      // Gather optional context if available
      let context = "";
      if (pageId === "about" && aboutContent) {
        const storyText = Array.isArray(aboutContent.founderStory)
          ? aboutContent.founderStory.join(" ")
          : (aboutContent.founderStory || "");
        context = `Hero Title: ${aboutContent.heroTitle || ""}. Story: ${storyText}`;
      }

      const result = await generatePageSeoAction(pageId, context);
      if (result.success && result.metadata) {
        const { seoTitle, seoDescription } = result.metadata;
        setSeoState((prev) => ({
          ...prev,
          [pageId]: {
            ...prev[pageId],
            seoTitle: seoTitle || prev[pageId].seoTitle,
            seoDescription: seoDescription || prev[pageId].seoDescription,
          },
        }));
        alert(`${seoState[pageId]?.title || pageId} SEO tags successfully generated! (Remember to click 'Update Settings' to save)`);
      } else {
        alert("Failed to generate SEO: " + (result.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("AI Generation failed: " + err.message);
    } finally {
      setGeneratingPageSeo((prev) => ({ ...prev, [pageId]: false }));
    }
  };

  const handleFetchNews = async () => {
    setFetchingNews(true);
    try {
      const result = await fetchRealEstateNewsAction();
      if (result.success) {
        setNewsFeed(result.items);
      } else {
        alert("Failed to load news feed: " + (result.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Error fetching news: " + err.message);
    } finally {
      setFetchingNews(false);
    }
  };

  const handleGenerateFromNews = async (title: string, url?: string, customText?: string) => {
    if (!title) {
      alert("A topic or headline is required.");
      return;
    }
    setGeneratingBlogFromNews(true);
    try {
      const result = await generateBlogFromNewsAction(title, url, customText);
      if (result.success) {
        setEditingBlog({
          id: "blog-" + Math.random().toString(36).substring(2, 9),
          title: result.draft.title,
          slug: result.draft.slug,
          htmlContent: result.draft.htmlContent,
          content: [],
          coverImage: result.draft.coverImage || "",
          excerpt: result.draft.excerpt || "",
          seoTitle: result.draft.seoTitle || "",
          seoDescription: result.draft.seoDescription || "",
          faqs: result.draft.faqs || [],
          publishedAt: new Date().toISOString().split("T")[0],
          readTime: "4 min read",
          author: {
            name: "Jitendra",
            role: "Founder, PIKORUA Realty",
            avatar: "/images/founder.jpg"
          }
        });
        
        setIsNewsDrafterOpen(false);
        setIsBlogModalOpen(true);
        
        // Reset custom fields
        setCustomNewsTitle("");
        setCustomNewsUrl("");
        setCustomNewsText("");
        alert("AI Blog Draft generated successfully! You can now review, edit, and publish it.");
      } else {
        alert("Failed to generate blog draft: " + (result.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("AI Generation failed: " + err.message);
    } finally {
      setGeneratingBlogFromNews(false);
    }
  };

  // DOCX → HTML converter (runs entirely client-side using mammoth.js)
  const handleDocxUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".docx")) {
      alert("Please upload a .docx file.");
      return;
    }
    setDocxUploading(true);
    try {
      const mammoth = await import("mammoth");
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml(
        { arrayBuffer },
        {
          styleMap: [
            "p[style-name='Heading 1'] => h2:fresh",
            "p[style-name='Heading 2'] => h3:fresh",
            "p[style-name='Heading 3'] => h4:fresh",
            "p[style-name='Heading 4'] => h5:fresh",
            "b => strong",
            "i => em",
          ],
        }
      );
      const html = result.value;
      // Generate plain-text excerpt from converted HTML for the excerpt field
      const plainText = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      const autoExcerpt = plainText.substring(0, 220) + (plainText.length > 220 ? "..." : "");
      setEditingBlog((prev: any) => ({
        ...prev,
        htmlContent: html,
        content: "", // clear plain-text when HTML is set
        excerpt: prev.excerpt || autoExcerpt,
      }));
      if (result.messages.length > 0) {
        console.warn("Mammoth conversion warnings:", result.messages);
      }
    } catch (err: any) {
      alert("DOCX conversion failed: " + err.message);
    } finally {
      setDocxUploading(false);
      e.target.value = "";
    }
  };

  // About Page Actions
  const handleSaveAboutPage = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const storyArray = typeof aboutContent.founderStory === "string"
        ? aboutContent.founderStory.split("\n\n").map((p: string) => p.trim()).filter((p: string) => p !== "")
        : aboutContent.founderStory;

      // Blank principles are dropped so the About page falls back to its built-in set.
      const principlesArray = (aboutContent.principles || []).filter(
        (pr: { label?: string; body?: string }) => pr?.label?.trim() || pr?.body?.trim()
      );

      const payload = {
        ...aboutContent,
        founderStory: storyArray,
        principles: principlesArray,
      };

      await createOrUpdateAboutPage(payload);
      alert("About Page content updated successfully!");
    } catch (err: any) {
      alert("Error saving About page: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const insertFormatting = (
    field: string,
    prefix: string,
    suffix: string,
    placeholder = "text"
  ) => {
    const textarea = document.getElementById(field) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const selectedText = text.substring(start, end) || placeholder;
    const replacement = prefix + selectedText + suffix;

    const newValue = text.substring(0, start) + replacement + text.substring(end);

    if (activeTab === "blogs") {
      setEditingBlog((prev: any) => ({ ...prev, [field]: newValue }));
    } else if (activeTab === "properties") {
      setEditingProperty((prev: any) => ({ ...prev, [field]: newValue }));
    } else if (activeTab === "about") {
      setAboutContent((prev: any) => ({ ...prev, [field]: newValue }));
    } else if (activeTab === "home") {
      setHomeContent((prev: any) => ({ ...prev, [field]: newValue }));
    }

    // Refocus and select
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 0);
  };

  const renderTextToolbar = (field: string) => {
    return (
      <div className="flex flex-wrap items-center gap-1.5 pb-1.5 mb-1.5">
        <button
          type="button"
          onClick={() => insertFormatting(field, "**", "**", "bold text")}
          className="px-2 py-0.5 bg-white/5 border border-white/10 hover:border-white/20 hover:text-white rounded-sm text-[9px] uppercase font-semibold tracking-wider transition-all cursor-pointer"
          title="Bold Text (e.g. **bold**)"
        >
          Bold
        </button>
        <button
          type="button"
          onClick={() => insertFormatting(field, "*", "*", "italic text")}
          className="px-2 py-0.5 bg-white/5 border border-white/10 hover:border-white/20 hover:text-white rounded-sm text-[9px] uppercase font-semibold tracking-wider transition-all cursor-pointer"
          title="Italic Text (e.g. *italic*)"
        >
          Italic
        </button>
        <button
          type="button"
          onClick={() => insertFormatting(field, "### ", "", "Heading")}
          className="px-2 py-0.5 bg-white/5 border border-white/10 hover:border-white/20 hover:text-white rounded-sm text-[9px] uppercase font-semibold tracking-wider transition-all cursor-pointer"
          title="Add Heading (e.g. ### Heading)"
        >
          Heading
        </button>
        <button
          type="button"
          onClick={() => insertFormatting(field, "[", "](url)", "link text")}
          className="px-2 py-0.5 bg-white/5 border border-white/10 hover:border-white/20 hover:text-white rounded-sm text-[9px] uppercase font-semibold tracking-wider transition-all cursor-pointer"
          title="Insert Link (e.g. [label](url))"
        >
          Link
        </button>
        <button
          type="button"
          onClick={() => insertFormatting(field, "- ", "", "list item")}
          className="px-2 py-0.5 bg-white/5 border border-white/10 hover:border-white/20 hover:text-white rounded-sm text-[9px] uppercase font-semibold tracking-wider transition-all cursor-pointer"
          title="Bullet List Item (e.g. - item)"
        >
          Bullet
        </button>

        {/* Font Size Select */}
        <select
          onChange={(e) => {
            const val = e.target.value;
            if (val) {
              insertFormatting(field, `[size:${val}]{`, "}", "sized text");
              e.target.value = "";
            }
          }}
          className="px-1.5 py-0.5 bg-lux-black border border-white/10 hover:border-white/20 text-ivory/80 rounded-sm text-[9px] uppercase font-semibold tracking-wider transition-all cursor-pointer focus:outline-none h-[20px]"
        >
          <option value="" disabled selected>Size</option>
          <option value="10">10</option>
          <option value="11">11</option>
          <option value="12">12</option>
          <option value="13">13</option>
          <option value="14">14</option>
          <option value="16">16</option>
          <option value="18">18</option>
          <option value="20">20</option>
          <option value="22">22</option>
          <option value="24">24</option>
          <option value="28">28</option>
          <option value="32">32</option>
          <option value="36">36</option>
          <option value="40">40</option>
          <option value="48">48</option>
          <option value="56">56</option>
          <option value="64">64</option>
        </select>

        {/* Font Style Select */}
        <select
          onChange={(e) => {
            const val = e.target.value;
            if (val) {
              insertFormatting(field, `[style:${val}]{`, "}", "styled text");
              e.target.value = "";
            }
          }}
          className="px-1.5 py-0.5 bg-lux-black border border-white/10 hover:border-white/20 text-ivory/80 rounded-sm text-[9px] uppercase font-semibold tracking-wider transition-all cursor-pointer focus:outline-none h-[20px]"
        >
          <option value="" disabled selected>Style</option>
          <option value="serif">Serif (Display)</option>
          <option value="sans">Sans-Serif</option>
          <option value="mono">Monospace</option>
          <option value="gold">Gold Color</option>
          <option value="muted">Muted Text</option>
          <option value="underline">Underline</option>
          <option value="strike">Strike</option>
          <option value="uppercase">Uppercase</option>
          <option value="tracking">Letter Spacing</option>
        </select>
      </div>
    );
  };

  const handleUploadAboutAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAboutAvatar(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await uploadImageAction(formData);
      if (result.success && result.url) {
        setAboutContent((prev: any) => ({ ...prev, founderAvatar: result.url }));
      } else if (!result.success) {
        alert("Upload failed: " + (result.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploadingAboutAvatar(false);
    }
  };

  const handleUploadHeroVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingHeroVideo(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await uploadImageAction(formData);
      if (result.success && result.url) {
        setHomeContent((prev: any) => ({ ...prev, heroVideoUrl: result.url }));
        alert("Video uploaded successfully!");
      } else if (!result.success) {
        alert("Video upload failed: " + (result.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Video upload failed: " + err.message);
    } finally {
      setUploadingHeroVideo(false);
    }
  };

  const handleUploadHeroPoster = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingHeroPoster(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await uploadImageAction(formData);
      if (result.success && result.url) {
        setHomeContent((prev: any) => ({ ...prev, heroPosterUrl: result.url }));
        alert("Poster image uploaded successfully!");
      } else if (!result.success) {
        alert("Poster image upload failed: " + (result.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Poster image upload failed: " + err.message);
    } finally {
      setUploadingHeroPoster(false);
    }
  };

  return (
    <div className="min-h-screen bg-lux-black flex text-white font-sans">
      {/* ── Sidebar ── */}
      <aside className="w-64 bg-soft-black border-r border-white/[0.06] flex flex-col justify-between flex-shrink-0 z-20">
        <div>
          {/* Logo brand */}
          <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg tracking-widest text-ivory">PIKORUA</h2>
              <p className="text-[9px] text-champagne-gold uppercase tracking-[0.2em] mt-0.5 font-medium">
                Advisory Console
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab("leads")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-wider rounded-sm transition-all text-left cursor-pointer ${
                activeTab === "leads"
                  ? "bg-champagne-gold/10 text-champagne-gold font-medium border-l-2 border-champagne-gold"
                  : "text-ivory/50 hover:bg-white/[0.02] hover:text-white"
              }`}
            >
              <Users className="w-4 h-4" />
              Leads & Inquiries
            </button>

            <button
              onClick={() => setActiveTab("properties")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-wider rounded-sm transition-all text-left cursor-pointer ${
                activeTab === "properties"
                  ? "bg-champagne-gold/10 text-champagne-gold font-medium border-l-2 border-champagne-gold"
                  : "text-ivory/50 hover:bg-white/[0.02] hover:text-white"
              }`}
            >
              <Building className="w-4 h-4" />
              Properties
            </button>

            <button
              onClick={() => setActiveTab("testimonials")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-wider rounded-sm transition-all text-left cursor-pointer ${
                activeTab === "testimonials"
                  ? "bg-champagne-gold/10 text-champagne-gold font-medium border-l-2 border-champagne-gold"
                  : "text-ivory/50 hover:bg-white/[0.02] hover:text-white"
              }`}
            >
              <Quote className="w-4 h-4" />
              Testimonials
            </button>

            <button
              onClick={() => setActiveTab("blogs")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-wider rounded-sm transition-all text-left cursor-pointer ${
                activeTab === "blogs"
                  ? "bg-champagne-gold/10 text-champagne-gold font-medium border-l-2 border-champagne-gold"
                  : "text-ivory/50 hover:bg-white/[0.02] hover:text-white"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Blog Posts
            </button>

            <button
              onClick={() => setActiveTab("home")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-wider rounded-sm transition-all text-left cursor-pointer ${
                activeTab === "home"
                  ? "bg-champagne-gold/10 text-champagne-gold font-medium border-l-2 border-champagne-gold"
                  : "text-ivory/50 hover:bg-white/[0.02] hover:text-white"
              }`}
            >
              <Home className="w-4 h-4" />
              Home Page
            </button>

            <button
              onClick={() => setActiveTab("about")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-wider rounded-sm transition-all text-left cursor-pointer ${
                activeTab === "about"
                  ? "bg-champagne-gold/10 text-champagne-gold font-medium border-l-2 border-champagne-gold"
                  : "text-ivory/50 hover:bg-white/[0.02] hover:text-white"
              }`}
            >
              <FileText className="w-4 h-4" />
              About Page
            </button>

            <button
              onClick={() => setActiveTab("seo")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-wider rounded-sm transition-all text-left cursor-pointer ${
                activeTab === "seo"
                  ? "bg-champagne-gold/10 text-champagne-gold font-medium border-l-2 border-champagne-gold"
                  : "text-ivory/50 hover:bg-white/[0.02] hover:text-white"
              }`}
            >
              <Globe className="w-4 h-4" />
              SEO Settings
            </button>

            <button
              onClick={() => setActiveTab("faqs")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-wider rounded-sm transition-all text-left cursor-pointer ${
                activeTab === "faqs"
                  ? "bg-champagne-gold/10 text-champagne-gold font-medium border-l-2 border-champagne-gold"
                  : "text-ivory/50 hover:bg-white/[0.02] hover:text-white"
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              General FAQs
            </button>
          </nav>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-white/[0.06]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-wider text-red-400 hover:bg-red-950/20 rounded-sm transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout Session
          </button>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <main className="flex-1 flex flex-col min-w-0 bg-lux-black overflow-y-auto">
        <header className="h-16 border-b border-white/[0.06] bg-soft-black/40 backdrop-blur-sm sticky top-0 flex items-center justify-between px-8 z-10">
          <h1 className="font-display text-sm tracking-[0.2em] text-ivory uppercase">
            {activeTab === "leads"
              ? "Leads & Inquiries"
              : activeTab === "properties"
              ? "Curated Properties"
              : activeTab === "testimonials"
              ? "Client Testimonials"
              : activeTab === "blogs"
              ? "Blog Posts"
              : activeTab === "home"
              ? "Home Page Content"
              : activeTab === "about"
              ? "About Page Content"
              : "SEO Settings"}
          </h1>

          <div className="flex items-center gap-4">
            <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/20 tracking-widest uppercase">
              Secure
            </span>
          </div>
        </header>

        <div className="p-8 max-w-7xl w-full mx-auto space-y-6">
          {actionLoading && (
            <div className="bg-champagne-gold/10 border border-champagne-gold/20 text-champagne-gold text-xs py-3 px-4 rounded-sm flex items-center gap-2 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin" />
              Synchronizing updates with database...
            </div>
          )}

          {/* ── TABS ── */}

          {/* Tab 1: LEADS */}
          {activeTab === "leads" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <p className="text-xs text-ivory/40">
                  Track client callback queries, guided discovery, and private property consultations.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleExportCSV}
                    disabled={leads.length === 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-champagne-gold/20 hover:border-champagne-gold/40 text-[10px] tracking-wider uppercase rounded-sm bg-champagne-gold/5 hover:bg-champagne-gold/10 text-champagne-gold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Download className="w-3 h-3" />
                    Export to Sheets
                  </button>
                  <button
                    onClick={fetchLeadsData}
                    className="px-3 py-1.5 border border-white/10 hover:border-white/20 text-[10px] tracking-wider uppercase rounded-sm bg-soft-black text-ivory/60 hover:text-white transition-all cursor-pointer"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              {loadingLeads ? (
                <div className="py-20 flex flex-col items-center gap-3 text-ivory/40">
                  <Loader2 className="w-8 h-8 animate-spin text-champagne-gold" />
                  <span className="text-xs tracking-wider uppercase">Fetching database records...</span>
                </div>
              ) : leads.length === 0 ? (
                <div className="py-20 border border-dashed border-white/[0.08] rounded-sm text-center text-ivory/30">
                  No lead submissions found in database.
                </div>
              ) : (
                <div className="bg-soft-black border border-white/[0.06] rounded-sm overflow-hidden shadow-xl">
                  <table className="w-full border-collapse text-left text-xs text-ivory/80">
                    <thead>
                      <tr className="bg-white/[0.02] border-b border-white/[0.06] text-ivory/50 uppercase tracking-[0.12em] text-[10px]">
                        <th className="p-4">Lead</th>
                        <th className="p-4">Source</th>
                        <th className="p-4">Preferences</th>
                        <th className="p-4">Submitted</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {leads.map((lead) => {
                        const date = new Date(lead.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        });

                        return (
                          <tr key={lead.id} className="hover:bg-white/[0.01] transition-all">
                            <td className="p-4">
                              <div className="font-semibold text-white flex items-center gap-2">
                                {lead.name}
                                {lead.is_hot && (
                                  <span
                                    title="Hot HNI Lead"
                                    className="bg-amber-500/20 text-amber-300 p-0.5 rounded-full"
                                  >
                                    <Flame className="w-3.5 h-3.5 fill-amber-300 stroke-none" />
                                  </span>
                                )}
                              </div>
                              <div className="text-ivory/40 font-mono text-[10px] mt-0.5">
                                {lead.phone}
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="capitalize px-2 py-0.5 rounded-sm bg-white/5 border border-white/10 text-[10px]">
                                {lead.source}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="text-ivory/80 max-w-xs truncate">
                                {lead.budget_band && `Budget: ${lead.budget_band} • `}
                                {lead.location && `Loc: ${lead.location}`}
                                {!lead.budget_band && !lead.location && (
                                  <span className="text-ivory/30 italic">No preference set</span>
                                )}
                              </div>
                            </td>
                            <td className="p-4 text-ivory/40">{date}</td>
                            <td className="p-4">
                              <select
                                value={lead.status}
                                onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                                className={`text-[10px] font-sans uppercase tracking-wider px-2 py-1 bg-lux-black border border-white/[0.1] rounded-sm focus:outline-none focus:border-champagne-gold cursor-pointer ${
                                  lead.status === "new"
                                    ? "text-blue-300 border-blue-500/30 bg-blue-500/5"
                                    : lead.status === "contacted"
                                    ? "text-amber-300 border-amber-500/30 bg-amber-500/5"
                                    : lead.status === "qualified"
                                    ? "text-teal-300 border-teal-500/30 bg-teal-500/5"
                                    : lead.status === "won"
                                    ? "text-emerald-300 border-emerald-500/30 bg-emerald-500/5"
                                    : "text-red-300 border-red-500/30 bg-red-500/5"
                                }`}
                              >
                                <option value="new">New</option>
                                <option value="contacted">Contacted</option>
                                <option value="qualified">Qualified</option>
                                <option value="won">Won</option>
                                <option value="lost">Lost</option>
                              </select>
                            </td>
                            <td className="p-4 text-right flex items-center justify-end gap-2">
                              <button
                                type="button"
                                disabled={waReplyLead?.id === lead.id && loadingWaReply}
                                onClick={() => handleWhatsAppAiReply(lead)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-emerald-600/30 hover:border-emerald-500 text-[10px] tracking-wider uppercase rounded-sm text-emerald-400 hover:text-emerald-300 bg-emerald-950/20 hover:bg-emerald-950/40 transition-all cursor-pointer disabled:cursor-wait disabled:opacity-50"
                                title="Generate follow-up message & open WhatsApp chat"
                              >
                                {waReplyLead?.id === lead.id && loadingWaReply ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Sparkles className="w-3.5 h-3.5" />
                                )}
                                Reply
                              </button>
                              <button
                                onClick={() => setSelectedLead(lead)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-white/[0.08] hover:border-champagne-gold text-[10px] tracking-wider uppercase rounded-sm text-ivory hover:text-champagne-gold bg-lux-black transition-all cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                Details
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: PROPERTIES */}
          {activeTab === "properties" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-xs text-ivory/40">
                  Manage the luxury residential portfolio displayed in the collection.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleBulkGenerateMissingAlts}
                    disabled={bulkAltProgress.active}
                    className="inline-flex items-center gap-2 border border-champagne-gold/40 text-champagne-gold text-xs uppercase tracking-wider font-semibold py-2 px-4 rounded-sm hover:border-champagne-gold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Generate AI alt text for every property image that's missing it"
                  >
                    {bulkAltProgress.active ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    {bulkAltProgress.active
                      ? `Tagging ${bulkAltProgress.current}/${bulkAltProgress.total}…`
                      : "Generate Missing Alt Text"}
                  </button>
                  <button
                    onClick={handleOpenAddProperty}
                    className="inline-flex items-center gap-2 bg-champagne-gold text-lux-black text-xs uppercase tracking-wider font-semibold py-2 px-4 rounded-sm hover:bg-antique-gold transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Add Property
                  </button>
                </div>
              </div>
              {bulkAltProgress.active && (
                <div className="bg-soft-black border border-champagne-gold/20 rounded-sm px-4 py-3 text-xs text-ivory/60 flex items-center gap-3">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-champagne-gold flex-shrink-0" />
                  <span>
                    Generating alt text for <span className="text-champagne-gold">{bulkAltProgress.propertyName || "…"}</span> — image {bulkAltProgress.current} of {bulkAltProgress.total}
                  </span>
                </div>
              )}

              <div className="bg-soft-black border border-white/[0.06] rounded-sm overflow-hidden shadow-xl">
                <table className="w-full border-collapse text-left text-xs text-ivory/80">
                  <thead>
                    <tr className="bg-white/[0.02] border-b border-white/[0.06] text-ivory/50 uppercase tracking-[0.12em] text-[10px]">
                      <th className="p-4">Property</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Location</th>
                      <th className="p-4">Price / Config</th>
                      <th className="p-4">Featured</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {properties.map((prop) => (
                      <tr key={prop.id} className="hover:bg-white/[0.01] transition-all">
                        <td className="p-4 flex items-center gap-3">
                          <div className="relative w-12 h-9 rounded-sm overflow-hidden bg-lux-black border border-white/[0.08]">
                            {prop.coverImage ? (
                              <Image
                                src={prop.coverImage}
                                alt={prop.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[8px] uppercase tracking-wider text-ivory/30 text-center font-mono">
                                No Cover
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{prop.name}</div>
                            <div className="text-ivory/40 text-[10px] mt-0.5 font-mono">
                              /{prop.slug}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="capitalize">{prop.category}</span>
                        </td>
                        <td className="p-4">
                          <div>{prop.locationLabel}</div>
                          <div className="text-ivory/40 text-[10px] mt-0.5">{prop.location}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-champagne-gold">
                            {prop.price || "Price on Request"}
                          </div>
                          <div className="text-ivory/40 text-[10px] mt-0.5">
                            {prop.configuration.split("·")[0]}
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-widest ${
                              prop.isFeatured
                                ? "bg-champagne-gold/10 text-champagne-gold border border-champagne-gold/20"
                                : "bg-white/5 text-ivory/40"
                            }`}
                          >
                            {prop.isFeatured ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-widest ${
                              prop.isActive !== false
                                ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                                : "bg-red-500/10 text-red-300 border border-red-500/20 animate-pulse"
                            }`}
                          >
                            {prop.isActive !== false ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenEditProperty(prop)}
                            className="p-2 border border-white/[0.08] hover:border-champagne-gold text-ivory hover:text-champagne-gold rounded-sm bg-lux-black transition-all cursor-pointer inline-flex items-center"
                            title="Edit Property"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProperty(prop.id, prop.slug, prop.name)}
                            className="p-2 border border-white/[0.08] hover:border-red-500 text-ivory hover:text-red-400 rounded-sm bg-lux-black transition-all cursor-pointer inline-flex items-center"
                            title="Delete Property"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={`/properties/${prop.slug}`}
                            target="_blank"
                            className="p-2 border border-white/[0.08] hover:border-white text-ivory hover:text-white rounded-sm bg-lux-black transition-all cursor-pointer inline-flex items-center"
                            title="View Public Page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: TESTIMONIALS */}
          {activeTab === "testimonials" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-xs text-ivory/40">
                  Manage client reviews and trust verification references.
                </p>
                <button
                  onClick={handleOpenAddTestimonial}
                  className="inline-flex items-center gap-2 bg-champagne-gold text-lux-black text-xs uppercase tracking-wider font-semibold py-2 px-4 rounded-sm hover:bg-antique-gold transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Review
                </button>
              </div>

              <div className="bg-soft-black border border-white/[0.06] rounded-sm overflow-hidden shadow-xl">
                <table className="w-full border-collapse text-left text-xs text-ivory/80">
                  <thead>
                    <tr className="bg-white/[0.02] border-b border-white/[0.06] text-ivory/50 uppercase tracking-[0.12em] text-[10px]">
                      <th className="p-4">Client</th>
                      <th className="p-4">Context</th>
                      <th className="p-4">Source</th>
                      <th className="p-4">Featured / Pub</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {testimonials.map((t) => (
                      <tr key={t._id} className="hover:bg-white/[0.01] transition-all">
                        <td className="p-4">
                          <div className="font-semibold text-white">{t.clientName}</div>
                          <div className="text-ivory/50 line-clamp-1 max-w-md mt-1 italic">
                            &ldquo;{t.quote}&rdquo;
                          </div>
                        </td>
                        <td className="p-4">{t.context}</td>
                        <td className="p-4">
                          <span className="uppercase tracking-wider text-[9px] text-champagne-gold font-mono border border-champagne-gold/20 px-2 py-0.5 rounded-sm">
                            {t.source}
                          </span>
                        </td>
                        <td className="p-4 space-x-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-widest ${
                              t.isFeatured
                                ? "bg-champagne-gold/10 text-champagne-gold border border-champagne-gold/20"
                                : "bg-white/5 text-ivory/40"
                            }`}
                          >
                            Featured
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-widest ${
                              t.isPublished
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-red-500/10 text-red-400 border border-red-500/20"
                            }`}
                          >
                            {t.isPublished ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenEditTestimonial(t)}
                            className="p-2 border border-white/[0.08] hover:border-champagne-gold text-ivory hover:text-champagne-gold rounded-sm bg-lux-black transition-all cursor-pointer inline-flex items-center"
                            title="Edit Testimonial"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTestimonial(t._id, t.clientName)}
                            className="p-2 border border-white/[0.08] hover:border-red-500 text-ivory hover:text-red-400 rounded-sm bg-lux-black transition-all cursor-pointer inline-flex items-center"
                            title="Delete Testimonial"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 4: BLOGS */}
          {activeTab === "blogs" && (
            <div className="space-y-4">
              {automation && (
                <div className="bg-soft-black border border-white/[0.06] rounded-sm p-4 space-y-3">
                  {!automation.available ? (
                    <p className="text-xs text-ivory/40">Automated posting: {automation.error}</p>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs">
                          <CirclePause className="w-4 h-4 text-champagne-gold" />
                          <span className="uppercase tracking-wider font-semibold text-ivory/70">Automated posting</span>
                          <span className={automation.paused ? "text-amber-300/80" : "text-ivory/60"}>
                            {automation.paused
                              ? automation.pausedUntil === "infinity"
                                ? "Paused until resumed"
                                : `Paused — resumes ${new Date(automation.pausedUntil!).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })} IST`
                              : automation.autopublish
                                ? "Active — publishes drafts that pass every check; flagged drafts wait here"
                                : "Active — every draft waits here for approval"}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {automation.paused ? (
                            <button
                              onClick={() => handleSetAutomationPause(null)}
                              disabled={actionLoading}
                              className="border border-champagne-gold/40 text-champagne-gold text-[10px] uppercase tracking-wider font-semibold py-1.5 px-3 rounded-sm hover:border-champagne-gold transition-all cursor-pointer disabled:opacity-50"
                            >
                              Resume now
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handleSetAutomationPause(istDateFromNow(7))}
                                disabled={actionLoading}
                                className="border border-white/[0.12] text-ivory/70 text-[10px] uppercase tracking-wider font-semibold py-1.5 px-3 rounded-sm hover:border-champagne-gold/40 transition-all cursor-pointer disabled:opacity-50"
                              >
                                Pause 1 week
                              </button>
                              <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-ivory/50">
                                Resume on
                                <input
                                  type="date"
                                  value={pauseResumeOn}
                                  min={minResumeOn}
                                  onChange={(e) => setPauseResumeOn(e.target.value)}
                                  className="bg-lux-black border border-white/[0.12] rounded-sm px-2 py-1 text-ivory/80 text-xs normal-case"
                                />
                              </label>
                              <button
                                onClick={() => handleSetAutomationPause(pauseResumeOn)}
                                disabled={actionLoading || !pauseResumeOn}
                                className="border border-white/[0.12] text-ivory/70 text-[10px] uppercase tracking-wider font-semibold py-1.5 px-3 rounded-sm hover:border-champagne-gold/40 transition-all cursor-pointer disabled:opacity-50"
                              >
                                Pause
                              </button>
                              <button
                                onClick={() => handleSetAutomationPause("indefinite")}
                                disabled={actionLoading}
                                className="border border-white/[0.12] text-ivory/70 text-[10px] uppercase tracking-wider font-semibold py-1.5 px-3 rounded-sm hover:border-champagne-gold/40 transition-all cursor-pointer disabled:opacity-50"
                              >
                                Pause indefinitely
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      {automation.runs.length > 0 && (
                        <ul className="text-[10px] text-ivory/40 space-y-1 font-mono">
                          {automation.runs.map((run) => (
                            <li key={run.id} className="truncate" title={run.reason ?? ""}>
                              {new Date(run.started_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })}
                              {" · "}
                              <span className={run.status === "published" ? "text-champagne-gold" : run.status === "failed" ? "text-red-400/80" : ""}>{run.status}</span>
                              {run.source_title ? ` · ${run.source_title}` : ""}
                              {run.reason ? ` · ${run.reason}` : ""}
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center">
                <p className="text-xs text-ivory/40">
                  Manage blog posts, insights, and corridor spotlights.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsNewsDrafterOpen(true);
                      handleFetchNews();
                    }}
                    className="inline-flex items-center gap-2 border border-champagne-gold/40 text-champagne-gold text-xs uppercase tracking-wider font-semibold py-2 px-4 rounded-sm hover:border-champagne-gold transition-all cursor-pointer"
                  >
                    <Flame className="w-4 h-4 text-champagne-gold" />
                    AI News Drafter
                  </button>
                  <button
                    onClick={handleOpenAddBlog}
                    className="inline-flex items-center gap-2 bg-champagne-gold text-lux-black text-xs uppercase tracking-wider font-semibold py-2 px-4 rounded-sm hover:bg-antique-gold transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Add Blog Post
                  </button>
                </div>
              </div>

              <div className="bg-soft-black border border-white/[0.06] rounded-sm overflow-hidden shadow-xl">
                <table className="w-full border-collapse text-left text-xs text-ivory/80">
                  <thead>
                    <tr className="bg-white/[0.02] border-b border-white/[0.06] text-ivory/50 uppercase tracking-[0.12em] text-[10px]">
                      <th className="p-4">Article</th>
                      <th className="p-4">Published</th>
                      <th className="p-4">Featured</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {blogs.map((blog) => (
                      <tr key={blog.id} className="hover:bg-white/[0.01] transition-all">
                        <td className="p-4 flex items-center gap-3">
                          <div className="relative w-12 h-9 rounded-sm overflow-hidden bg-lux-black border border-white/[0.08]">
                            {blog.coverImage ? (
                              <Image
                                src={blog.coverImage}
                                alt={blog.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[8px] uppercase tracking-wider text-ivory/30 text-center font-mono">
                                No Cover
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-white line-clamp-1 max-w-sm">{blog.title}</div>
                            <div className="text-ivory/40 text-[10px] mt-0.5 font-mono">
                              /blog/{blog.slug}
                            </div>
                            {blog.reviewNotes && (blog.pendingReview || blog.source === "ai_auto") && (
                              <div
                                className={`${blog.pendingReview ? "text-amber-300/80" : "text-ivory/40"} text-[10px] mt-1 max-w-sm whitespace-pre-line`}
                                title={blog.pendingReview ? "Why the automated quality gate held this draft" : "What the automated pipeline changed before publishing"}
                              >
                                {blog.reviewNotes}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-ivory/40">
                          {blog.publishedAt} • {blog.readTime}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-widest ${
                              blog.isFeatured
                                ? "bg-champagne-gold/10 text-champagne-gold border border-champagne-gold/20"
                                : "bg-white/5 text-ivory/40"
                            }`}
                          >
                            {blog.isFeatured ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="p-4">
                          {blog.pendingReview ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] uppercase tracking-widest bg-amber-500/10 text-amber-300 border border-amber-500/20 animate-pulse">
                              Pending Review
                            </span>
                          ) : (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-widest ${
                                blog.isActive !== false
                                  ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                                  : "bg-red-500/10 text-red-300 border border-red-500/20"
                              }`}
                            >
                              {blog.isActive !== false ? "Active" : "Inactive"}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          {blog.pendingReview && (
                            <button
                              onClick={() => handleApproveBlog(blog.id)}
                              className="p-2 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 hover:text-emerald-200 rounded-sm bg-lux-black transition-all cursor-pointer inline-flex items-center"
                              title="Approve & Publish"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEditBlog(blog)}
                            className="p-2 border border-white/[0.08] hover:border-champagne-gold text-ivory hover:text-champagne-gold rounded-sm bg-lux-black transition-all cursor-pointer inline-flex items-center"
                            title="Edit Post"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBlog(blog.id, blog.slug, blog.title)}
                            className="p-2 border border-white/[0.08] hover:border-red-500 text-ivory hover:text-red-400 rounded-sm bg-lux-black transition-all cursor-pointer inline-flex items-center"
                            title={blog.pendingReview ? "Discard Draft" : "Delete Post"}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={`/blog/${blog.slug}`}
                            target="_blank"
                            className="p-2 border border-white/[0.08] hover:border-white text-ivory hover:text-white rounded-sm bg-lux-black transition-all cursor-pointer inline-flex items-center"
                            title="View Public Post"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 4.5: HOME PAGE */}
          {activeTab === "home" && (
            <form onSubmit={handleSaveHomeContent} className="space-y-6">
              <div className="flex justify-between items-center border-b border-white/[0.06] pb-4">
                <p className="text-xs text-ivory/40">
                  Manage key text content, media assets, statistics, and virtual walkthroughs for the Home Page.
                </p>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 bg-champagne-gold hover:bg-antique-gold disabled:bg-champagne-gold/40 text-lux-black font-semibold text-xs uppercase tracking-wider rounded-sm transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>

              <div className="bg-soft-black border border-white/[0.06] rounded-sm p-6 space-y-6">
                <h3 className="text-sm font-display uppercase tracking-wider text-champagne-gold font-medium border-b border-white/[0.06] pb-2">
                  Hero Section Text
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                  <div className="space-y-1">
                    <label className="block text-[9px] uppercase tracking-wider text-ivory/40">Headline Line 1</label>
                    <input
                      type="text"
                      required
                      value={homeContent.heroHeadline1}
                      onChange={(e) => setHomeContent((p: any) => ({ ...p, heroHeadline1: e.target.value }))}
                      placeholder="e.g. Trust what"
                      className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-sm px-3 py-2 rounded-sm focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] uppercase tracking-wider text-ivory/40">Headline Line 2 (Gold highlight)</label>
                    <input
                      type="text"
                      required
                      value={homeContent.heroHeadline2}
                      onChange={(e) => setHomeContent((p: any) => ({ ...p, heroHeadline2: e.target.value }))}
                      placeholder="e.g. most luxury buyers"
                      className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-sm px-3 py-2 rounded-sm focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] uppercase tracking-wider text-ivory/40">Headline Line 3</label>
                    <input
                      type="text"
                      required
                      value={homeContent.heroHeadline3}
                      onChange={(e) => setHomeContent((p: any) => ({ ...p, heroHeadline3: e.target.value }))}
                      placeholder="e.g. have trusted."
                      className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-sm px-3 py-2 rounded-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="block text-[9px] uppercase tracking-wider text-ivory/40">Hero Subheadline</label>
                  {renderTextToolbar("heroSubhead")}
                  <textarea
                    id="heroSubhead"
                    rows={2}
                    required
                    value={homeContent.heroSubhead}
                    onChange={(e) => setHomeContent((p: any) => ({ ...p, heroSubhead: e.target.value }))}
                    placeholder="A private advisory for those who seek..."
                    className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-xs px-3 py-2 rounded-sm focus:outline-none font-sans"
                  />
                </div>
              </div>

              {/* Hero Background Media */}
              <div className="bg-soft-black border border-white/[0.06] rounded-sm p-6 space-y-6">
                <h3 className="text-sm font-display uppercase tracking-wider text-champagne-gold font-medium border-b border-white/[0.06] pb-2">
                  Hero Background Media
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="block text-[9px] uppercase tracking-wider text-ivory/40">Hero Background Video URL (.mp4)</label>
                      {uploadingHeroVideo && (
                        <span className="flex items-center gap-1 text-[9px] text-champagne-gold">
                          <Loader2 className="w-3 h-3 animate-spin" /> Uploading Video...
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={homeContent.heroVideoUrl || ""}
                        onChange={(e) => setHomeContent((p: any) => ({ ...p, heroVideoUrl: e.target.value }))}
                        placeholder="Leave blank to use default video, or enter URL..."
                        className="flex-1 bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-sm px-3 py-2 rounded-sm focus:outline-none font-mono"
                      />
                      <label className="px-3 py-2 border border-white/10 hover:border-champagne-gold bg-lux-black hover:text-champagne-gold text-[10px] uppercase tracking-wider font-semibold rounded-sm transition-all cursor-pointer flex items-center gap-1 flex-shrink-0">
                        <Upload className="w-3 h-3" />
                        Upload
                        <input
                          type="file"
                          accept="video/mp4,video/quicktime,video/*"
                          className="hidden"
                          onChange={handleUploadHeroVideo}
                        />
                      </label>
                    </div>
                    <p className="text-[9px] text-ivory/30 mt-1">Upload your video here.</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="block text-[9px] uppercase tracking-wider text-ivory/40">Hero Fallback Poster Image URL</label>
                      {uploadingHeroPoster && (
                        <span className="flex items-center gap-1 text-[9px] text-champagne-gold">
                          <Loader2 className="w-3 h-3 animate-spin" /> Uploading Image...
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={homeContent.heroPosterUrl || ""}
                        onChange={(e) => setHomeContent((p: any) => ({ ...p, heroPosterUrl: e.target.value }))}
                        placeholder="Leave blank to use default poster, or enter URL..."
                        className="flex-1 bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-sm px-3 py-2 rounded-sm focus:outline-none font-mono"
                      />
                      <label className="px-3 py-2 border border-white/10 hover:border-champagne-gold bg-lux-black hover:text-champagne-gold text-[10px] uppercase tracking-wider font-semibold rounded-sm transition-all cursor-pointer flex items-center gap-1 flex-shrink-0">
                        <Upload className="w-3 h-3" />
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleUploadHeroPoster}
                        />
                      </label>
                    </div>
                    <p className="text-[9px] text-ivory/30 mt-1">Fallback static image displayed on slow connections or low-power modes.</p>
                  </div>
                </div>
              </div>

              <div className="bg-soft-black border border-white/[0.06] rounded-sm p-6 space-y-4">
                <h3 className="text-sm font-display uppercase tracking-wider text-champagne-gold font-medium border-b border-white/[0.06] pb-2">
                  Advisory Positioning Statement
                </h3>
                <div className="space-y-1 text-xs">
                  <label className="block text-[9px] uppercase tracking-wider text-ivory/40">Positioning Statement Text</label>
                  {renderTextToolbar("positioningStatement")}
                  <textarea
                    id="positioningStatement"
                    rows={3}
                    required
                    value={homeContent.positioningStatement}
                    onChange={(e) => setHomeContent((p: any) => ({ ...p, positioningStatement: e.target.value }))}
                    placeholder="PIKORUA is a private gateway..."
                    className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-xs px-3 py-2 rounded-sm focus:outline-none font-sans leading-relaxed"
                  />
                </div>
              </div>

              {/* Company Ticker Statistics */}
              <div className="bg-soft-black border border-white/[0.06] rounded-sm p-6 space-y-4">
                <h3 className="text-sm font-display uppercase tracking-wider text-champagne-gold font-medium border-b border-white/[0.06] pb-2">
                  Company Ticker Statistics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
                  {(homeContent.stats || []).map((stat: any, idx: number) => (
                    <div key={idx} className="space-y-3 bg-lux-black/45 p-4 border border-white/[0.04] rounded-sm">
                      <div className="font-mono text-[9px] text-champagne-gold uppercase">Stat #{idx + 1}</div>
                      <div className="space-y-1">
                        <label className="block text-[8px] uppercase tracking-wider text-ivory/30">Number / Value</label>
                        <input
                          type="text"
                          required
                          value={stat.value}
                          onChange={(e) => {
                            const newStats = [...(homeContent.stats || [])];
                            newStats[idx] = { ...stat, value: e.target.value };
                            setHomeContent((p: any) => ({ ...p, stats: newStats }));
                          }}
                          placeholder="e.g. 11+"
                          className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-xs px-2.5 py-1.5 rounded-sm focus:outline-none font-semibold text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[8px] uppercase tracking-wider text-ivory/30">Label</label>
                        <input
                          type="text"
                          required
                          value={stat.label}
                          onChange={(e) => {
                            const newStats = [...(homeContent.stats || [])];
                            newStats[idx] = { ...stat, label: e.target.value };
                            setHomeContent((p: any) => ({ ...p, stats: newStats }));
                          }}
                          placeholder="e.g. Years of Trust"
                          className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-xs px-2.5 py-1.5 rounded-sm focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Virtual Property Tours */}
              <div className="bg-soft-black border border-white/[0.06] rounded-sm p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-white/[0.06] pb-2">
                  <h3 className="text-sm font-display uppercase tracking-wider text-champagne-gold font-medium">
                    Virtual Property Tours (YouTube Walkthroughs)
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      console.log("Add Tour Video clicked, current virtualTours:", homeContent.virtualTours);
                      setHomeContent((p: any) => {
                        const newTours = [...(p?.virtualTours || []), { id: "", title: "", subtitle: "", location: "Ahmedabad" }];
                        console.log("Setting virtualTours to:", newTours);
                        return {
                          ...p,
                          virtualTours: newTours,
                        };
                      });
                    }}
                    className="inline-flex items-center gap-1.5 border border-champagne-gold/25 hover:border-champagne-gold bg-lux-black hover:text-champagne-gold text-[10px] uppercase tracking-wider font-semibold py-1.5 px-3 rounded-sm transition-all cursor-pointer text-ivory"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Tour Video
                  </button>
                </div>

                <div className="space-y-4">
                  {(homeContent.virtualTours || []).map((tour: any, idx: number) => (
                    <div key={idx} className="flex gap-4 items-end bg-lux-black/45 p-4 border border-white/[0.04] rounded-sm text-xs relative group/tour">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[8px] uppercase tracking-wider text-ivory/30">YouTube Video ID</label>
                          <input
                            type="text"
                            required
                            value={tour.id}
                            onChange={(e) => {
                              const newTours = [...(homeContent.virtualTours || [])];
                              newTours[idx] = { ...tour, id: e.target.value };
                              setHomeContent((p: any) => ({ ...p, virtualTours: newTours }));
                            }}
                            placeholder="e.g. G17NU0mliT4"
                            className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-xs px-2.5 py-1.5 rounded-sm focus:outline-none font-mono text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[8px] uppercase tracking-wider text-ivory/30">City / Header Label</label>
                          <input
                            type="text"
                            value={tour.location !== undefined ? tour.location : "Ahmedabad"}
                            onChange={(e) => {
                              const newTours = [...(homeContent.virtualTours || [])];
                              newTours[idx] = { ...tour, location: e.target.value };
                              setHomeContent((p: any) => ({ ...p, virtualTours: newTours }));
                            }}
                            placeholder="e.g. Ahmedabad (blank to hide)"
                            className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-xs px-2.5 py-1.5 rounded-sm focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[8px] uppercase tracking-wider text-ivory/30">Title / Location Label</label>
                          <input
                            type="text"
                            value={tour.title}
                            onChange={(e) => {
                              const newTours = [...(homeContent.virtualTours || [])];
                              newTours[idx] = { ...tour, title: e.target.value };
                              setHomeContent((p: any) => ({ ...p, virtualTours: newTours }));
                            }}
                            placeholder="e.g. Off Sindhu Bhavan Road"
                            className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-xs px-2.5 py-1.5 rounded-sm focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[8px] uppercase tracking-wider text-ivory/30">Subtitle / Spec Label</label>
                          <input
                            type="text"
                            value={tour.subtitle}
                            onChange={(e) => {
                              const newTours = [...(homeContent.virtualTours || [])];
                              newTours[idx] = { ...tour, subtitle: e.target.value };
                              setHomeContent((p: any) => ({ ...p, virtualTours: newTours }));
                            }}
                            placeholder="e.g. Ultra Luxury 4 BHK"
                            className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-xs px-2.5 py-1.5 rounded-sm focus:outline-none"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newTours = (homeContent.virtualTours || []).filter((_: any, i: number) => i !== idx);
                          setHomeContent((p: any) => ({ ...p, virtualTours: newTours }));
                        }}
                        className="p-1.5 border border-white/10 hover:border-red-500 hover:text-red-400 text-ivory/40 rounded-sm bg-lux-black cursor-pointer transition-all mb-0.5"
                        title="Remove Tour"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {(!homeContent.virtualTours || homeContent.virtualTours.length === 0) && (
                    <div className="text-center py-6 text-ivory/30 text-xs border border-dashed border-white/[0.08] rounded-sm">
                      No virtual tours added. Fallback data will be displayed on the website.
                    </div>
                  )}
                </div>
              </div>

              {/* Developer Alliances (Partner Logos) */}
              <div className="bg-soft-black border border-white/[0.06] rounded-sm p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-white/[0.06] pb-2">
                  <h3 className="text-sm font-display uppercase tracking-wider text-champagne-gold font-medium">
                    Developer Alliances (Partner Logos)
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setHomeContent((p: any) => {
                        const newPartners = [...(p?.partners || []), { name: "", src: "", width: 150, height: 50 }];
                        return {
                          ...p,
                          partners: newPartners,
                        };
                      });
                    }}
                    className="inline-flex items-center gap-1.5 border border-champagne-gold/25 hover:border-champagne-gold bg-lux-black hover:text-champagne-gold text-[10px] uppercase tracking-wider font-semibold py-1.5 px-3 rounded-sm transition-all cursor-pointer text-ivory"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Developer Partner
                  </button>
                </div>

                <div className="space-y-4">
                  {(homeContent.partners || []).map((partner: any, idx: number) => {
                    const handleUploadLogoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      // Load locally first to read dimensions
                      const img = new window.Image();
                      img.src = URL.createObjectURL(file);
                      img.onload = async () => {
                        const width = img.naturalWidth;
                        const height = img.naturalHeight;

                        const formData = new FormData();
                        formData.append("file", file);

                        try {
                          const result = await uploadImageAction(formData);
                          if (result.success && result.url) {
                            const newPartners = [...(homeContent.partners || [])];
                            newPartners[idx] = {
                              ...newPartners[idx],
                              src: result.url,
                              width,
                              height
                            };
                            setHomeContent((p: any) => ({ ...p, partners: newPartners }));
                            alert("Logo uploaded and dimensions updated!");
                          } else {
                            alert("Upload failed: " + (result.error || "Unknown error"));
                          }
                        } catch (err: any) {
                          alert("Upload failed: " + err.message);
                        }
                      };
                    };

                    return (
                      <div key={idx} className="flex gap-4 items-end bg-lux-black/45 p-4 border border-white/[0.04] rounded-sm text-xs relative group/partner">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="space-y-1">
                            <label className="block text-[8px] uppercase tracking-wider text-ivory/30">Developer / Partner Name</label>
                            <input
                              type="text"
                              required
                              value={partner.name}
                              onChange={(e) => {
                                const newPartners = [...(homeContent.partners || [])];
                                newPartners[idx] = { ...partner, name: e.target.value };
                                setHomeContent((p: any) => ({ ...p, partners: newPartners }));
                              }}
                              placeholder="e.g. Swati Procon"
                              className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-xs px-2.5 py-1.5 rounded-sm focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1 md:col-span-2">
                            <label className="block text-[8px] uppercase tracking-wider text-ivory/30">Logo Image URL</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                required
                                value={partner.src}
                                onChange={(e) => {
                                  const newPartners = [...(homeContent.partners || [])];
                                  newPartners[idx] = { ...partner, src: e.target.value };
                                  setHomeContent((p: any) => ({ ...p, partners: newPartners }));
                                }}
                                placeholder="Upload an image or enter URL..."
                                className="flex-1 bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-xs px-2.5 py-1.5 rounded-sm focus:outline-none font-mono"
                              />
                              <label className="px-2.5 py-1.5 border border-white/10 hover:border-champagne-gold bg-lux-black hover:text-champagne-gold text-[9px] uppercase tracking-wider font-semibold rounded-sm transition-all cursor-pointer flex items-center gap-1 flex-shrink-0">
                                <Upload className="w-3 h-3" />
                                Upload
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={handleUploadLogoFile}
                                />
                              </label>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="block text-[8px] uppercase tracking-wider text-ivory/30">Width (px)</label>
                              <input
                                type="number"
                                required
                                value={partner.width}
                                onChange={(e) => {
                                  const newPartners = [...(homeContent.partners || [])];
                                  newPartners[idx] = { ...partner, width: parseInt(e.target.value) || 0 };
                                  setHomeContent((p: any) => ({ ...p, partners: newPartners }));
                                }}
                                placeholder="e.g. 500"
                                className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-xs px-2.5 py-1.5 rounded-sm focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[8px] uppercase tracking-wider text-ivory/30">Height (px)</label>
                              <input
                                type="number"
                                required
                                value={partner.height}
                                onChange={(e) => {
                                  const newPartners = [...(homeContent.partners || [])];
                                  newPartners[idx] = { ...partner, height: parseInt(e.target.value) || 0 };
                                  setHomeContent((p: any) => ({ ...p, partners: newPartners }));
                                }}
                                placeholder="e.g. 150"
                                className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-xs px-2.5 py-1.5 rounded-sm focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const newPartners = (homeContent.partners || []).filter((_: any, i: number) => i !== idx);
                            setHomeContent((p: any) => ({ ...p, partners: newPartners }));
                          }}
                          className="p-1.5 border border-white/10 hover:border-red-500 hover:text-red-400 text-ivory/40 rounded-sm bg-lux-black cursor-pointer transition-all mb-0.5"
                          title="Remove Partner"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                  {(!homeContent.partners || homeContent.partners.length === 0) && (
                    <div className="text-center py-6 text-ivory/30 text-xs border border-dashed border-white/[0.08] rounded-sm">
                      No developer partners added. Default partners will be displayed.
                    </div>
                  )}
                </div>
              </div>
            </form>
          )}

          {/* Tab 5: ABOUT PAGE */}
          {activeTab === "about" && (
            <form onSubmit={handleSaveAboutPage} className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-xs text-ivory/40">
                  Update the About page content, hero details, founder description, and core principles.
                </p>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2 bg-champagne-gold hover:bg-antique-gold text-lux-black font-semibold text-xs uppercase tracking-widest rounded-sm cursor-pointer transition-all inline-flex items-center gap-1.5"
                >
                  {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Changes
                </button>
              </div>

              {/* Hero Section Card */}
              <div className="bg-soft-black border border-white/[0.06] rounded-sm p-6 space-y-4">
                <h3 className="text-sm font-display uppercase tracking-wider text-champagne-gold font-medium border-b border-white/[0.06] pb-2">
                  Hero Header Content
                </h3>
                <div className="grid grid-cols-1 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="block text-[9px] uppercase tracking-wider text-ivory/40">Hero Title</label>
                    <input
                      type="text"
                      required
                      value={aboutContent.heroTitle}
                      onChange={(e) => setAboutContent((p: any) => ({ ...p, heroTitle: e.target.value }))}
                      placeholder="Built on Relationships. Defined by Discretion."
                      className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-sm px-3 py-2 rounded-sm focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] uppercase tracking-wider text-ivory/40">Hero Subtitle/Description</label>
                    {renderTextToolbar("heroDescription")}
                    <textarea
                      id="heroDescription"
                      rows={2}
                      required
                      value={aboutContent.heroDescription}
                      onChange={(e) => setAboutContent((p: any) => ({ ...p, heroDescription: e.target.value }))}
                      placeholder="A private real estate advisory in Ahmedabad..."
                      className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-xs px-3 py-2 rounded-sm focus:outline-none font-sans"
                    />
                  </div>
                </div>
              </div>

              {/* Founder Section Card */}
              <div className="bg-soft-black border border-white/[0.06] rounded-sm p-6 space-y-4">
                <h3 className="text-sm font-display uppercase tracking-wider text-champagne-gold font-medium border-b border-white/[0.06] pb-2">
                  Founder Profile & Story
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="block text-[9px] uppercase tracking-wider text-ivory/40">Founder Name</label>
                      <input
                        type="text"
                        required
                        value={aboutContent.founderName}
                        onChange={(e) => setAboutContent((p: any) => ({ ...p, founderName: e.target.value }))}
                        placeholder="e.g. Jitendra"
                        className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-sm px-3 py-2 rounded-sm focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] uppercase tracking-wider text-ivory/40">Founder Role/Title</label>
                      <input
                        type="text"
                        required
                        value={aboutContent.founderRole}
                        onChange={(e) => setAboutContent((p: any) => ({ ...p, founderRole: e.target.value }))}
                        placeholder="e.g. PIKORUA Realty"
                        className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-sm px-3 py-2 rounded-sm focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="block text-[9px] uppercase tracking-wider text-ivory/40">Founder Portrait Image <span className="text-champagne-gold/70 lowercase font-normal">(recommended: portrait 4:5, e.g. 800x1000px)</span></label>
                        {uploadingAboutAvatar && (
                          <span className="flex items-center gap-1 text-[9px] text-champagne-gold">
                            <Loader2 className="w-3 h-3 animate-spin" /> Uploading...
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={aboutContent.founderAvatar}
                          onChange={(e) => setAboutContent((p: any) => ({ ...p, founderAvatar: e.target.value }))}
                          placeholder="/images/founder.jpg"
                          className="flex-1 bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-xs px-3 py-2 rounded-sm focus:outline-none"
                        />
                        <label className="px-3 py-2 border border-white/10 hover:border-champagne-gold bg-lux-black hover:text-champagne-gold text-[10px] uppercase tracking-wider font-semibold rounded-sm transition-all cursor-pointer flex items-center gap-1 flex-shrink-0">
                          <Upload className="w-3 h-3" />
                          Upload
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleUploadAboutAvatar}
                          />
                        </label>
                      </div>
                      {aboutContent.founderAvatar && (
                        <div className="relative w-20 aspect-[4/5] mt-2 rounded-sm overflow-hidden border border-white/10 bg-lux-black">
                          <Image
                            src={aboutContent.founderAvatar}
                            alt="Founder Avatar Preview"
                            fill
                            className="object-cover object-top"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="block text-[9px] uppercase tracking-wider text-ivory/40">Founder Signature Quote</label>
                      {renderTextToolbar("founderQuote")}
                      <textarea
                        id="founderQuote"
                        rows={3}
                        required
                        value={aboutContent.founderQuote}
                        onChange={(e) => setAboutContent((p: any) => ({ ...p, founderQuote: e.target.value }))}
                        placeholder="I started PIKORUA because the finest homes..."
                        className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-xs px-3 py-2 rounded-sm focus:outline-none font-sans"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] uppercase tracking-wider text-ivory/40">
                        Founder Story / Biography (Double-Enter for new paragraphs)
                      </label>
                      {renderTextToolbar("founderStory")}
                      <textarea
                        id="founderStory"
                        rows={5}
                        required
                        value={aboutContent.founderStory}
                        onChange={(e) => setAboutContent((p: any) => ({ ...p, founderStory: e.target.value }))}
                        placeholder="Detail the history, background and approach..."
                        className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-xs px-3 py-2 rounded-sm focus:outline-none font-sans"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Core Principles Section Card */}
              <div className="bg-soft-black border border-white/[0.06] rounded-sm p-6 space-y-4">
                <h3 className="text-sm font-display uppercase tracking-wider text-champagne-gold font-medium border-b border-white/[0.06] pb-2">
                  Core Advisory Principles
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                  {[0, 1, 2].map((idx) => {
                    const principle = aboutContent.principles?.[idx] || { label: "", body: "" };
                    return (
                      <div key={idx} className="space-y-3 bg-lux-black/45 p-4 border border-white/[0.04] rounded-sm">
                        <div className="font-mono text-[9px] text-champagne-gold uppercase">Principle #{idx + 1}</div>
                        <div className="space-y-1">
                          <label className="block text-[8px] uppercase tracking-wider text-ivory/30">Label / Heading</label>
                          <input
                            type="text"
                            value={principle.label}
                            onChange={(e) => {
                              const newPrinciples = [...(aboutContent.principles || [])];
                              newPrinciples[idx] = { ...principle, label: e.target.value };
                              setAboutContent((p: any) => ({ ...p, principles: newPrinciples }));
                            }}
                            placeholder="e.g. Discretion"
                            className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-xs px-2.5 py-1.5 rounded-sm focus:outline-none font-semibold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[8px] uppercase tracking-wider text-ivory/30">Description Body</label>
                          <textarea
                            rows={3}
                            value={principle.body}
                            onChange={(e) => {
                              const newPrinciples = [...(aboutContent.principles || [])];
                              newPrinciples[idx] = { ...principle, body: e.target.value };
                              setAboutContent((p: any) => ({ ...p, principles: newPrinciples }));
                            }}
                            placeholder="Description of the core principle..."
                            className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-xs px-2.5 py-1.5 rounded-sm focus:outline-none font-sans leading-relaxed"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </form>
          )}

          {activeTab === "seo" && (
            <div className="space-y-8">
              <p className="text-xs text-ivory/40">
                Manage search engine optimization (SEO) Meta Tags for core website pages. Customize Meta Titles and Meta Descriptions to optimize how your site displays in search engines.
              </p>

              <div className="grid grid-cols-1 gap-8">
                {Object.keys(seoState).map((id) => {
                  const pageSeo = seoState[id];
                  return (
                    <form
                      key={id}
                      onSubmit={(e) => handleSavePageSeo(id, e)}
                      className="bg-soft-black border border-white/[0.06] rounded-sm p-6 space-y-4"
                    >
                      <div className="flex justify-between items-center border-b border-white/[0.06] pb-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-sm font-display uppercase tracking-wider text-champagne-gold font-medium">
                            {pageSeo.title}
                          </h3>
                          <button
                            type="button"
                            disabled={generatingPageSeo[id]}
                            onClick={() => handleGeneratePageSeo(id)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-champagne-gold/40 text-champagne-gold hover:border-champagne-gold disabled:text-champagne-gold/30 disabled:border-champagne-gold/20 text-[9px] uppercase tracking-wider font-semibold rounded-sm transition-all cursor-pointer disabled:cursor-wait"
                          >
                            {generatingPageSeo[id] ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Flame className="w-3 h-3" />
                                AI Auto-Generate
                              </>
                            )}
                          </button>
                        </div>
                        <button
                          type="submit"
                          disabled={actionLoading}
                          className="px-4 py-1.5 bg-champagne-gold hover:bg-antique-gold disabled:bg-champagne-gold/40 text-lux-black font-semibold text-[10px] uppercase tracking-widest rounded-sm cursor-pointer transition-all inline-flex items-center gap-1.5"
                        >
                          {actionLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                          Update Settings
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <label className="block text-[9px] uppercase tracking-wider text-ivory/40 font-light">Meta Title</label>
                            <span className={(pageSeo.seoTitle || "").length > 70 ? "text-red-400 animate-pulse" : "text-ivory/30 font-sans"}>
                              {(pageSeo.seoTitle || "").length}/70 chars
                            </span>
                          </div>
                          <input
                            type="text"
                            value={pageSeo.seoTitle}
                            onChange={(e) =>
                              setSeoState((prev) => ({
                                ...prev,
                                [id]: { ...prev[id], seoTitle: e.target.value },
                              }))
                            }
                            placeholder="Enter custom SEO title tag..."
                            className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-xs px-3 py-2 rounded-sm focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <label className="block text-[9px] uppercase tracking-wider text-ivory/40 font-light">Meta Description</label>
                            <span className={(pageSeo.seoDescription || "").length > 160 ? "text-red-400 animate-pulse" : "text-ivory/30 font-sans"}>
                              {(pageSeo.seoDescription || "").length}/160 chars
                            </span>
                          </div>
                          <textarea
                            rows={2}
                            value={pageSeo.seoDescription}
                            onChange={(e) =>
                              setSeoState((prev) => ({
                                ...prev,
                                [id]: { ...prev[id], seoDescription: e.target.value },
                              }))
                            }
                            placeholder="Enter custom SEO description meta tag..."
                            className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-xs px-3 py-2 rounded-sm focus:outline-none font-sans"
                          />
                        </div>
                      </div>
                    </form>
                  );
                })}
              </div>

              {/* ── Best Practices Guide ────────────────────────────── */}
              <div className="mt-10 space-y-6">
                <div className="border-b border-white/[0.06] pb-3">
                  <h2 className="font-display text-sm tracking-[0.2em] text-champagne-gold uppercase">Best Practices — SEO · GEO · AEO</h2>
                  <p className="text-[9px] text-ivory/30 mt-1 uppercase tracking-wider">Reference guide for every time you publish new content</p>
                </div>

                {/* Checklist cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  {/* SEO Card */}
                  <div className="bg-soft-black border border-white/[0.06] rounded-sm p-5 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400/80" />
                      <h3 className="text-[10px] uppercase tracking-widest text-blue-300 font-semibold">SEO</h3>
                      <span className="text-[8px] text-ivory/30 uppercase tracking-wider">Search Engine</span>
                    </div>
                    {[
                      { label: "Meta Title", tip: "60 chars max. Include main keyword + \"Ahmedabad\" or location" },
                      { label: "Meta Description", tip: "150 chars. One sentence with a benefit. Avoid generic phrases." },
                      { label: "Slug / URL", tip: "Hyphens, lowercase, keyword-first (e.g. luxury-flats-sindhu-bhavan)" },
                      { label: "Cover Image", tip: "Real photo, not stock. Alt text is auto-set from title." },
                      { label: "Internal Links", tip: "Link from 1–2 older posts to every new post you publish" },
                      { label: "Google Indexing", tip: "Go to Search Console → paste URL → Request Indexing (do this every time)" },
                    ].map((item) => (
                      <div key={item.label} className="border-l border-blue-400/20 pl-3">
                        <p className="text-[9px] font-semibold text-ivory/80 uppercase tracking-wider">{item.label}</p>
                        <p className="text-[9px] text-ivory/40 leading-relaxed mt-0.5">{item.tip}</p>
                      </div>
                    ))}
                  </div>

                  {/* GEO Card */}
                  <div className="bg-soft-black border border-white/[0.06] rounded-sm p-5 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-champagne-gold/80" />
                      <h3 className="text-[10px] uppercase tracking-widest text-champagne-gold font-semibold">GEO</h3>
                      <span className="text-[8px] text-ivory/30 uppercase tracking-wider">Generative Engine</span>
                    </div>
                    {[
                      { label: "Open with a Direct Answer", tip: "First paragraph answers the post title directly. AI engines pull these as citations." },
                      { label: "Use Specific Data", tip: "₹ amounts, sq ft, possession date, exact road name. Vague content is never cited." },
                      { label: "Name Entities", tip: "Project name, builder, exact location (Sindhu Bhavan Rd, SG Highway) — not just 'Ahmedabad'" },
                      { label: "FAQs Section", tip: "3–5 Q&As at the bottom. LLMs love structured Q&A for direct citation." },
                      { label: "Social Sharing", tip: "Post on LinkedIn + Instagram after publishing. Social signals help AI engines surface content." },
                      { label: "Freshness", tip: "Update possession dates, prices, and availability when they change." },
                    ].map((item) => (
                      <div key={item.label} className="border-l border-champagne-gold/20 pl-3">
                        <p className="text-[9px] font-semibold text-ivory/80 uppercase tracking-wider">{item.label}</p>
                        <p className="text-[9px] text-ivory/40 leading-relaxed mt-0.5">{item.tip}</p>
                      </div>
                    ))}
                  </div>

                  {/* AEO Card */}
                  <div className="bg-soft-black border border-white/[0.06] rounded-sm p-5 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
                      <h3 className="text-[10px] uppercase tracking-widest text-emerald-300 font-semibold">AEO</h3>
                      <span className="text-[8px] text-ivory/30 uppercase tracking-wider">Answer Engine</span>
                    </div>
                    {[
                      { label: "FAQs with Schema", tip: "FAQs you add here get published as JSON-LD — eligible for Google FAQ rich results" },
                      { label: "Question-format Headings", tip: "Use headings like 'What is the price of…' — these become featured snippet candidates" },
                      { label: "Short Direct Answers", tip: "Under each heading, write the answer in ≤2 sentences before elaborating" },
                      { label: "Number Lists", tip: "'Top 5 reasons...' or '3 things to know...' — voice and AI assistants prefer numbered formats" },
                      { label: "Local Specificity", tip: "Include pin codes, landmarks, and neighbourhood names — critical for voice search (Alexa, Siri)" },
                      { label: "Review / Testimonials", tip: "Each testimonial added to the site adds credibility signals AEO systems weigh" },
                    ].map((item) => (
                      <div key={item.label} className="border-l border-emerald-400/20 pl-3">
                        <p className="text-[9px] font-semibold text-ivory/80 uppercase tracking-wider">{item.label}</p>
                        <p className="text-[9px] text-ivory/40 leading-relaxed mt-0.5">{item.tip}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Publishing checklist */}
                <div className="bg-soft-black border border-white/[0.06] rounded-sm p-5">
                  <h3 className="text-[9px] uppercase tracking-widest text-ivory/50 font-semibold mb-4">Every-time publishing checklist</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    {[
                      "✦  Fill Meta Title (≤60 chars, keyword + location)",
                      "✦  Fill Meta Description (≤150 chars, 1 benefit sentence)",
                      "✦  Set a keyword-rich slug (no special characters)",
                      "✦  Upload a real cover image (no stock photos)",
                      "✦  Add 3–5 FAQs in the FAQ section",
                      "✦  Check excerpt reads naturally",
                      "✦  First paragraph answers the post title directly",
                      "✦  Include at least 3 specific facts (₹, sq ft, date, location)",
                      "✦  Request indexing in Google Search Console",
                      "✦  Share on LinkedIn & Instagram after publishing",
                      "✦  Add 1 internal link from an older post",
                      "✦  Update prices / dates whenever market changes",
                    ].map((item) => (
                      <p key={item} className="text-[9px] text-ivory/50 leading-relaxed">{item}</p>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Google Indexing API Automation ── */}
              <div className="mt-8 bg-soft-black border border-white/[0.06] rounded-sm p-6 space-y-4">
                <div className="border-b border-white/[0.06] pb-3">
                  <h3 className="font-display text-sm tracking-[0.2em] text-champagne-gold uppercase">
                    ⚡ Google Indexing API Console
                  </h3>
                  <p className="text-[9px] text-ivory/30 mt-1 uppercase tracking-wider">
                    Auto-ping Google search bots to index your properties and blogs instantly
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
                  <div className="space-y-3">
                    <p className="text-ivory/70">
                      This site automatically triggers a background request to Google's Search index whenever you save properties or publish AI-drafted blogs, reducing indexing time from days to just a few hours.
                    </p>
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-sm p-3 font-mono text-[9px] text-ivory/50 space-y-1.5">
                      <span className="block text-[8px] uppercase tracking-wider text-ivory/30">Setup Requirements:</span>
                      <p>1. Create a Google Cloud project & enable the <strong className="text-champagne-gold">Web Search Indexing API</strong>.</p>
                      <p>2. Create a Service Account & download the private key JSON file.</p>
                      <p>3. Add the Service Account email as an <strong className="text-champagne-gold">Owner</strong> in Search Console (https://pikorua.in).</p>
                      <p>4. Set the key JSON contents as the <strong className="text-champagne-gold">GOOGLE_SERVICE_ACCOUNT_JSON</strong> environment variable.</p>
                    </div>
                  </div>

                  <form onSubmit={handleRunIndexingTest} className="bg-lux-black border border-white/[0.04] p-4 rounded-sm space-y-3">
                    <span className="block text-[9px] uppercase tracking-wider text-champagne-gold font-semibold">Test Connection Diagnostic</span>
                    
                    <div className="space-y-1">
                      <label className="block text-[8px] uppercase tracking-wider text-ivory/40">Target Test URL</label>
                      <input
                        type="url"
                        value={testIndexingUrl}
                        onChange={(e) => setTestIndexingUrl(e.target.value)}
                        className="w-full bg-soft-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-xs px-2.5 py-1.5 rounded-sm focus:outline-none"
                        required
                        placeholder="https://pikorua.in"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={testingIndexing}
                      className="w-full py-2 bg-champagne-gold hover:bg-antique-gold disabled:bg-champagne-gold/30 text-lux-black font-semibold text-[9px] uppercase tracking-widest rounded-sm cursor-pointer transition-all flex items-center justify-center gap-1.5"
                    >
                      {testingIndexing ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Testing Connection...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          Run Test Submission
                        </>
                      )}
                    </button>

                    {indexingTestResult && (
                      <div className={`p-3 rounded-sm text-[10px] ${
                        indexingTestResult.success 
                          ? "bg-emerald-950/20 border border-emerald-500/20 text-emerald-400" 
                          : "bg-red-950/20 border border-red-500/20 text-red-400"
                      }`}>
                        {indexingTestResult.success ? (
                          <p><strong>Success!</strong> Google API successfully authorized and scheduled the URL update for crawl.</p>
                        ) : (
                          <div className="space-y-1.5">
                            <p><strong>Failed:</strong> {indexingTestResult.error}</p>
                            {indexingTestResult.instructions && (
                              <div className="mt-2 text-[9px] border-t border-red-500/10 pt-1.5 space-y-1 font-sans text-ivory/50">
                                {indexingTestResult.instructions.map((inst: string) => (
                                  <p key={inst}>{inst}</p>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </form>
                </div>
              </div>

            </div>
          )}

          {activeTab === "faqs" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-white/[0.06] pb-5">
                <div>
                  <h1 className="font-display text-lg tracking-widest text-white uppercase">
                    General & Page FAQs
                  </h1>
                  <p className="text-[10px] text-champagne-gold/60 mt-1 uppercase tracking-wider">
                    Manage FAQs displayed on the Contact page, Properties grid page, and other general sections
                  </p>
                </div>
                <button
                  onClick={handleOpenAddGeneralFaq}
                  className="inline-flex items-center gap-2 bg-champagne-gold/10 hover:bg-champagne-gold/20 text-champagne-gold text-[10px] uppercase tracking-wider font-semibold border border-champagne-gold/30 px-4 py-2.5 rounded-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add New FAQ
                </button>
              </div>

              {generalFaqs.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-white/[0.06] rounded-sm">
                  <p className="text-sm text-ivory/30 italic">No general FAQs found in database.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {generalFaqs.map((faq) => (
                    <div
                      key={faq.id}
                      className="bg-soft-black border border-white/[0.06] p-5 rounded-sm flex flex-col md:flex-row md:items-start justify-between gap-4"
                    >
                      <div className="space-y-2 flex-grow">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[9px] px-2 py-0.5 bg-champagne-gold/10 text-champagne-gold uppercase tracking-wider font-medium rounded-sm border border-champagne-gold/20">
                            {faq.category}
                          </span>
                          <span className="text-[9px] text-ivory/40 uppercase tracking-wider font-sans">
                            Order: {faq.display_order}
                          </span>
                        </div>
                        <h3 className="font-sans text-sm text-white font-normal leading-snug">
                          {faq.question}
                        </h3>
                        <p className="text-xs text-ivory/60 leading-relaxed font-sans pr-4">
                          {faq.answer}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-start">
                        <button
                          onClick={() => handleOpenEditGeneralFaq(faq)}
                          className="p-2 border border-white/10 hover:border-champagne-gold/40 text-ivory/60 hover:text-champagne-gold rounded-sm bg-lux-black cursor-pointer transition-all"
                          title="Edit FAQ"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteGeneralFaq(faq.id, faq.question)}
                          className="p-2 border border-white/10 hover:border-red-500/40 text-ivory/60 hover:text-red-400 rounded-sm bg-lux-black cursor-pointer transition-all"
                          title="Delete FAQ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ── Lead Detail Modal ── */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedLead(null)} />
          <div className="popup-mobile-surface relative w-full max-w-xl bg-soft-black border border-white/[0.08] rounded-lg p-6 sm:p-8 max-h-[90dvh] overflow-y-auto z-10 shadow-2xl">
            <div className="flex justify-between items-start border-b border-white/[0.06] pb-4 mb-6">
              <div>
                <h3 className="font-display text-base tracking-widest uppercase text-white">
                  Lead Details
                </h3>
                <p className="text-[10px] text-champagne-gold uppercase tracking-widest mt-1">
                  Submitted: {new Date(selectedLead.created_at).toLocaleString("en-IN")}
                </p>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-1.5 border border-white/10 hover:border-white/20 hover:text-white text-ivory/60 rounded-sm bg-lux-black cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-6 text-sm font-sans">
              {/* Contact info cards */}
              <div className="grid grid-cols-2 gap-4 bg-white/[0.02] p-4 border border-white/[0.04] rounded-sm">
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-ivory/40 mb-1">
                    Client Name
                  </span>
                  <span className="font-medium text-white">{selectedLead.name}</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-ivory/40 mb-1">
                    Phone Number
                  </span>
                  <span className="font-medium text-white font-mono">{selectedLead.phone}</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-ivory/40 mb-1">
                    WhatsApp
                  </span>
                  <span className="font-medium text-white font-mono">
                    {selectedLead.whatsapp || "Not Provided"}
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-ivory/40 mb-1">
                    Email Address
                  </span>
                  <span className="font-medium text-white truncate block">
                    {selectedLead.email || "Not Provided"}
                  </span>
                </div>
              </div>

              {/* Preferences / Intake Responses */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase tracking-wider text-champagne-gold font-medium border-b border-white/[0.04] pb-1.5">
                  Preferences & Selection
                </h4>
                <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-ivory/40 mb-0.5">
                      Residential Category
                    </span>
                    <span className="capitalize">{selectedLead.category || "Not Specified"}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-ivory/40 mb-0.5">
                      Preferred Location
                    </span>
                    <span className="capitalize">{selectedLead.location || "Not Specified"}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-ivory/40 mb-0.5">
                      Budget Range
                    </span>
                    <span>{selectedLead.budget_band || "Not Specified"}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-ivory/40 mb-0.5">
                      Purchase Intent / Purpose
                    </span>
                    <span className="capitalize">{selectedLead.purpose || "Not Specified"}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-ivory/40 mb-0.5">
                      Timeline
                    </span>
                    <span className="capitalize">{selectedLead.timeline || "Not Specified"}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-ivory/40 mb-0.5">
                      Preferred Callback Time
                    </span>
                    <span>{selectedLead.preferred_callback_time || "Anytime"}</span>
                  </div>
                </div>
              </div>

              {/* Custom Message */}
              {selectedLead.message && (
                <div className="space-y-2">
                  <h4 className="text-xs uppercase tracking-wider text-champagne-gold font-medium border-b border-white/[0.04] pb-1.5">
                    Client Message
                  </h4>
                  <p className="text-xs font-light text-ivory/80 leading-relaxed bg-white/[0.01] p-3 border border-white/[0.02] rounded-sm">
                    {selectedLead.message}
                  </p>
                </div>
              )}

              {/* Consultation Details */}
              {selectedLead.consultation_bookings && selectedLead.consultation_bookings.length > 0 && (
                <div className="space-y-3 bg-champagne-gold/5 p-4 border border-champagne-gold/15 rounded-sm">
                  <h4 className="text-xs uppercase tracking-wider text-champagne-gold font-semibold">
                    Requested Private Consultation
                  </h4>
                  <div className="grid grid-cols-2 gap-y-2 text-xs">
                    <div>
                      <span className="block text-[9px] uppercase text-ivory/40 mb-0.5">Date</span>
                      <span className="text-white font-medium">
                        {selectedLead.consultation_bookings[0].preferred_date || "Any date"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase text-ivory/40 mb-0.5">Time Slot</span>
                      <span className="text-white font-medium">
                        {selectedLead.consultation_bookings[0].preferred_time || "Any time"}
                      </span>
                    </div>
                  </div>
                  {selectedLead.consultation_bookings[0].notes && (
                    <div className="mt-2 text-xs border-t border-champagne-gold/10 pt-2 text-ivory/80">
                      <span className="block text-[9px] uppercase text-ivory/40 mb-1">Meeting Notes</span>
                      {selectedLead.consultation_bookings[0].notes}
                    </div>
                  )}
                </div>
              )}

              {/* Property Details */}
              {selectedLead.property_enquiries && selectedLead.property_enquiries.length > 0 && (
                <div className="space-y-2 bg-white/[0.02] p-4 border border-white/[0.04] rounded-sm">
                  <h4 className="text-xs uppercase tracking-wider text-champagne-gold font-medium">
                    Property Inquiry
                  </h4>
                  <div className="text-xs">
                    <span className="block text-[9px] uppercase text-ivory/40 mb-0.5">Reference Property</span>
                    <a
                      href={`/properties/${selectedLead.property_enquiries[0].property_ref}`}
                      target="_blank"
                      className="text-white font-medium hover:underline inline-flex items-center gap-1.5"
                    >
                      {selectedLead.property_enquiries[0].property_ref}
                      <ExternalLink className="w-3 h-3 text-champagne-gold" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-white/[0.06] pt-6 mt-6 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-ivory/40 uppercase tracking-widest">Update Status</span>
                <select
                  value={selectedLead.status}
                  onChange={(e) => handleStatusChange(selectedLead.id, e.target.value)}
                  className="text-xs font-sans uppercase tracking-wider px-3 py-1.5 bg-lux-black border border-white/[0.1] rounded-sm focus:outline-none focus:border-champagne-gold cursor-pointer text-white"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={waReplyLead?.id === selectedLead.id && loadingWaReply}
                  onClick={() => handleWhatsAppAiReply(selectedLead)}
                  className="px-4 py-2 border border-emerald-500 hover:border-emerald-400 text-emerald-400 hover:text-emerald-300 bg-emerald-950/20 text-xs font-sans uppercase tracking-wider rounded-sm cursor-pointer transition-all flex items-center gap-1.5 disabled:cursor-wait disabled:opacity-50"
                >
                  {waReplyLead?.id === selectedLead.id && loadingWaReply ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  WhatsApp AI Reply
                </button>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="px-5 py-2 bg-white/5 border border-white/10 hover:border-white/20 text-xs font-sans uppercase tracking-wider rounded-sm cursor-pointer hover:text-white transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── WhatsApp AI Reply Edit Modal ── */}
      {waReplyLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => { setWaReplyLead(null); setWaReplyMessage(""); }} />
          <div className="relative w-full max-w-lg bg-soft-black border border-white/[0.08] rounded-lg p-6 z-10 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex justify-between items-start border-b border-white/[0.06] pb-3">
              <div>
                <h3 className="font-display text-xs tracking-widest uppercase text-white">
                  Review & Edit AI Reply
                </h3>
                <p className="text-[9px] text-champagne-gold uppercase tracking-widest mt-1">
                  Recipient: {waReplyLead.name} ({waReplyLead.phone})
                </p>
              </div>
              <button
                onClick={() => { setWaReplyLead(null); setWaReplyMessage(""); }}
                className="p-1.5 border border-white/10 hover:border-white/20 hover:text-white text-ivory/60 rounded-sm bg-lux-black cursor-pointer transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-[9px] uppercase tracking-wider text-ivory/40">WhatsApp Message text (Click inside to customize)</label>
              {loadingWaReply ? (
                <div className="w-full min-h-[120px] bg-lux-black border border-white/[0.08] rounded-sm flex flex-col items-center justify-center gap-2 text-ivory/30 text-xs py-10">
                  <Loader2 className="w-5 h-5 animate-spin text-champagne-gold" />
                  <span>Drafting conversational reply...</span>
                </div>
              ) : (
                <textarea
                  rows={5}
                  value={waReplyMessage}
                  onChange={(e) => setWaReplyMessage(e.target.value)}
                  className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-xs px-3 py-2.5 rounded-sm focus:outline-none font-sans leading-relaxed"
                  placeholder="AI draft loading..."
                />
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setWaReplyLead(null); setWaReplyMessage(""); }}
                className="px-4 py-1.5 bg-white/5 border border-white/10 hover:border-white/20 text-[10px] font-sans uppercase tracking-wider rounded-sm cursor-pointer hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loadingWaReply || !waReplyMessage}
                onClick={sendWhatsAppMessage}
                className="px-5 py-1.5 bg-emerald-600 border border-emerald-500 hover:bg-emerald-500 text-white text-[10px] font-sans uppercase tracking-wider rounded-sm cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Send on WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Property Modal Form ── */}
      {isPropertyModalOpen && editingProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsPropertyModalOpen(false)} />
          <div className="popup-mobile-surface relative w-full max-w-3xl bg-soft-black border border-white/[0.08] rounded-lg p-6 sm:p-8 max-h-[90dvh] overflow-y-auto z-10 shadow-2xl">
            <div className="flex justify-between items-start border-b border-white/[0.06] pb-4 mb-6">
              <h3 className="font-display text-base tracking-widest uppercase text-white">
                {editingProperty.name ? `Edit: ${editingProperty.name}` : "Add New Curated Property"}
              </h3>
              <button
                onClick={() => setIsPropertyModalOpen(false)}
                className="p-1.5 border border-white/10 hover:border-white/20 hover:text-white text-ivory/60 rounded-sm bg-lux-black cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProperty} className="space-y-6 text-xs font-sans">
              {/* Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider text-ivory/40">Property Name*</label>
                  <input
                    type="text"
                    required
                    value={editingProperty.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setEditingProperty((p: any) => ({ ...p, name }));
                    }}
                    placeholder="e.g. Swati Senor"
                    className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-sm px-3 py-2 rounded-sm focus:outline-none focus:ring-1 focus:ring-champagne-gold/30 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider text-ivory/40">URL Slug*</label>
                  <input
                    type="text"
                    required
                    value={editingProperty.slug}
                    onChange={(e) => setEditingProperty((p: any) => ({ ...p, slug: e.target.value }))}
                    placeholder="e.g. swati-senor"
                    className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-sm px-3 py-2 rounded-sm focus:outline-none focus:ring-1 focus:ring-champagne-gold/30 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider text-ivory/40">Category*</label>
                  <select
                    value={editingProperty.category}
                    onChange={(e) => setEditingProperty((p: any) => ({ ...p, category: e.target.value }))}
                    className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-sm px-3 py-2 rounded-sm focus:outline-none focus:ring-1 focus:ring-champagne-gold/30 transition-all cursor-pointer"
                  >
                    <option value="apartment">Apartment</option>
                    <option value="penthouse">Penthouse</option>
                    <option value="duplex">Duplex</option>
                    <option value="villa">Villa</option>
                    <option value="bungalow">Bungalow</option>
                    <option value="plot">Premium Plot</option>
                    <option value="residential-investment">Investment Property</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider text-ivory/40">Location Corridor*</label>
                  <select
                    value={editingProperty.location}
                    onChange={(e) => {
                      const loc = e.target.value;
                      const labels: Record<string, string> = {
                        "iskon-ambli": "Iskon-Ambli Road",
                        "sindhu-bhavan": "Sindhu Bhavan Road",
                        thaltej: "Thaltej",
                        shilaj: "Shilaj",
                        "vaishno-devi": "Vaishno Devi",
                        "sg-highway": "SG Highway",
                        other: "Other",
                      };
                      setEditingProperty((p: any) => {
                        const isNew = p.id && p.id.startsWith("prop-");
                        const newSlug = isNew ? generateDiscreetSlug(p.configuration, p.sizeRange, loc) : p.slug;
                        return {
                          ...p,
                          location: loc,
                          locationLabel: labels[loc] || "Ahmedabad",
                          slug: newSlug,
                        };
                      });
                    }}
                    className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-sm px-3 py-2 rounded-sm focus:outline-none focus:ring-1 focus:ring-champagne-gold/30 transition-all cursor-pointer"
                  >
                    <option value="iskon-ambli">Iskon-Ambli</option>
                    <option value="sindhu-bhavan">Sindhu Bhavan</option>
                    <option value="thaltej">Thaltej</option>
                    <option value="shilaj">Shilaj</option>
                    <option value="vaishno-devi">Vaishno Devi</option>
                    <option value="sg-highway">SG Highway</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider text-ivory/40">Location Label</label>
                  <input
                    type="text"
                    required
                    value={editingProperty.locationLabel}
                    onChange={(e) => setEditingProperty((p: any) => ({ ...p, locationLabel: e.target.value }))}
                    placeholder="e.g. Iskon-Ambli Road"
                    className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-sm px-3 py-2 rounded-sm focus:outline-none focus:ring-1 focus:ring-champagne-gold/30 transition-all"
                  />
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider text-ivory/40">Configuration*</label>
                  <input
                    type="text"
                    required
                    value={editingProperty.configuration}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditingProperty((p: any) => {
                        const isNew = p.id && p.id.startsWith("prop-");
                        const newSlug = isNew ? generateDiscreetSlug(val, p.sizeRange, p.location) : p.slug;
                        return { ...p, configuration: val, slug: newSlug };
                      });
                    }}
                    placeholder="e.g. 4 & 5 BHK · Penthouse · Duplex"
                    className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-sm px-3 py-2 rounded-sm focus:outline-none focus:ring-1 focus:ring-champagne-gold/30 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider text-ivory/40">Size / Dimension Range*</label>
                  <input
                    type="text"
                    required
                    value={editingProperty.sizeRange}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditingProperty((p: any) => {
                        const isNew = p.id && p.id.startsWith("prop-");
                        const newSlug = isNew ? generateDiscreetSlug(p.configuration, val, p.location) : p.slug;
                        return { ...p, sizeRange: val, slug: newSlug };
                      });
                    }}
                    placeholder="e.g. 7,300 – 15,500 sq.ft."
                    className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-sm px-3 py-2 rounded-sm focus:outline-none focus:ring-1 focus:ring-champagne-gold/30 transition-all"
                  />
                </div>
              </div>

              {/* Row 4 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider text-ivory/40">Development Status*</label>
                  <select
                    value={editingProperty.status}
                    onChange={(e) => setEditingProperty((p: any) => ({ ...p, status: e.target.value }))}
                    className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-sm px-3 py-2 rounded-sm focus:outline-none focus:ring-1 focus:ring-champagne-gold/30 transition-all cursor-pointer"
                  >
                    <option value="newly-launched">Newly Launched</option>
                    <option value="sample-ready">Sample Ready</option>
                    <option value="ready-to-move">Ready to Move</option>
                    <option value="near-possession">Near Possession</option>
                    <option value="under-construction">Under Construction</option>
                    <option value="pre-launch">Pre-Launch</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider text-ivory/40">Price / Price Range</label>
                  <input
                    type="text"
                    disabled={editingProperty.priceOnRequest}
                    value={editingProperty.priceOnRequest ? "" : editingProperty.price}
                    onChange={(e) => setEditingProperty((p: any) => ({ ...p, price: e.target.value }))}
                    placeholder="e.g. ₹6.20 Cr – ₹9.50 Cr"
                    className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-sm px-3 py-2 rounded-sm focus:outline-none focus:ring-1 focus:ring-champagne-gold/30 transition-all disabled:opacity-40"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="priceOnRequest"
                    checked={editingProperty.priceOnRequest}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setEditingProperty((p: any) => ({
                        ...p,
                        priceOnRequest: checked,
                        price: checked ? "Price on Request" : "",
                      }));
                    }}
                    className="w-4 h-4 rounded border-white/20 text-champagne-gold focus:ring-champagne-gold bg-lux-black cursor-pointer"
                  />
                  <label htmlFor="priceOnRequest" className="text-[10px] uppercase tracking-wider text-ivory/60 cursor-pointer">
                    Price on Request
                  </label>
                </div>
              </div>

              {/* Cover Image Upload */}
              <div className="bg-white/[0.01] p-4 border border-white/[0.04] rounded-sm space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-[9px] uppercase tracking-wider text-champagne-gold font-medium">Cover Image* <span className="text-white/40 lowercase font-normal">(recommended: landscape 16:9, e.g. 1920x1080px)</span></label>
                  {uploadingImage === "cover" && (
                    <span className="flex items-center gap-1.5 text-[10px] text-champagne-gold">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading image...
                    </span>
                  )}
                </div>
                <div className="flex gap-4 items-center">
                  <input
                    type="text"
                    required
                    value={editingProperty.coverImage}
                    onChange={(e) => setEditingProperty((p: any) => ({ ...p, coverImage: e.target.value }))}
                    placeholder="Upload image or enter public media URL"
                    className="flex-1 bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-xs px-3 py-2 rounded-sm focus:outline-none"
                  />
                  <label className="px-4 py-2 border border-white/10 hover:border-champagne-gold bg-lux-black hover:text-champagne-gold text-[10px] uppercase tracking-wider font-semibold rounded-sm transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    Upload File
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleUploadImage(e, "cover")}
                    />
                  </label>
                </div>
                {editingProperty.coverImage && (
                  <div className="relative w-40 aspect-[4/3] rounded-sm overflow-hidden border border-white/10 bg-lux-black">
                    <Image
                      src={editingProperty.coverImage}
                      alt="Cover Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Highlights & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider text-ivory/40">
                    Property Description (One paragraph per line)
                  </label>
                  {renderTextToolbar("description")}
                  <textarea
                    id="description"
                    rows={4}
                    value={editingProperty.description}
                    onChange={(e) => setEditingProperty((p: any) => ({ ...p, description: e.target.value }))}
                    placeholder="Enter full description. Press Enter for new paragraphs."
                    className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-xs px-3 py-2 rounded-sm focus:outline-none font-sans"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider text-ivory/40">
                    Property Highlights (One bullet point per line)
                  </label>
                  {renderTextToolbar("highlights")}
                  <textarea
                    id="highlights"
                    rows={4}
                    value={editingProperty.highlights}
                    onChange={(e) => setEditingProperty((p: any) => ({ ...p, highlights: e.target.value }))}
                    placeholder="Enter bullet point highlights. Press Enter for new items."
                    className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-xs px-3 py-2 rounded-sm focus:outline-none font-sans"
                  />
                </div>
              </div>

              {/* Details & Specs */}
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider text-ivory/40 font-light">Built Up Area</label>
                  <input
                    type="text"
                    value={editingProperty.builtUpArea || ""}
                    onChange={(e) => setEditingProperty((p: any) => ({ ...p, builtUpArea: e.target.value }))}
                    placeholder="e.g. 7,300 sq.ft."
                    className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory px-3 py-2 rounded-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider text-ivory/40 font-light">Plot Area</label>
                  <input
                    type="text"
                    value={editingProperty.plotArea || ""}
                    onChange={(e) => setEditingProperty((p: any) => ({ ...p, plotArea: e.target.value }))}
                    placeholder="e.g. 950 sq.yd."
                    className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory px-3 py-2 rounded-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider text-ivory/40 font-light">Floor / Level</label>
                  <input
                    type="text"
                    value={editingProperty.floor || ""}
                    onChange={(e) => setEditingProperty((p: any) => ({ ...p, floor: e.target.value }))}
                    placeholder="e.g. 15th Floor"
                    className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory px-3 py-2 rounded-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider text-ivory/40 font-light">Ideal For / Suitable For</label>
                  <input
                    type="text"
                    value={editingProperty.suitableFor || ""}
                    onChange={(e) => setEditingProperty((p: any) => ({ ...p, suitableFor: e.target.value }))}
                    placeholder="e.g. HNI Families"
                    className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory px-3 py-2 rounded-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Gallery Images */}
              <div className="bg-white/[0.01] p-4 border border-white/[0.04] rounded-sm space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <label className="block text-[9px] uppercase tracking-wider text-champagne-gold font-medium">Gallery Images <span className="text-white/40 lowercase font-normal">(recommended: landscape 16:9 or 4:3, e.g. 1920x1080px)</span></label>
                    <span className="text-[8px] text-ivory/30 uppercase mt-0.5">Click sparkles to tag with AI, or edit Alt text below</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={generatingAllImageAlts}
                      onClick={handleTagAllImages}
                      className="px-2.5 py-1 border border-champagne-gold/40 hover:border-champagne-gold text-champagne-gold disabled:text-champagne-gold/30 disabled:border-champagne-gold/20 text-[8px] uppercase tracking-wider font-semibold rounded-sm transition-all cursor-pointer flex items-center gap-1 disabled:cursor-wait"
                    >
                      {generatingAllImageAlts ? (
                        <>
                          <Loader2 className="w-2.5 h-2.5 animate-spin" />
                          Tagging All...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-2.5 h-2.5" />
                          Auto-Tag All Alts
                        </>
                      )}
                    </button>
                    {uploadingImage === -1 && (
                      <span className="flex items-center gap-1.5 text-[10px] text-champagne-gold">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading to gallery...
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  {(editingProperty.images || []).map((imgUrl: string, idx: number) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="relative group aspect-[4/3] bg-lux-black border border-white/10 rounded-sm overflow-hidden">
                        <Image
                          src={imgUrl}
                          alt={`Gallery ${idx}`}
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-red-600/90 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-700 transition-all cursor-pointer z-10"
                          title="Remove Image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        
                        <button
                          type="button"
                          disabled={generatingImageAlts[imgUrl]}
                          onClick={() => handleTagSingleImage(imgUrl)}
                          className="absolute bottom-1 right-1 p-1 bg-champagne-gold text-lux-black rounded-full opacity-0 group-hover:opacity-100 hover:bg-white transition-all cursor-pointer z-10 disabled:cursor-wait disabled:bg-champagne-gold/30"
                          title="Auto-Tag Alt Text with AI"
                        >
                          {generatingImageAlts[imgUrl] ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Sparkles className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <input
                        type="text"
                        value={editingProperty.imageAlts?.[imgUrl] || ""}
                        onChange={(e) => {
                          const alts = { ...(editingProperty.imageAlts || {}) };
                          alts[imgUrl] = e.target.value;
                          setEditingProperty((p: any) => ({ ...p, imageAlts: alts }));
                        }}
                        placeholder="Alt text (SEO)..."
                        className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-[10px] px-2 py-1 rounded-sm focus:outline-none text-ivory/80"
                      />
                    </div>
                  ))}

                  <label className="border border-dashed border-white/20 hover:border-champagne-gold bg-lux-black/40 hover:bg-champagne-gold/5 text-ivory/50 hover:text-champagne-gold aspect-[4/3] rounded-sm flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer">
                    <Plus className="w-5 h-5" />
                    <span className="text-[9px] uppercase tracking-wider font-semibold">Add Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleUploadImage(e, -1)}
                    />
                  </label>
                </div>
              </div>

              {/* SEO Meta Tags Option */}
              <div className="bg-white/[0.01] p-4 border border-white/[0.04] rounded-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-[9px] uppercase tracking-wider text-champagne-gold font-medium">SEO Meta Tags</h4>
                    <p className="text-[8px] text-ivory/30 mt-0.5 uppercase tracking-wider">Configure tags manually or use OpenRouter AI assistant</p>
                  </div>
                  <button
                    type="button"
                    disabled={generatingPropertySeo}
                    onClick={handleGeneratePropertySeo}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-champagne-gold/40 text-champagne-gold hover:border-champagne-gold disabled:text-champagne-gold/30 disabled:border-champagne-gold/20 text-[9px] uppercase tracking-wider font-semibold rounded-sm transition-all cursor-pointer disabled:cursor-wait"
                  >
                    {generatingPropertySeo ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Flame className="w-3 h-3" />
                        AI Auto-Generate
                      </>
                    )}
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="block text-[9px] uppercase tracking-wider text-ivory/40 font-light">Meta Title</label>
                      <span className={(editingProperty.seoTitle || "").length > 70 ? "text-red-400" : "text-ivory/30"}>
                        {(editingProperty.seoTitle || "").length}/70 chars
                      </span>
                    </div>
                    <input
                      type="text"
                      value={editingProperty.seoTitle || ""}
                      onChange={(e) => setEditingProperty((p: any) => ({ ...p, seoTitle: e.target.value }))}
                      placeholder="e.g. 4 & 5 BHK Penthouse in Sindhu Bhavan Road | PIKORUA Realty"
                      className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory px-3 py-2 rounded-sm focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="block text-[9px] uppercase tracking-wider text-ivory/40 font-light">Meta Description</label>
                      <span className={(editingProperty.seoDescription || "").length > 160 ? "text-red-400" : "text-ivory/30"}>
                        {(editingProperty.seoDescription || "").length}/160 chars
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      value={editingProperty.seoDescription || ""}
                      onChange={(e) => setEditingProperty((p: any) => ({ ...p, seoDescription: e.target.value }))}
                      placeholder="e.g. Explore this premium 4 & 5 BHK penthouse of 7,300 - 15,500 sq.ft. in Sindhu Bhavan Road, Ahmedabad. Contact PIKORUA Realty for private details."
                      className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory px-3 py-2 rounded-sm focus:outline-none font-sans"
                    />
                  </div>
                </div>
              </div>

              {/* Featured & Active Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 bg-white/[0.01] p-3 border border-white/[0.04] rounded-sm">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={editingProperty.isFeatured}
                    onChange={(e) => setEditingProperty((p: any) => ({ ...p, isFeatured: e.target.checked }))}
                    className="w-4 h-4 rounded border-white/20 text-champagne-gold focus:ring-champagne-gold bg-lux-black cursor-pointer"
                  />
                  <div>
                    <label htmlFor="isFeatured" className="text-[10px] uppercase tracking-wider text-white font-medium cursor-pointer">
                      Feature in Private Preview Section
                    </label>
                    <span className="block text-[8px] text-ivory/40 uppercase mt-0.5">
                      Will display this property on the homepage preview slider/grid
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-white/[0.01] p-3 border border-white/[0.04] rounded-sm">
                  <input
                    type="checkbox"
                    id="isActiveProp"
                    checked={editingProperty.isActive}
                    onChange={(e) => setEditingProperty((p: any) => ({ ...p, isActive: e.target.checked }))}
                    className="w-4 h-4 rounded border-white/20 text-champagne-gold focus:ring-champagne-gold bg-lux-black cursor-pointer"
                  />
                  <div>
                    <label htmlFor="isActiveProp" className="text-[10px] uppercase tracking-wider text-white font-medium cursor-pointer">
                      Activate Property
                    </label>
                    <span className="block text-[8px] text-ivory/40 uppercase mt-0.5">
                      When deactivated, this property is hidden from the public catalog
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="border-t border-white/[0.06] pt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPropertyModalOpen(false)}
                  className="px-5 py-2 bg-white/5 border border-white/10 hover:border-white/20 text-xs uppercase tracking-wider rounded-sm cursor-pointer hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2 bg-champagne-gold hover:bg-antique-gold text-lux-black font-semibold text-xs uppercase tracking-widest rounded-sm cursor-pointer transition-all inline-flex items-center gap-1.5"
                >
                  {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Property
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Testimonial Modal Form ── */}
      {isTestimonialModalOpen && editingTestimonial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsTestimonialModalOpen(false)} />
          <div className="popup-mobile-surface relative w-full max-w-xl bg-soft-black border border-white/[0.08] rounded-lg p-6 sm:p-8 max-h-[90dvh] overflow-y-auto z-10 shadow-2xl">
            <div className="flex justify-between items-start border-b border-white/[0.06] pb-4 mb-6">
              <h3 className="font-display text-base tracking-widest uppercase text-white">
                {editingTestimonial.id ? "Edit Review" : "Add Client Testimonial"}
              </h3>
              <button
                onClick={() => setIsTestimonialModalOpen(false)}
                className="p-1.5 border border-white/10 hover:border-white/20 hover:text-white text-ivory/60 rounded-sm bg-lux-black cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTestimonial} className="space-y-5 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider text-ivory/40">Client Name / Initial*</label>
                  <input
                    type="text"
                    required
                    value={editingTestimonial.clientName}
                    onChange={(e) => setEditingTestimonial((t: any) => ({ ...t, clientName: e.target.value }))}
                    placeholder="e.g. Rohan S. or NRI Buyer"
                    className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-sm px-3 py-2 rounded-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider text-ivory/40">Context (Privacy Aware)*</label>
                  <input
                    type="text"
                    required
                    value={editingTestimonial.context}
                    onChange={(e) => setEditingTestimonial((t: any) => ({ ...t, context: e.target.value }))}
                    placeholder="e.g. NRI Buyer · Iskon-Ambli"
                    className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-sm px-3 py-2 rounded-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] uppercase tracking-wider text-ivory/40">Testimonial Quote*</label>
                <textarea
                  rows={4}
                  required
                  value={editingTestimonial.quote}
                  onChange={(e) => setEditingTestimonial((t: any) => ({ ...t, quote: e.target.value }))}
                  placeholder="Paste client testimonial quotes here..."
                  className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-xs px-3 py-2 rounded-sm focus:outline-none font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider text-ivory/40">Source</label>
                  <select
                    value={editingTestimonial.source}
                    onChange={(e) => setEditingTestimonial((t: any) => ({ ...t, source: e.target.value }))}
                    className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-sm px-3 py-2 rounded-sm focus:outline-none cursor-pointer"
                  >
                    <option value="google">Google Review</option>
                    <option value="direct">Direct Feedback</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider text-ivory/40">Star Rating</label>
                  <select
                    value={editingTestimonial.rating}
                    onChange={(e) => setEditingTestimonial((t: any) => ({ ...t, rating: Number(e.target.value) }))}
                    className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-sm px-3 py-2 rounded-sm focus:outline-none cursor-pointer"
                  >
                    <option value={5}>5 Stars</option>
                    <option value={4}>4 Stars</option>
                    <option value={3}>3 Stars</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-white/[0.01] p-3 border border-white/[0.04] rounded-sm">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="testIsFeatured"
                    checked={editingTestimonial.isFeatured}
                    onChange={(e) => setEditingTestimonial((t: any) => ({ ...t, isFeatured: e.target.checked }))}
                    className="w-4 h-4 rounded border-white/20 text-champagne-gold focus:ring-champagne-gold bg-lux-black cursor-pointer"
                  />
                  <label htmlFor="testIsFeatured" className="text-[10px] uppercase tracking-wider text-ivory/60 cursor-pointer">
                    Feature in Teaser Slider
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="testIsPublished"
                    checked={editingTestimonial.isPublished}
                    onChange={(e) => setEditingTestimonial((t: any) => ({ ...t, isPublished: e.target.checked }))}
                    className="w-4 h-4 rounded border-white/20 text-champagne-gold focus:ring-champagne-gold bg-lux-black cursor-pointer"
                  />
                  <label htmlFor="testIsPublished" className="text-[10px] uppercase tracking-wider text-ivory/60 cursor-pointer">
                    Publish Immediately
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="border-t border-white/[0.06] pt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsTestimonialModalOpen(false)}
                  className="px-5 py-2 bg-white/5 border border-white/10 hover:border-white/20 text-xs uppercase tracking-wider rounded-sm cursor-pointer hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2 bg-champagne-gold hover:bg-antique-gold text-lux-black font-semibold text-xs uppercase tracking-widest rounded-sm cursor-pointer transition-all inline-flex items-center gap-1.5"
                >
                  {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Blog Modal Form ── */}
      {isBlogModalOpen && editingBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsBlogModalOpen(false)} />
          <div className="relative w-full max-w-3xl bg-soft-black border border-white/[0.08] rounded-lg p-6 sm:p-8 max-h-[90vh] overflow-y-auto z-10 shadow-2xl">
            <div className="flex justify-between items-start border-b border-white/[0.06] pb-4 mb-6">
              <h3 className="font-display text-base tracking-widest uppercase text-white">
                {editingBlog.title ? `Edit: ${editingBlog.title}` : "Add New Blog Post"}
              </h3>
              <button
                onClick={() => setIsBlogModalOpen(false)}
                className="p-1.5 border border-white/10 hover:border-white/20 hover:text-white text-ivory/60 rounded-sm bg-lux-black cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBlog} className="space-y-6 text-xs font-sans">
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider text-ivory/40">Article Title*</label>
                  <input
                    type="text"
                    required
                    value={editingBlog.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                      setEditingBlog((p: any) => ({ ...p, title, slug }));
                    }}
                    placeholder="e.g. Evolution of Billionaires Row"
                    className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-sm px-3 py-2 rounded-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider text-ivory/40">URL Slug*</label>
                  <input
                    type="text"
                    required
                    value={editingBlog.slug}
                    onChange={(e) => setEditingBlog((p: any) => ({ ...p, slug: e.target.value }))}
                    placeholder="e.g. evolution-of-billionaires-row"
                    className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-sm px-3 py-2 rounded-sm focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider text-ivory/40">Published Date*</label>
                  <input
                    type="date"
                    required
                    value={editingBlog.publishedAt}
                    onChange={(e) => setEditingBlog((p: any) => ({ ...p, publishedAt: e.target.value }))}
                    className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-sm px-3 py-2 rounded-sm focus:outline-none cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider text-ivory/40">Read Time*</label>
                  <input
                    type="text"
                    required
                    value={editingBlog.readTime}
                    onChange={(e) => setEditingBlog((p: any) => ({ ...p, readTime: e.target.value }))}
                    placeholder="e.g. 5 min read"
                    className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-sm px-3 py-2 rounded-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Cover Image Upload */}
              <div className="bg-white/[0.01] p-4 border border-white/[0.04] rounded-sm space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-[9px] uppercase tracking-wider text-champagne-gold font-medium">Cover Image* <span className="text-white/40 lowercase font-normal">(recommended: landscape 16:10, e.g. 1920x1200px)</span></label>
                  {uploadingBlogImage && (
                    <span className="flex items-center gap-1.5 text-[10px] text-champagne-gold">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading image...
                    </span>
                  )}
                </div>
                <div className="flex gap-4 items-center">
                  <input
                    type="text"
                    required
                    value={editingBlog.coverImage}
                    onChange={(e) => setEditingBlog((p: any) => ({ ...p, coverImage: e.target.value }))}
                    placeholder="Upload cover image or enter public URL"
                    className="flex-1 bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-xs px-3 py-2 rounded-sm focus:outline-none"
                  />
                  <label className="px-4 py-2 border border-white/10 hover:border-champagne-gold bg-lux-black hover:text-champagne-gold text-[10px] uppercase tracking-wider font-semibold rounded-sm transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    Upload File
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleUploadBlogImage(e, "coverImage")}
                    />
                  </label>
                </div>
                <div className="flex flex-col md:flex-row gap-4 items-start pt-1">
                  {editingBlog.coverImage && (
                    <div className="relative w-40 aspect-[16/10] rounded-sm overflow-hidden border border-white/10 bg-lux-black flex-shrink-0">
                      <Image
                        src={editingBlog.coverImage}
                        alt="Cover Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 w-full space-y-1.5">
                    <span className="block text-[8px] uppercase tracking-wider text-ivory/30">Or select a premium stock luxury image:</span>
                    <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
                      {[
                        { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", label: "Glass Villa" },
                        { url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80", label: "Dusk Mansion" },
                        { url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80", label: "Luxury Lounge" },
                        { url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80", label: "Modern Estate" },
                        { url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80", label: "Penthouse View" },
                        { url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80", label: "Contemporary Front" },
                      ].map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setEditingBlog((p: any) => ({ ...p, coverImage: img.url }))}
                          className={`relative w-16 aspect-[16/10] rounded-sm overflow-hidden border transition-all flex-shrink-0 ${
                            editingBlog.coverImage === img.url
                              ? "border-champagne-gold ring-1 ring-champagne-gold"
                              : "border-white/10 hover:border-white/30"
                          }`}
                        >
                          <Image
                            src={img.url}
                            alt={img.label}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                          <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[6px] py-0.5 text-center text-ivory/80 truncate">
                            {img.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Article Content */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[9px] uppercase tracking-wider text-ivory/40 font-medium">
                    Article Body
                  </label>
                  {/* DOCX Upload */}
                  <label className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border cursor-pointer text-[9px] uppercase tracking-wider font-semibold transition-all ${
                    docxUploading
                      ? "border-champagne-gold/30 text-champagne-gold/50 cursor-wait"
                      : "border-champagne-gold/40 text-champagne-gold hover:border-champagne-gold hover:bg-champagne-gold/5"
                  }`}>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    {docxUploading ? "Converting..." : "Upload DOCX"}
                    <input
                      type="file"
                      accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      className="hidden"
                      disabled={docxUploading}
                      onChange={handleDocxUpload}
                    />
                  </label>
                </div>

                {/* HTML preview from DOCX — editable */}
                {editingBlog.htmlContent ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-champagne-gold/70 uppercase tracking-wider">
                        ✓ DOCX imported — click to edit
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingBlog((p: any) => ({ ...p, htmlContent: "", content: "" }))}
                        className="text-[9px] text-red-400/70 hover:text-red-400 uppercase tracking-wider transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                    <HtmlContentEditor
                      value={editingBlog.htmlContent}
                      onChange={(html) => setEditingBlog((p: any) => ({ ...p, htmlContent: html }))}
                    />
                    <p className="text-[9px] text-ivory/25">Click anywhere inside to edit. Formatting is preserved.</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-[9px] text-ivory/30">Or write manually — double-Enter for new paragraphs</p>
                    {renderTextToolbar("content")}
                    <textarea
                      id="content"
                      rows={8}
                      value={editingBlog.content}
                      onChange={(e) => setEditingBlog((p: any) => ({ ...p, content: e.target.value }))}
                      placeholder="Write full article body paragraphs here..."
                      className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-xs px-3 py-2 rounded-sm focus:outline-none font-sans leading-relaxed"
                    />
                  </div>
                )}
              </div>

              {/* SEO Meta Tags Option */}
              <div className="bg-white/[0.01] p-4 border border-white/[0.04] rounded-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-[9px] uppercase tracking-wider text-champagne-gold font-medium">SEO Meta Tags</h4>
                    <p className="text-[8px] text-ivory/30 mt-0.5 uppercase tracking-wider">Configure tags manually or use OpenRouter AI assistant</p>
                  </div>
                  <button
                    type="button"
                    disabled={generatingAiMetadata}
                    onClick={handleGenerateAiMetadata}
                    className="inline-flex items-center gap-1 px-2.5 py-1 border border-champagne-gold/40 text-champagne-gold hover:border-champagne-gold disabled:text-champagne-gold/30 disabled:border-champagne-gold/20 text-[9px] uppercase tracking-wider font-semibold rounded-sm transition-all cursor-pointer disabled:cursor-wait"
                  >
                    {generatingAiMetadata ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Flame className="w-3 h-3" />
                        AI Auto-Generate
                      </>
                    )}
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="block text-[9px] uppercase tracking-wider text-ivory/40 font-light">Meta Title</label>
                      <span className={(editingBlog.seoTitle || "").length > 70 ? "text-red-400" : "text-ivory/30"}>
                        {(editingBlog.seoTitle || "").length}/70 chars
                      </span>
                    </div>
                    <input
                      type="text"
                      value={editingBlog.seoTitle || ""}
                      onChange={(e) => setEditingBlog((p: any) => ({ ...p, seoTitle: e.target.value }))}
                      placeholder="e.g. Ahmedabad's Luxury Corridor Spotlight | PIKORUA Realty"
                      className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory px-3 py-2 rounded-sm focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="block text-[9px] uppercase tracking-wider text-ivory/40 font-light">Meta Description</label>
                      <span className={(editingBlog.seoDescription || "").length > 160 ? "text-red-400" : "text-ivory/30"}>
                        {(editingBlog.seoDescription || "").length}/160 chars
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      value={editingBlog.seoDescription || ""}
                      onChange={(e) => setEditingBlog((p: any) => ({ ...p, seoDescription: e.target.value }))}
                      placeholder="e.g. Read our analysis on the rise of single-floor luxury penthouses and corridor spotlights in Ahmedabad's prime locations."
                      className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory px-3 py-2 rounded-sm focus:outline-none font-sans"
                    />
                  </div>
                </div>
              </div>

              {/* FAQ Editor — for AEO / Google rich results */}
              <div className="bg-white/[0.01] p-4 border border-white/[0.04] rounded-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-[9px] uppercase tracking-wider text-champagne-gold font-medium">FAQs</h4>
                    <p className="text-[8px] text-ivory/30 mt-0.5 uppercase tracking-wider">Boosts AEO — powers Google FAQ rich results &amp; AI citation</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingBlog((p: any) => ({
                      ...p,
                      faqs: [...(p.faqs || []), { question: "", answer: "" }]
                    }))}
                    className="inline-flex items-center gap-1 px-2.5 py-1 border border-champagne-gold/40 text-champagne-gold hover:border-champagne-gold text-[9px] uppercase tracking-wider font-semibold rounded-sm transition-all cursor-pointer"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    Add FAQ
                  </button>
                </div>

                {(!editingBlog.faqs || editingBlog.faqs.length === 0) ? (
                  <p className="text-[9px] text-ivory/25 italic">No FAQs yet. Add 3–5 questions your buyer would ask.</p>
                ) : (
                  <div className="space-y-3">
                    {(editingBlog.faqs || []).map((faq: { question: string; answer: string }, i: number) => (
                      <div key={i} className="bg-lux-black border border-white/[0.06] rounded-sm p-3 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[9px] text-champagne-gold/60 uppercase tracking-wider font-medium">Q{i + 1}</span>
                          <button
                            type="button"
                            onClick={() => setEditingBlog((p: any) => ({
                              ...p,
                              faqs: (p.faqs || []).filter((_: any, idx: number) => idx !== i)
                            }))}
                            className="text-[9px] text-red-400/60 hover:text-red-400 uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) => setEditingBlog((p: any) => {
                            const updated = [...(p.faqs || [])];
                            updated[i] = { ...updated[i], question: e.target.value };
                            return { ...p, faqs: updated };
                          })}
                          placeholder="e.g. What is the price range for penthouses on Sindhu Bhavan Road?"
                          className="w-full bg-lux-black/50 border border-white/[0.08] focus:border-champagne-gold/50 text-ivory text-xs px-3 py-2 rounded-sm focus:outline-none font-sans"
                        />
                        <textarea
                          rows={2}
                          value={faq.answer}
                          onChange={(e) => setEditingBlog((p: any) => {
                            const updated = [...(p.faqs || [])];
                            updated[i] = { ...updated[i], answer: e.target.value };
                            return { ...p, faqs: updated };
                          })}
                          placeholder="Concise answer in 2–3 sentences with specific details (price, location, size)..."
                          className="w-full bg-lux-black/50 border border-white/[0.08] focus:border-champagne-gold/50 text-ivory text-xs px-3 py-2 rounded-sm focus:outline-none font-sans leading-relaxed"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Featured & Active Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 bg-white/[0.01] p-3 border border-white/[0.04] rounded-sm">
                  <input
                    type="checkbox"
                    id="blogIsFeatured"
                    checked={editingBlog.isFeatured}
                    onChange={(e) => setEditingBlog((p: any) => ({ ...p, isFeatured: e.target.checked }))}
                    className="w-4 h-4 rounded border-white/20 text-champagne-gold focus:ring-champagne-gold bg-lux-black cursor-pointer"
                  />
                  <div>
                    <label htmlFor="blogIsFeatured" className="text-[10px] uppercase tracking-wider text-white font-medium cursor-pointer">
                      Feature on Blog Homepage
                    </label>
                    <span className="block text-[8px] text-ivory/40 uppercase mt-0.5">
                      Will display this article at the top as the highlighted cover story
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-white/[0.01] p-3 border border-white/[0.04] rounded-sm">
                  <input
                    type="checkbox"
                    id="isActiveBlog"
                    checked={editingBlog.isActive}
                    onChange={(e) => setEditingBlog((p: any) => ({ ...p, isActive: e.target.checked }))}
                    className="w-4 h-4 rounded border-white/20 text-champagne-gold focus:ring-champagne-gold bg-lux-black cursor-pointer"
                  />
                  <div>
                    <label htmlFor="isActiveBlog" className="text-[10px] uppercase tracking-wider text-white font-medium cursor-pointer">
                      Activate Blog Post
                    </label>
                    <span className="block text-[8px] text-ivory/40 uppercase mt-0.5">
                      When deactivated, this blog post is hidden from the public blog
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="border-t border-white/[0.06] pt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBlogModalOpen(false)}
                  className="px-5 py-2 bg-white/5 border border-white/10 hover:border-white/20 text-xs uppercase tracking-wider rounded-sm cursor-pointer hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2 bg-champagne-gold hover:bg-antique-gold text-lux-black font-semibold text-xs uppercase tracking-widest rounded-sm cursor-pointer transition-all inline-flex items-center gap-1.5"
                >
                  {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── General FAQ Modal ── */}
      {isGeneralFaqModalOpen && editingGeneralFaq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsGeneralFaqModalOpen(false)} />
          <div className="popup-mobile-surface relative w-full max-w-xl bg-soft-black border border-white/[0.08] rounded-lg p-6 sm:p-8 max-h-[90dvh] overflow-y-auto z-10 shadow-2xl">
            <div className="flex justify-between items-start border-b border-white/[0.06] pb-4 mb-6 font-sans">
              <h3 className="font-display text-base tracking-widest uppercase text-white">
                {editingGeneralFaq.id && !editingGeneralFaq.id.startsWith("0.") ? "Edit General FAQ" : "Add General FAQ"}
              </h3>
              <button
                onClick={() => setIsGeneralFaqModalOpen(false)}
                className="p-1.5 border border-white/10 hover:border-white/20 hover:text-white text-ivory/60 rounded-sm bg-lux-black cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGeneralFaq} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[9px] uppercase tracking-wider text-ivory/40">Category</label>
                <select
                  value={editingGeneralFaq.category}
                  onChange={(e) => setEditingGeneralFaq((p: any) => ({ ...p, category: e.target.value }))}
                  className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-sm px-3 py-2 rounded-sm focus:outline-none focus:ring-1 focus:ring-champagne-gold/30 transition-all cursor-pointer font-sans"
                >
                  <option value="general">General (Contact Page)</option>
                  <option value="properties">Properties Page</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] uppercase tracking-wider text-ivory/40">Display Order</label>
                <input
                  type="number"
                  required
                  value={editingGeneralFaq.display_order}
                  onChange={(e) => setEditingGeneralFaq((p: any) => ({ ...p, display_order: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-sm px-3 py-2 rounded-sm focus:outline-none focus:ring-1 focus:ring-champagne-gold/30 transition-all font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] uppercase tracking-wider text-ivory/40">Question*</label>
                <input
                  type="text"
                  required
                  value={editingGeneralFaq.question}
                  onChange={(e) => setEditingGeneralFaq((p: any) => ({ ...p, question: e.target.value }))}
                  placeholder="e.g. Is PIKORUA Realty a public portal?"
                  className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-sm px-3 py-2 rounded-sm focus:outline-none focus:ring-1 focus:ring-champagne-gold/30 transition-all font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] uppercase tracking-wider text-ivory/40">Answer*</label>
                <textarea
                  rows={4}
                  required
                  value={editingGeneralFaq.answer}
                  onChange={(e) => setEditingGeneralFaq((p: any) => ({ ...p, answer: e.target.value }))}
                  placeholder="Type the detailed answer to the question..."
                  className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-xs px-3 py-2 rounded-sm focus:outline-none focus:ring-1 focus:ring-champagne-gold/30 transition-all font-sans leading-relaxed"
                />
              </div>

              <div className="border-t border-white/[0.06] pt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsGeneralFaqModalOpen(false)}
                  className="px-5 py-2 bg-white/5 border border-white/10 hover:border-white/20 text-xs uppercase tracking-wider rounded-sm cursor-pointer hover:text-white transition-all font-sans"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2 bg-champagne-gold hover:bg-antique-gold text-lux-black font-semibold text-xs uppercase tracking-widest rounded-sm cursor-pointer transition-all inline-flex items-center gap-1.5 font-sans"
                >
                  {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── AI News Drafter Modal ── */}
      {isNewsDrafterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={() => !generatingBlogFromNews && setIsNewsDrafterOpen(false)} />
          
          <div className="relative w-full max-w-2xl bg-soft-black border border-white/[0.08] rounded-md p-6 sm:p-8 z-10 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col font-sans">
            
            {generatingBlogFromNews ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 space-y-4">
                <Loader2 className="w-12 h-12 text-champagne-gold animate-spin" />
                <h4 className="text-sm font-display tracking-widest text-champagne-gold uppercase font-semibold">AI is drafting your post</h4>
                <p className="text-[11px] text-ivory/50 uppercase text-center max-w-sm leading-relaxed">
                  Our news analyzer is reading the source article details, optimizing SEO tags, writing headers, and crafting FAQs. This may take up to 25 seconds.
                </p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start border-b border-white/[0.06] pb-4 mb-6">
                  <div>
                    <h3 className="font-display text-base tracking-widest uppercase text-white">
                      AI News Blog Drafter
                    </h3>
                    <p className="text-[9px] text-ivory/40 uppercase tracking-wider mt-1">
                      Draft a complete luxury real-estate article based on live news or custom topics
                    </p>
                  </div>
                  <button
                    onClick={() => setIsNewsDrafterOpen(false)}
                    className="p-1.5 border border-white/10 hover:border-white/20 hover:text-white text-ivory/60 rounded-sm bg-lux-black cursor-pointer transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/[0.06] mb-6 text-xs uppercase tracking-wider font-semibold">
                  <button
                    onClick={() => setActiveNewsTab("feed")}
                    className={`flex-1 pb-3 text-center transition-all ${
                      activeNewsTab === "feed"
                        ? "text-champagne-gold border-b-2 border-champagne-gold"
                        : "text-ivory/40 hover:text-ivory/80"
                    }`}
                  >
                    Trending Local News
                  </button>
                  <button
                    onClick={() => setActiveNewsTab("custom")}
                    className={`flex-1 pb-3 text-center transition-all ${
                      activeNewsTab === "custom"
                        ? "text-champagne-gold border-b-2 border-champagne-gold"
                        : "text-ivory/40 hover:text-ivory/80"
                    }`}
                  >
                    Custom Topic / Link
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto pr-1">
                  {activeNewsTab === "feed" ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] text-ivory/40 uppercase tracking-wider">
                          Live headlines from Google News RSS
                        </span>
                        <button
                          onClick={handleFetchNews}
                          disabled={fetchingNews}
                          className="text-[10px] text-champagne-gold hover:text-antique-gold flex items-center gap-1 cursor-pointer disabled:text-champagne-gold/40"
                        >
                          <Loader2 className={`w-3.5 h-3.5 ${fetchingNews ? "animate-spin" : ""}`} />
                          Refresh Feed
                        </button>
                      </div>

                      {fetchingNews ? (
                        <div className="flex flex-col items-center justify-center py-16 space-y-3">
                          <Loader2 className="w-8 h-8 text-champagne-gold animate-spin" />
                          <span className="text-[10px] uppercase text-ivory/40 tracking-wider">Fetching live news...</span>
                        </div>
                      ) : newsFeed.length === 0 ? (
                        <div className="text-center py-16 border border-dashed border-white/10 rounded-sm">
                          <p className="text-xs text-ivory/40">No property news found in feed.</p>
                          <button
                            onClick={handleFetchNews}
                            className="mt-3 px-4 py-1.5 border border-champagne-gold/30 hover:border-champagne-gold text-champagne-gold text-[10px] uppercase tracking-wider font-semibold rounded-sm transition-all"
                          >
                            Try Reloading
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {newsFeed.map((item, idx) => (
                            <div
                              key={idx}
                              className="bg-lux-black border border-white/[0.04] p-4 rounded-sm hover:border-champagne-gold/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                            >
                              <div className="space-y-1.5 md:max-w-[75%]">
                                <h4 className="text-xs font-semibold text-ivory font-sans leading-snug">
                                  {item.title}
                                </h4>
                                <div className="flex items-center gap-2 text-[9px] uppercase tracking-wider text-ivory/40">
                                  <span className="text-champagne-gold">{item.source}</span>
                                  <span>•</span>
                                  <span>{item.pubDate ? new Date(item.pubDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}</span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleGenerateFromNews(item.title, item.link)}
                                className="px-3.5 py-1.5 bg-champagne-gold hover:bg-antique-gold text-lux-black text-[10px] uppercase tracking-wider font-semibold rounded-sm transition-all text-center flex-shrink-0 cursor-pointer self-start md:self-center"
                              >
                                Draft Post
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="space-y-1">
                        <label className="block text-[10px] uppercase tracking-wider text-ivory/40">News Headline / Article Title</label>
                        <input
                          type="text"
                          value={customNewsTitle}
                          onChange={(e) => setCustomNewsTitle(e.target.value)}
                          placeholder="e.g. Ahmedabad Land rates double in Ambli Road corridor"
                          className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-xs px-3 py-2.5 rounded-sm focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] uppercase tracking-wider text-ivory/40">Source News URL (Optional - scrapes details)</label>
                        <input
                          type="url"
                          value={customNewsUrl}
                          onChange={(e) => setCustomNewsUrl(e.target.value)}
                          placeholder="e.g. https://timesofindia.indiatimes.com/ahmedabad-real-estate"
                          className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-xs px-3 py-2.5 rounded-sm focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] uppercase tracking-wider text-ivory/40">Article Excerpt or Specific Guideline Details (Optional)</label>
                        <textarea
                          rows={6}
                          value={customNewsText}
                          onChange={(e) => setCustomNewsText(e.target.value)}
                          placeholder="Type or paste any key facts, pricing details, or notes about RERA guidelines that the AI should weave into the post..."
                          className="w-full bg-lux-black border border-white/[0.08] focus:border-champagne-gold text-ivory text-xs px-3 py-2.5 rounded-sm focus:outline-none font-sans leading-relaxed"
                        />
                      </div>

                      <div className="border-t border-white/[0.06] pt-5 flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setCustomNewsTitle("");
                            setCustomNewsUrl("");
                            setCustomNewsText("");
                          }}
                          className="px-4 py-2 border border-white/15 text-ivory/50 text-[10px] uppercase tracking-wider font-semibold rounded-sm hover:text-white transition-all cursor-pointer"
                        >
                          Reset Fields
                        </button>
                        <button
                          type="button"
                          onClick={() => handleGenerateFromNews(customNewsTitle, customNewsUrl || undefined, customNewsText || undefined)}
                          className="px-6 py-2 bg-champagne-gold hover:bg-antique-gold text-lux-black font-semibold text-[10px] uppercase tracking-widest rounded-sm transition-all inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          Generate AI Draft
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
