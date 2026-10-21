import { ImageResponse } from "next/og";
import { getSupabasePropertyBySlug } from "@/lib/db/queries";
import { STATIC_PROPERTIES } from "@/lib/data/properties";

export const runtime = "nodejs";
export const alt = "PIKORUA Realty - Private Luxury Advisory";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let property = await getSupabasePropertyBySlug(slug);
  if (!property) {
    property = STATIC_PROPERTIES.find((p) => p.slug === slug) || null;
  }

  const title = property?.name || "Luxury Residence";
  const location = property?.locationLabel || "Ahmedabad";
  const config = property?.configuration || "4 BHK / 5 BHK";
  const sizeRange = property?.sizeRange || "";
  const category = property?.category ? property.category.toUpperCase() : "APARTMENT";

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
            PIKORUA REALTY · PRIVATE ADVISORY
          </div>
          <div
            style={{
              color: "#ffffff",
              fontSize: "64px",
              fontFamily: "serif",
              fontWeight: "normal",
              lineHeight: "1.15",
              marginBottom: "10px",
              textTransform: "uppercase",
            }}
          >
            {title}
          </div>
          <div
            style={{
              color: "#a0a0a0",
              fontSize: "24px",
              fontFamily: "sans-serif",
            }}
          >
            {config} · {sizeRange}
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
              Location
            </div>
            <div style={{ color: "#ffffff", fontSize: "22px", marginTop: "5px" }}>
              {location}, Gujarat
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <div style={{ color: "#a0a0a0", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Category
            </div>
            <div style={{ color: "#C8A45D", fontSize: "22px", marginTop: "5px", fontWeight: "bold" }}>
              {category}
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
