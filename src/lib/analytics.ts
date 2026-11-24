import { markLeadSubmitted } from "@/lib/enquiry-schedule";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackPageView(url: string): void {
  if (typeof window === "undefined") return;

  if (window.gtag) {
    window.gtag("event", "page_view", {
      page_location: url,
      page_path: window.location.pathname,
      page_title: document.title,
    });
  }

  if (window.dataLayer) {
    window.dataLayer.push({
      event: "page_view",
      page_location: url,
      page_path: window.location.pathname,
      page_title: document.title,
    });
  }
}

export function trackLeadSubmit(source: string, extra?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;

  // Every lead form calls this on success, so it is also where the enquiry
  // pop-up learns to stay away for the rest of the visit.
  markLeadSubmitted();

  if (window.gtag) {
    window.gtag("event", "generate_lead", {
      lead_source: source,
      ...extra,
    });
  }

  if (!window.dataLayer) return;
  window.dataLayer.push({
    event: "lead_submit",
    lead_source: source,
    ...extra,
  });
}

/** A plain GA4 / GTM event, e.g. a WhatsApp or enquiry-tab click. */
export function trackEvent(name: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  const payload = { page_path: window.location.pathname, ...params };
  window.gtag?.("event", name, payload);
  window.dataLayer?.push({ event: name, ...payload });
}
