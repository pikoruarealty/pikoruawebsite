/**
 * Campaign attribution for lead forms (browser only).
 *
 * A visitor often lands on a tagged URL (?utm_source=google&utm_campaign=...)
 * and fills in a form on a later page, where the tags are gone. The first
 * tagged landing of the browser session is remembered here and sent with
 * every lead, so the CRM can tell which campaign produced the enquiry.
 * Stored in sessionStorage; if storage is blocked, the current URL is used.
 */
import { extractUtm } from "@/lib/utils";

const STORAGE_KEY = "pikorua:utm";
const UTM_KEYS = new Set(["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]);
const MAX_VALUE_LENGTH = 200;

function clean(input: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (!input || typeof input !== "object") return out;
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (UTM_KEYS.has(key) && typeof value === "string" && value.trim()) {
      out[key] = value.trim().slice(0, MAX_VALUE_LENGTH);
    }
  }
  return out;
}

/** Remembers the UTM tags in `search` unless this session already has some (first touch wins). */
export function rememberUtm(search: string): void {
  const utm = clean(extractUtm(new URLSearchParams(search)));
  if (Object.keys(utm).length === 0) return;
  try {
    if (!window.sessionStorage.getItem(STORAGE_KEY)) {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(utm));
    }
  } catch {
    // Storage blocked (private mode, settings): getLeadUtm falls back to the URL.
  }
}

/** UTM tags to send with a lead, or undefined when the visit was untagged. */
export function getLeadUtm(): Record<string, string> | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const stored = clean(JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) ?? "null"));
    if (Object.keys(stored).length > 0) return stored;
  } catch {
    // Unreadable or blocked storage: use the current URL instead.
  }
  const current = clean(extractUtm(new URLSearchParams(window.location.search)));
  return Object.keys(current).length > 0 ? current : undefined;
}
