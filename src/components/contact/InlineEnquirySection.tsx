import { QuickEnquiryForm } from "./QuickEnquiryForm";
import { env } from "@/lib/env";
import { buildWhatsAppUrl } from "@/lib/utils";
import { BUSINESS_PHONE_DISPLAY, BUSINESS_PHONE_E164 } from "@/lib/entity-profile";

interface InlineEnquirySectionProps {
  /** Page path or title, saved with the lead so the team knows where the enquiry came from. */
  pageLabel: string;
  heading?: string;
  intro?: string;
  /** "nri" changes the default copy for buyers enquiring from abroad. */
  audience?: "nri" | "general";
  className?: string;
}

/**
 * On-page enquiry form for landing pages, guides and blog posts.
 * Visitors arriving from search can enquire without leaving the page
 * (previously these pages only linked to /contact or WhatsApp).
 * Anchor: #enquire
 */
export function InlineEnquirySection({
  pageLabel,
  heading,
  intro,
  audience = "general",
  className = "",
}: InlineEnquirySectionProps) {
  const isNri = audience === "nri";
  const whatsappUrl = buildWhatsAppUrl(
    env.WHATSAPP_NUMBER,
    `Hi PIKORUA Realty, I am enquiring from your page "${pageLabel}".`
  );

  return (
    <section
      id="enquire"
      aria-labelledby="enquire-heading"
      className={`scroll-mt-28 border-t border-white/[0.06] bg-soft-black/40 py-16 lg:py-24 ${className}`}
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.4fr] lg:gap-16 lg:px-8">
        <div>
          <p className="mb-4 font-sans text-[10px] uppercase tracking-[0.25em] text-champagne-gold">
            Private Enquiry
          </p>
          <h2
            id="enquire-heading"
            className="font-display text-2xl font-light uppercase tracking-wider text-ivory sm:text-3xl"
          >
            {heading ?? (isNri ? "Enquire From Abroad" : "Share Your Requirement")}
          </h2>
          <p className="mt-5 max-w-md font-sans text-sm leading-relaxed text-ivory/65">
            {intro ??
              (isNri
                ? "Tell us your budget, preferred area and time zone. An advisor replies personally and can arrange a video walkthrough at a time that suits you."
                : "Tell us what you are looking for: configuration, area and budget. An advisor replies personally with options that fit your brief.")}
          </p>
          <p className="mt-6 font-sans text-xs leading-relaxed text-ivory/50">
            Prefer to talk now?{" "}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-champagne-gold/85 underline underline-offset-2 hover:text-champagne-gold"
            >
              WhatsApp us
            </a>{" "}
            or call{" "}
            <a href={`tel:${BUSINESS_PHONE_E164}`} className="text-champagne-gold/85 underline underline-offset-2 hover:text-champagne-gold">
              {BUSINESS_PHONE_DISPLAY}
            </a>
            .
          </p>
        </div>
        <QuickEnquiryForm interest={`Enquiry from ${pageLabel}`} trackingSource="inline_enquiry" />
      </div>
    </section>
  );
}
