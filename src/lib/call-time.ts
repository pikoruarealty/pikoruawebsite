/**
 * call-time.ts
 *
 * "Book a call in your time zone": the zones NRI buyers most often call from,
 * the time windows they can pick (in their own time), and the line saved in
 * `preferred_callback_time` so the team sees both the visitor's time and the
 * India time it falls on, e.g.
 *   "Evening 5–9 PM, London time (10:30 PM–2:30 AM IST)".
 *
 * Browser-only helpers (Intl) — safe to import from client components.
 */

import { useState, useSyncExternalStore } from "react";

export const INDIA_ZONE = "Asia/Kolkata";

export interface CallZone {
  id: string;
  label: string;
  /** Short name used in the saved line. */
  city: string;
}

export const CALL_ZONES: CallZone[] = [
  { id: "America/New_York", label: "USA – Eastern (New York, New Jersey)", city: "New York" },
  { id: "America/Chicago", label: "USA – Central (Chicago, Texas)", city: "Chicago" },
  { id: "America/Los_Angeles", label: "USA – Pacific (California)", city: "California" },
  { id: "America/Toronto", label: "Canada – Eastern (Toronto)", city: "Toronto" },
  { id: "America/Vancouver", label: "Canada – Pacific (Vancouver)", city: "Vancouver" },
  { id: "Europe/London", label: "UK (London, Leicester)", city: "London" },
  { id: "Asia/Dubai", label: "UAE / Oman (Dubai)", city: "Dubai" },
  { id: "Asia/Riyadh", label: "Saudi Arabia / Qatar / Kuwait", city: "Riyadh" },
  { id: "Asia/Singapore", label: "Singapore", city: "Singapore" },
  { id: "Australia/Sydney", label: "Australia – Sydney / Melbourne", city: "Sydney" },
  { id: "Australia/Perth", label: "Australia – Perth", city: "Perth" },
  { id: "Pacific/Auckland", label: "New Zealand", city: "Auckland" },
  { id: "Africa/Nairobi", label: "East Africa (Nairobi, Kampala, Dar es Salaam)", city: "Nairobi" },
  { id: INDIA_ZONE, label: "India (IST)", city: "India" },
];

export interface CallWindow {
  id: string;
  label: string;
  /** Hours in the visitor's own time, 24-hour clock. Null = any time. */
  start: number | null;
  end: number | null;
}

export const CALL_WINDOWS: CallWindow[] = [
  { id: "morning", label: "Morning (9 AM – 12 PM)", start: 9, end: 12 },
  { id: "afternoon", label: "Afternoon (12 – 5 PM)", start: 12, end: 17 },
  { id: "evening", label: "Evening (5 – 9 PM)", start: 17, end: 21 },
  { id: "any", label: "Any time", start: null, end: null },
];

const ZONE_ALIASES: Record<string, string> = { "Asia/Calcutta": INDIA_ZONE };

function normaliseZone(zone: string): string {
  return ZONE_ALIASES[zone] ?? zone;
}

export function isIndiaZone(zone: string | null | undefined): boolean {
  return Boolean(zone) && normaliseZone(zone as string) === INDIA_ZONE;
}

function readBrowserZone(): string | null {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return zone ? normaliseZone(zone) : null;
  } catch {
    return null;
  }
}

const noopSubscribe = () => () => {};

/** The visitor's time zone (browser setting). Null during server rendering. */
export function useVisitorTimeZone(): string | null {
  return useSyncExternalStore(noopSubscribe, readBrowserZone, () => null);
}

/** Zone choices for a select: the list above, plus the visitor's own zone if it isn't in it. */
export function zoneOptions(detected: string | null): CallZone[] {
  if (!detected || CALL_ZONES.some((z) => z.id === detected)) return CALL_ZONES;
  const city = cityOf(detected);
  return [{ id: detected, label: `${city} (your time zone)`, city }, ...CALL_ZONES];
}

function cityOf(zone: string): string {
  const known = CALL_ZONES.find((z) => z.id === zone);
  if (known) return known.city;
  return (zone.split("/").pop() ?? zone).replace(/_/g, " ");
}

/** Minutes the zone is ahead of UTC at `at` (handles daylight saving). */
function utcOffsetMinutes(zone: string, at: Date): number | null {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).formatToParts(at);
    const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
    const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"));
    const whole = Math.floor(at.getTime() / 60000) * 60000;
    return Math.round((asUtc - whole) / 60000);
  } catch {
    return null;
  }
}

function clock(minutesOfDay: number): string {
  const m = ((minutesOfDay % 1440) + 1440) % 1440;
  const h24 = Math.floor(m / 60);
  const min = m % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}${min ? `:${String(min).padStart(2, "0")}` : ""} ${h24 < 12 ? "AM" : "PM"}`;
}

/** The window in India time, e.g. "10:30 PM–2:30 AM IST", or null if it can't be worked out. */
export function windowInIst(zone: string, windowId: string, at: Date = new Date()): string | null {
  const win = CALL_WINDOWS.find((w) => w.id === windowId);
  if (!win || win.start === null || win.end === null) return null;
  const offset = utcOffsetMinutes(zone, at);
  if (offset === null) return null;
  const shift = 330 - offset; // IST is UTC+5:30
  return `${clock(win.start * 60 + shift)}–${clock(win.end * 60 + shift)} IST`;
}

/** The line saved with the lead (max 100 characters, the schema's limit). */
export function describeCallTime(zone: string, windowId: string, at: Date = new Date()): string {
  const win = CALL_WINDOWS.find((w) => w.id === windowId);
  if (!win) return "";
  const india = isIndiaZone(zone);
  const where = india ? "India time" : `${cityOf(zone)} time`;
  const label = win.start === null ? "Any time" : win.label.replace(/[()]/g, "").replace(/\s+–\s+/, "–");
  const ist = india ? null : windowInIst(zone, windowId, at);
  return `${label}, ${where}${ist ? ` (${ist})` : ""}`.slice(0, 100);
}

/**
 * State for the "call in your time zone" fields in a lead form.
 * `always` shows them to everyone (NRI pages); otherwise only visitors whose
 * browser is set outside India get them, and everyone else keeps the form's
 * ordinary India-time callback select.
 */
export function useCallTimeChoice(always = false) {
  const detectedZone = useVisitorTimeZone();
  const [chosenZone, setZone] = useState("");
  const [callWindow, setCallWindow] = useState("");
  const zoneMode = always || (detectedZone !== null && !isIndiaZone(detectedZone));
  const zone = chosenZone || detectedZone || "";
  const istHint = zone && !isIndiaZone(zone) && callWindow ? windowInIst(zone, callWindow) : null;

  /** The preferred_callback_time to send: the zone fields in zone mode, else `fallback`. */
  function callbackTime(fallback: string): string {
    if (!zoneMode) return fallback;
    if (!zone) return "";
    if (callWindow) return describeCallTime(zone, callWindow);
    return isIndiaZone(zone) ? "" : describeCallTime(zone, "any");
  }

  return {
    zoneMode,
    zone,
    setZone,
    callWindow,
    setCallWindow,
    istHint,
    zones: zoneOptions(detectedZone),
    callbackTime,
  };
}

/** Text under the call fields. */
export function callTimeHint(istHint: string | null): string {
  return istHint
    ? `That is ${istHint.replace(" IST", "")} in India. We confirm the exact time with you on WhatsApp before the call.`
    : "We call on WhatsApp at a time that suits your day, and confirm it with you first.";
}
