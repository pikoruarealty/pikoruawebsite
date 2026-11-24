"use client";

import { useEffect, useState, type CSSProperties, type MouseEvent } from "react";
import { usePathname } from "next/navigation";
import { env } from "@/lib/env";
import { buildWhatsAppUrl, cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import { SITE_NAME } from "@/lib/seo";

interface WhatsAppFABProps {
  /** Slide off the bottom of the screen while the visitor scrolls. */
  tucked: boolean;
  /** Changing `glintKey` (above 0) plays the glint once. */
  glintKey: number;
  /** Hidden while the enquiry pop-up is open. */
  visible: boolean;
  /** Sit higher, above the Maya call widget, when that is switched on. */
  lifted?: boolean;
  onTap: () => void;
}

/** Readable name of the current page, taken from its <title>. */
function currentPageName(pathname: string): string {
  if (pathname === "/") return "Home";
  const title = document.title.split(" | ").filter((part) => part.trim() && part.trim() !== SITE_NAME)[0];
  const name = (title ?? pathname).trim();
  return name.length > 100 ? `${name.slice(0, 97).trimEnd()}...` : name;
}

function messageFor(pathname: string): string {
  return `${env.WHATSAPP_DEFAULT_MESSAGE} (Page: ${currentPageName(pathname)})`;
}

/**
 * Floating WhatsApp button, bottom right, on every page. Opens a chat with the
 * business number and a ready-to-send message that names the page the visitor
 * was on.
 */
export function WhatsAppFAB({ tucked, glintKey, visible, lifted = false, onTap }: WhatsAppFABProps) {
  const pathname = usePathname();
  const [href, setHref] = useState(() =>
    buildWhatsAppUrl(env.WHATSAPP_NUMBER, env.WHATSAPP_DEFAULT_MESSAGE)
  );

  // The title updates just after a client-side navigation, so read it a beat later.
  useEffect(() => {
    const t = window.setTimeout(() => setHref(buildWhatsAppUrl(env.WHATSAPP_NUMBER, messageFor(pathname))), 400);
    return () => window.clearTimeout(t);
  }, [pathname]);

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Rebuild at click time so the message always names the page on screen.
    e.currentTarget.href = buildWhatsAppUrl(env.WHATSAPP_NUMBER, messageFor(pathname));
    trackEvent("whatsapp_click", { placement: "floating_button" });
    onTap();
  };

  const bottom = lifted
    ? "calc(max(1.5rem, env(safe-area-inset-bottom, 0px)) + 4.5rem)"
    : "max(1.25rem, calc(env(safe-area-inset-bottom, 0px) + 0.75rem))";

  return (
    <div
      className="fixed z-40 right-4 sm:right-6"
      style={{ bottom, marginRight: "env(safe-area-inset-right, 0px)" }}
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with PIKORUA on WhatsApp"
        onClick={handleClick}
        tabIndex={visible ? 0 : -1}
        aria-hidden={!visible || undefined}
        style={{
          transition: `translate 500ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${visible ? 240 : 160}ms ease-out`,
        }}
        className={cn(
          "group relative flex items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne-gold",
          tucked && visible && "translate-y-[calc(100%+2.5rem)] focus-visible:translate-y-0",
          !visible && "pointer-events-none opacity-0"
        )}
      >
        {/* Label, desktop hover / keyboard focus only */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-sm border border-champagne-gold/30 bg-lux-black/90 px-3 py-1.5 font-sans text-[10px] uppercase tracking-[0.2em] text-ivory opacity-0 translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0 lg:block"
        >
          Chat on WhatsApp
        </span>
        <span
          key={glintKey}
          data-nudge={glintKey > 0 ? "glint" : undefined}
          style={{ "--dock-ny": "0px" } as CSSProperties}
          className="dock-face flex h-[52px] w-[52px] items-center justify-center rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.45)] group-hover:border-muted-gold lg:h-14 lg:w-14"
        >
          <WhatsAppIcon className="h-6 w-6 text-whatsapp lg:h-[26px] lg:w-[26px]" />
        </span>
      </a>
    </div>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
