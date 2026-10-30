import { ImageResponse } from "next/og";
import { getSupabaseBlogBySlug } from "@/lib/db/queries";
import { resolvePublicBlogPost } from "@/lib/data/blog";

export const runtime = "nodejs";
export const alt = "PIKORUA Realty - Insights & Advisory";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = resolvePublicBlogPost(slug, await getSupabaseBlogBySlug(slug));

  const title = post?.title || "Luxury Insights";
  const category = post?.categoryLabel || "MARKET REPORT";
  const readTime = post?.readTime || "5 min read";
  const publishedDate = post?.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return new ImageResponse(
    (
      <div
        style={{
          background: "#0c0c0c",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          border: "4px solid #C8A45D",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              color: "#C8A45D",
              fontSize: "18px",
              fontFamily: "sans-serif",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              marginBottom: "20px",
            }}
          >
            PIKORUA REALTY · INSIGHTS & ADVISORY
          </div>
          <div
            style={{
              color: "#ffffff",
              fontSize: "52px",
              fontFamily: "serif",
              fontWeight: "normal",
              lineHeight: "1.2",
              marginBottom: "10px",
              textTransform: "uppercase",
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: "40px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ color: "#a0a0a0", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Published Date
            </div>
            <div style={{ color: "#ffffff", fontSize: "20px", marginTop: "5px" }}>
              {publishedDate}
            </div>
          </div>

          <div style={{ display: "flex", gap: "30px", alignItems: "flex-end" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <div style={{ color: "#a0a0a0", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Reading Time
              </div>
              <div style={{ color: "#ffffff", fontSize: "20px", marginTop: "5px" }}>
                {readTime}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <div style={{ color: "#a0a0a0", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Category
              </div>
              <div style={{ color: "#C8A45D", fontSize: "20px", marginTop: "5px", fontWeight: "bold" }}>
                {category}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
