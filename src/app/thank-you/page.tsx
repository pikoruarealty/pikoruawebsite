import Link from "next/link";
import type { Metadata } from "next";
import { env } from "@/lib/env";
import { buildWhatsAppUrl } from "@/lib/utils";
import { SOCIAL_LINKS } from "@/lib/social";

export const metadata: Metadata = {
  title: "Thank You",
  description: "We've received your enquiry and will be in touch shortly.",
  robots: { index: false, follow: false },
};

interface ThankYouPageProps {
  searchParams: Promise<{ source?: string; purpose?: string }>;
}

export default async function ThankYouPage({ searchParams }: ThankYouPageProps) {
  const params = await searchParams;
  const isSeller = params.purpose === "selling";
  const isNri = params.purpose === "nri-purchase";

  const message = isSeller
    ? "We'll reach out to discuss a discreet representation for your property."
    : isNri
    ? "We'll be in touch shortly — and we're happy to connect across time zones."
    : "We'll review your preferences and reach out with curated residential options.";

  const whatsappUrl = buildWhatsAppUrl(
    env.WHATSAPP_NUMBER,
    "Hi, I just submitted an enquiry on pikorua.in"
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--lux-black)",
        color: "var(--ivory)",
        fontFamily: "system-ui, sans-serif",
        gap: "1.5rem",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontSize: "0.75rem",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "#C8A45D",
        }}
      >
        PIKORUA Realty
      </p>
      <h1 style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)", fontWeight: 400 }}>
        Your enquiry is received.
      </h1>
      <p style={{ color: "#9ca3af", maxWidth: "440px", lineHeight: 1.8 }}>
        {message}
      </p>
      <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
        In the meantime, reach us directly on WhatsApp:
      </p>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          padding: "0.75rem 2rem",
          background: "#25D366",
          color: "#fff",
          textDecoration: "none",
          fontSize: "0.875rem",
          borderRadius: "4px",
          letterSpacing: "0.02em",
        }}
      >
        Speak on WhatsApp
      </a>
      <Link
        href="/"
        style={{
          color: "#C8A45D",
          textDecoration: "none",
          fontSize: "0.875rem",
          letterSpacing: "0.05em",
          marginTop: "0.5rem",
        }}
      >
        Return Home
      </Link>

      <div
        style={{
          marginTop: "1rem",
          paddingTop: "1.5rem",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.875rem",
        }}
      >
        <p
          style={{
            fontSize: "0.7rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#6b7280",
          }}
        >
          Follow Us
        </p>
        <div style={{ display: "flex", gap: "1rem" }}>
          <a
            href={SOCIAL_LINKS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            style={{ color: "#9ca3af", display: "flex" }}
          >
            <InstagramIcon />
          </a>
          <a
            href={SOCIAL_LINKS.facebook}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            style={{ color: "#9ca3af", display: "flex" }}
          >
            <FacebookIcon />
          </a>
          <a
            href={SOCIAL_LINKS.youtube}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
            style={{ color: "#9ca3af", display: "flex" }}
          >
            <YouTubeIcon />
          </a>
          <a
            href={SOCIAL_LINKS.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            style={{ color: "#9ca3af", display: "flex" }}
          >
            <LinkedInIcon />
          </a>
        </div>
      </div>
    </div>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" width="20" height="20">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width="20" height="20">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}
function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width="20" height="20">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}
function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width="20" height="20">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
