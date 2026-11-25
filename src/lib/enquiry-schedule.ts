/**
 * Timing for the enquiry pop-up, the edge-tab nudge and the WhatsApp glint.
 *
 * Every time here is "active" time: milliseconds the visitor has had the site
 * on screen during this visit. Time spent in another browser tab or app does
 * not count, so a visitor never returns to a pop-up that fired while they were
 * away. State lives in sessionStorage, so it carries across pages and reloads
 * and starts fresh on the next visit.
 *
 * Schedule (agreed with the business, 24 Nov 2026):
 *   - first pop-up after 20 s;
 *   - after the first close, the next one 1 min later;
 *   - after every later close, 2 min later;
 *   - a WhatsApp tap restarts the countdown: next pop-up 2 min after it;
 *   - while closed, the tab nudges every 30 s and the WhatsApp button glints
 *     halfway between (15 s, 45 s, ...), with one early glint at 10 s on arrival;
 *   - after any lead form is submitted, no more pop-ups or nudges this visit.
 */

export const FIRST_POPUP_MS = 20_000;
export const SECOND_POPUP_GAP_MS = 60_000;
export const LATER_POPUP_GAP_MS = 120_000;
export const WHATSAPP_RESTART_MS = 120_000;
export const NUDGE_EVERY_MS = 30_000;
export const WHATSAPP_GLINT_OFFSET_MS = 15_000;
export const FIRST_WHATSAPP_GLINT_MS = 10_000;

export interface EnquirySchedule {
  /** Visible time on the site this visit. */
  activeMs: number;
  /** How many times the visitor has closed the pop-up (or tapped WhatsApp). */
  closes: number;
  /** activeMs at which the pop-up opens by itself. */
  nextOpenAt: number;
  /** activeMs of the last close; nudges are counted from here. */
  anchorAt: number;
}

export function initialSchedule(): EnquirySchedule {
  return { activeMs: 0, closes: 0, nextOpenAt: FIRST_POPUP_MS, anchorAt: 0 };
}

/** The visitor closed the pop-up (X, "Not now", backdrop or Esc). */
export function scheduleAfterClose(s: EnquirySchedule): EnquirySchedule {
  const closes = s.closes + 1;
  const gap = closes === 1 ? SECOND_POPUP_GAP_MS : LATER_POPUP_GAP_MS;
  return { ...s, closes, anchorAt: s.activeMs, nextOpenAt: s.activeMs + gap };
}

/**
 * The visitor tapped the WhatsApp button. Because only visible time counts,
 * "2 minutes after the tap" means 2 minutes after they come back from WhatsApp.
 * Later closes then use the 2-minute gap.
 */
export function scheduleAfterWhatsAppTap(s: EnquirySchedule): EnquirySchedule {
  return {
    ...s,
    closes: Math.max(s.closes, 1),
    anchorAt: s.activeMs,
    nextOpenAt: s.activeMs + WHATSAPP_RESTART_MS,
  };
}

function crossedPeriodic(prev: number, now: number, offset: number, period: number): boolean {
  if (now < offset) return false;
  const after = Math.floor((now - offset) / period);
  const before = prev < offset ? -1 : Math.floor((prev - offset) / period);
  return after > before;
}

/**
 * Which nudges fall in the active-time window (prevMs, nowMs], given the
 * schedule as it stood. Call only while the pop-up is closed.
 */
export function nudgesDue(
  s: EnquirySchedule,
  prevMs: number,
  nowMs: number
): { enquiry: boolean; whatsapp: boolean } {
  const prev = prevMs - s.anchorAt;
  const now = nowMs - s.anchorAt;
  if (now <= 0 || now <= prev) return { enquiry: false, whatsapp: false };

  const enquiry = crossedPeriodic(prev, now, NUDGE_EVERY_MS, NUDGE_EVERY_MS);
  const onArrival = s.closes === 0 && s.anchorAt === 0;
  const whatsapp = onArrival
    ? // Arrival: one early glint at 10 s, then 45 s, 75 s, ... (15 s is skipped).
      (prev < FIRST_WHATSAPP_GLINT_MS && now >= FIRST_WHATSAPP_GLINT_MS) ||
      crossedPeriodic(prev, now, WHATSAPP_GLINT_OFFSET_MS + NUDGE_EVERY_MS, NUDGE_EVERY_MS)
    : crossedPeriodic(prev, now, WHATSAPP_GLINT_OFFSET_MS, NUDGE_EVERY_MS);

  return { enquiry, whatsapp };
}

// ─── Session storage ────────────────────────────────────────────────────────

const SCHEDULE_KEY = "pikorua_enquiry_schedule";
const SUBMITTED_KEY = "pikorua_popup_submitted";
const DRAFT_KEY = "pikorua_popup_draft";

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null;
  }
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v) && v >= 0;
}

export function loadSchedule(): EnquirySchedule {
  try {
    const raw = storage()?.getItem(SCHEDULE_KEY);
    if (!raw) return initialSchedule();
    const v = JSON.parse(raw) as Partial<EnquirySchedule>;
    if (
      isFiniteNumber(v.activeMs) &&
      isFiniteNumber(v.closes) &&
      isFiniteNumber(v.nextOpenAt) &&
      isFiniteNumber(v.anchorAt)
    ) {
      return { activeMs: v.activeMs, closes: v.closes, nextOpenAt: v.nextOpenAt, anchorAt: v.anchorAt };
    }
  } catch {
    // Corrupt or blocked storage: start fresh.
  }
  return initialSchedule();
}

export function saveSchedule(s: EnquirySchedule): void {
  try {
    storage()?.setItem(SCHEDULE_KEY, JSON.stringify(s));
  } catch {
    // Storage full or blocked: timing still works for this page.
  }
}

/** Called once any lead form succeeds: no more pop-ups or nudges this visit. */
export function markLeadSubmitted(): void {
  try {
    storage()?.setItem(SUBMITTED_KEY, String(Date.now()));
  } catch {
    // ignore
  }
}

export function hasSubmittedThisVisit(): boolean {
  try {
    return storage()?.getItem(SUBMITTED_KEY) != null;
  } catch {
    return false;
  }
}

/** What the visitor typed into the pop-up, kept for the visit until they submit. */
export interface PopupDraft {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  category: string;
  budgetBand: string;
  /** Call window in the visitor's own time (shown only to visitors abroad). */
  callWindow: string;
}

export const EMPTY_DRAFT: PopupDraft = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  category: "",
  budgetBand: "",
  callWindow: "",
};

export function loadDraft(): PopupDraft {
  try {
    const raw = storage()?.getItem(DRAFT_KEY);
    if (!raw) return EMPTY_DRAFT;
    const v = JSON.parse(raw) as Record<string, unknown>;
    const pick = (k: keyof PopupDraft) => (typeof v[k] === "string" ? (v[k] as string).slice(0, 254) : "");
    return {
      firstName: pick("firstName"),
      lastName: pick("lastName"),
      email: pick("email"),
      phone: pick("phone"),
      category: pick("category"),
      budgetBand: pick("budgetBand"),
      callWindow: pick("callWindow"),
    };
  } catch {
    return EMPTY_DRAFT;
  }
}

export function saveDraft(d: PopupDraft): void {
  try {
    const empty = Object.values(d).every((v) => v === "");
    if (empty) storage()?.removeItem(DRAFT_KEY);
    else storage()?.setItem(DRAFT_KEY, JSON.stringify(d));
  } catch {
    // ignore
  }
}

export function clearDraft(): void {
  try {
    storage()?.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}
