"use client";

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import Image from "next/image";
import { animate, motion, useReducedMotion, type AnimationPlaybackControls } from "framer-motion";
import { X, CheckCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { getLeadUtm } from "@/lib/attribution";
import { trackLeadSubmit } from "@/lib/analytics";
import { clearDraft, loadDraft, saveDraft, type PopupDraft } from "@/lib/enquiry-schedule";

/**
 * The enquiry pop-up. EnquiryDock decides when it opens; this component draws
 * it and morphs it out of the edge tab (`anchorRef`) and back into it.
 *
 * Phases: closed → opening → open → closing → closed. During opening/closing a
 * plain "ghost" box carries the panel's background between the tab's rect and
 * the panel's rect while the form itself fades in or out.
 */
export type PopupPhase = "closed" | "opening" | "open" | "closing";

type FormState = "idle" | "submitting" | "success" | "error";

interface FieldError {
  name?: string[];
  phone?: string[];
  email?: string[];
  category?: string[];
  budgetBand?: string[];
}

const CATEGORIES = [
  { value: "apartment", label: "4 BHK or 5 BHK Apartment" },
  { value: "penthouse", label: "Penthouse or Duplex" },
  { value: "villa", label: "Villa or Bungalow" },
  { value: "plot", label: "Premium Plot" },
  { value: "residential-investment", label: "Investment Property" },
  { value: "office", label: "Office" },
  { value: "showroom", label: "Showroom" },
];

const BUDGETS = [
  { value: "1-2cr", label: "₹1 Cr – ₹2 Cr" },
  { value: "3-4cr", label: "₹3 Cr – ₹4 Cr" },
  { value: "5-7cr", label: "₹5 Cr – ₹7 Cr" },
  { value: "8-10cr", label: "₹8 Cr – ₹10 Cr" },
  { value: "10cr-plus", label: "₹10 Cr and above" },
];

const selectBase =
  "w-full appearance-none bg-lux-black border border-white/[0.08] text-ivory text-xs font-sans px-4 py-3 pr-10 rounded-sm focus:outline-none focus:border-champagne-gold/50 transition-colors duration-200 cursor-pointer";

const inputBase =
  "w-full bg-lux-black border border-white/[0.08] text-ivory text-xs font-sans px-4 py-3 rounded-sm placeholder:text-ivory/20 focus:outline-none focus:border-champagne-gold/50 transition-colors duration-200";

// Motion
const OPEN_EASE = [0.22, 1, 0.36, 1] as const;
const CLOSE_EASE = [0.65, 0, 0.35, 1] as const;
const OPEN_DURATION = 0.72;
const CLOSE_DURATION = 0.62;
const TAB_RADIUS = "6px 0px 0px 6px";
const PANEL_RADIUS = "6px 6px 6px 6px";
const TAB_SHADOW = "0px 0px 0px rgba(0, 0, 0, 0)";
const PANEL_SHADOW = "0px 40px 100px rgba(0, 0, 0, 0.85)";

interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

function boxOf(el: Element | null): Box | null {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width === 0 || r.height === 0) return null;
  return { left: r.left, top: r.top, width: r.width, height: r.height };
}

function placeGhost(el: HTMLElement, box: Box, radius: string, shadow: string) {
  el.style.left = `${box.left}px`;
  el.style.top = `${box.top}px`;
  el.style.width = `${box.width}px`;
  el.style.height = `${box.height}px`;
  el.style.borderRadius = radius;
  el.style.boxShadow = shadow;
  el.style.visibility = "visible";
}

interface LeadCapturePopupProps {
  phase: PopupPhase;
  /** The edge tab's box: where the pop-up comes from and returns to. */
  anchorRef: RefObject<HTMLDivElement | null>;
  dialogId: string;
  onOpened: () => void;
  onRequestClose: () => void;
  onClosed: () => void;
}

export function LeadCapturePopup({
  phase,
  anchorRef,
  dialogId,
  onOpened,
  onRequestClose,
  onClosed,
}: LeadCapturePopupProps) {
  // Form state. What the visitor types is kept for the visit, so a half-filled
  // form is still filled in when the pop-up comes back.
  const [draft, setDraft] = useState<PopupDraft>(() => loadDraft());
  const [formState, setFormState] = useState<FormState>("idle");
  const [fieldErrors, setFieldErrors] = useState<FieldError>({});
  const [errorMsg, setErrorMsg] = useState("");

  const backdropRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const edgeRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();

  // Latest callbacks, so the animation effect only re-runs on phase changes.
  const callbacks = useRef({ onOpened, onClosed });
  useEffect(() => {
    callbacks.current = { onOpened, onClosed };
  });

  useEffect(() => {
    saveDraft(draft);
  }, [draft]);

  const update = (field: keyof PopupDraft) => (value: string) =>
    setDraft((d) => ({ ...d, [field]: value }));

  // ── Open / close animation ───────────────────────────────────────────────
  useLayoutEffect(() => {
    if (phase !== "opening" && phase !== "closing") return;
    const ghost = ghostRef.current;
    const edge = edgeRef.current;
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel || !backdrop) return;

    const running: AnimationPlaybackControls[] = [];
    let cancelled = false;
    const tabBox = boxOf(anchorRef.current);
    const panelBox = boxOf(panel);
    const morph = !reduceMotion && ghost && edge && tabBox && panelBox;

    if (phase === "opening") {
      const active = document.activeElement;
      returnFocusRef.current = active instanceof HTMLElement ? active : null;

      running.push(animate(backdrop, { opacity: [0, 1] }, { duration: morph ? 0.56 : 0.2, ease: "easeOut" }));
      const reveal = morph
        ? animate(
            panel,
            { opacity: [0, 1], transform: ["translateY(10px)", "translateY(0px)"] },
            { duration: 0.34, delay: 0.44, ease: "easeOut" }
          )
        : animate(panel, { opacity: [0, 1] }, { duration: 0.2, ease: "easeOut" });
      running.push(reveal);
      if (!morph) {
        // No tab to grow out of (or reduced motion): plain fade with the panel's own background.
        panel.style.backgroundColor = "var(--soft-black)";
        panel.style.borderColor = "color-mix(in srgb, var(--white) 6%, transparent)";
      }

      let done: Promise<unknown> = reveal.finished;
      if (morph) {
        placeGhost(ghost, tabBox, TAB_RADIUS, TAB_SHADOW);
        edge.style.opacity = "1";
        running.push(animate(edge, { opacity: [1, 0] }, { duration: OPEN_DURATION * 0.8, ease: "easeOut" }));
        const grow = animate(
          ghost,
          {
            left: [tabBox.left, panelBox.left],
            top: [tabBox.top, panelBox.top],
            width: [tabBox.width, panelBox.width],
            height: [tabBox.height, panelBox.height],
            borderRadius: [TAB_RADIUS, PANEL_RADIUS],
            boxShadow: [TAB_SHADOW, PANEL_SHADOW],
          },
          { duration: OPEN_DURATION, ease: OPEN_EASE }
        );
        running.push(grow);
        done = Promise.all([grow.finished, reveal.finished]);
      }
      done.then(() => {
        if (cancelled) return;
        panel.focus({ preventScroll: true });
        callbacks.current.onOpened();
      });
    } else {
      // closing
      running.push(animate(backdrop, { opacity: [1, 0] }, { duration: morph ? 0.56 : 0.2, delay: morph ? 0.12 : 0, ease: "easeInOut" }));
      const fade = morph
        ? animate(
            panel,
            { opacity: [1, 0], transform: ["translateY(0px)", "translateY(6px)"] },
            { duration: 0.16, ease: "easeIn" }
          )
        : animate(panel, { opacity: [1, 0] }, { duration: 0.2, ease: "easeIn" });
      running.push(fade);

      let done: Promise<unknown> = fade.finished;
      if (morph) {
        placeGhost(ghost, panelBox, PANEL_RADIUS, PANEL_SHADOW);
        edge.style.opacity = "0";
        running.push(animate(edge, { opacity: [0, 1] }, { duration: CLOSE_DURATION * 0.7, delay: 0.12 + CLOSE_DURATION * 0.3, ease: "easeIn" }));
        const shrink = animate(
          ghost,
          {
            left: [panelBox.left, tabBox.left],
            top: [panelBox.top, tabBox.top],
            width: [panelBox.width, tabBox.width],
            height: [panelBox.height, tabBox.height],
            borderRadius: [PANEL_RADIUS, TAB_RADIUS],
            boxShadow: [PANEL_SHADOW, TAB_SHADOW],
          },
          { duration: CLOSE_DURATION, delay: 0.12, ease: CLOSE_EASE }
        );
        running.push(shrink);
        done = shrink.finished;
      }
      done.then(() => {
        if (cancelled) return;
        const back = returnFocusRef.current;
        returnFocusRef.current = null;
        if (back && back.isConnected && panel.contains(document.activeElement)) {
          back.focus({ preventScroll: true });
        }
        callbacks.current.onClosed();
      });
    }

    return () => {
      cancelled = true;
      running.forEach((a) => a.stop());
    };
  }, [phase, anchorRef, reduceMotion]);

  // Esc closes, like the X.
  useEffect(() => {
    if (phase !== "open") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onRequestClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [phase, onRequestClose]);

  const dismiss = () => {
    if (phase === "open") onRequestClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setErrorMsg("");
    setFormState("submitting");

    const fullName = [draft.firstName.trim(), draft.lastName.trim()].filter(Boolean).join(" ");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "popup",
          name: fullName,
          phone: draft.phone,
          email: draft.email,
          category: draft.category || undefined,
          budgetBand: draft.budgetBand || undefined,
          consent: true,
          honeypot: "",
          utm: getLeadUtm(),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        if (res.status === 422 && json.fields) {
          setFieldErrors(json.fields as FieldError);
          setFormState("idle");
          return;
        }
        throw new Error(json.error ?? "Submission failed");
      }

      setFormState("success");
      // Also tells EnquiryDock: no more pop-ups this visit.
      trackLeadSubmit("popup");
      clearDraft();

      // Give the confirmation a moment, then return the visitor to the website.
      window.setTimeout(() => {
        window.location.assign("/");
      }, 1400);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
      setFormState("error");
    }
  };

  if (phase === "closed") return null;

  const settled = phase === "open" || Boolean(reduceMotion);

  return (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="fixed inset-0 z-[8000] bg-black/75 backdrop-blur-sm"
        style={phase === "opening" ? { opacity: 0 } : undefined}
        onClick={dismiss}
        aria-hidden="true"
      />

      {/* Ghost: the panel's background travelling between the tab and the panel */}
      {(phase === "opening" || phase === "closing") && !reduceMotion && (
        <div
          ref={ghostRef}
          aria-hidden="true"
          className="pointer-events-none fixed z-[8001] overflow-hidden bg-soft-black"
          style={{ visibility: "hidden", left: 0, top: 0, width: 0, height: 0 }}
        >
          <div className="absolute inset-0 rounded-[inherit] border border-white/[0.06]" />
          <div ref={edgeRef} className="absolute inset-0 rounded-[inherit] border border-champagne-gold/55" />
        </div>
      )}

      {/* Panel */}
      <div className="fixed inset-0 z-[8002] flex items-start sm:items-center justify-center p-4 overflow-y-auto pointer-events-none">
        <div
          ref={panelRef}
          id={dialogId}
          role="dialog"
          aria-modal="true"
          aria-labelledby="popup-title"
          tabIndex={-1}
          // The box itself takes focus for screen readers; the site-wide gold focus
          // ring (and its radius) would otherwise frame the whole pop-up.
          style={{ outline: "none", borderRadius: "0.375rem", ...(phase === "opening" ? { opacity: 0 } : {}) }}
          className={cn(
            "popup-mobile-surface relative w-full max-w-[420px] max-h-[calc(100dvh-2rem)] pointer-events-auto border rounded-md overflow-x-hidden overflow-y-auto focus:outline-none",
            settled
              ? "bg-soft-black border-white/[0.06] shadow-[0_40px_100px_rgba(0,0,0,0.85)]"
              : "bg-transparent border-transparent shadow-none"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={dismiss}
            aria-label="Close"
            id="popup-close-btn"
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-champagne-gold"
          >
            <X size={15} strokeWidth={2} className="text-ivory/70" />
          </button>

          <div className="px-7 pt-9 pb-8">
            {formState === "success" ? (
              // ── Success State ────────────────────────────────────────
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center text-center gap-4 py-8"
              >
                <CheckCircle
                  size={44}
                  strokeWidth={1.2}
                  className="text-champagne-gold"
                />
                <h2 className="font-display text-2xl text-white font-normal uppercase tracking-wide">
                  Thank You
                </h2>
                <p className="text-ivory/50 font-sans text-xs leading-relaxed max-w-[260px]">
                  Our advisory team will reach out to you personally, shortly.
                </p>
              </motion.div>
            ) : (
              // ── Form State ───────────────────────────────────────────
              <>
                {/* Logo (Centered) */}
                <div className="flex justify-center mb-6">
                  <Image
                    src="/logo.png"
                    alt="PIKORUA Realty"
                    width={224}
                    height={48}
                    quality={75}
                    className="h-10 w-auto object-contain"
                  />
                </div>

                {/* Title */}
                <div className="text-center mb-6">
                  <h2
                    id="popup-title"
                    className="font-display text-2xl text-white font-normal leading-tight uppercase tracking-wide"
                  >
                    A World of<br />Luxury Living
                  </h2>
                  {/* Gold underline */}
                  <div className="mx-auto mt-4 w-10 h-px bg-champagne-gold/50" aria-hidden="true" />
                </div>

                <form
                  id="lead-capture-form"
                  onSubmit={handleSubmit}
                  noValidate
                  className="flex flex-col gap-3"
                >
                  {/* Honeypot */}
                  <input
                    type="text"
                    name="honeypot"
                    tabIndex={-1}
                    aria-hidden="true"
                    className="hidden"
                    autoComplete="off"
                  />

                  {/* Dropdown — Category */}
                  <div className="relative">
                    <select
                      id="popup-category"
                      aria-label="Property type"
                      aria-invalid={Boolean(fieldErrors.category?.length)}
                      value={draft.category}
                      onChange={(e) => update("category")(e.target.value)}
                      className={cn(
                        selectBase,
                        !draft.category ? "text-ivory/40" : "text-ivory"
                      )}
                    >
                      <option value="" disabled>Select a Property Type</option>
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      strokeWidth={2}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-champagne-gold pointer-events-none"
                    />
                  </div>

                  {/* Dropdown — Budget */}
                  <div className="relative">
                    <select
                      id="popup-budget"
                      aria-label="Budget range in Indian rupees"
                      aria-invalid={Boolean(fieldErrors.budgetBand?.length)}
                      value={draft.budgetBand}
                      onChange={(e) => update("budgetBand")(e.target.value)}
                      className={cn(
                        selectBase,
                        !draft.budgetBand ? "text-ivory/40" : "text-ivory"
                      )}
                    >
                      <option value="" disabled>Select Your Budget (INR)</option>
                      {BUDGETS.map((b) => (
                        <option key={b.value} value={b.value}>{b.label}</option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      strokeWidth={2}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-champagne-gold pointer-events-none"
                    />
                  </div>

                  {/* First + Last Name */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        id="popup-first-name"
                        type="text"
                        autoComplete="given-name"
                        required
                        value={draft.firstName}
                        onChange={(e) => update("firstName")(e.target.value)}
                        placeholder="First Name"
                        className={cn(
                          inputBase,
                          fieldErrors.name ? "border-red-400" : ""
                        )}
                      />
                    </div>
                    <div>
                      <input
                        id="popup-last-name"
                        type="text"
                        autoComplete="family-name"
                        value={draft.lastName}
                        onChange={(e) => update("lastName")(e.target.value)}
                        placeholder="Last Name"
                        className={inputBase}
                      />
                    </div>
                  </div>
                  {fieldErrors.name && (
                    <p className="text-[10px] text-red-400 font-sans -mt-1">
                      {fieldErrors.name[0]}
                    </p>
                  )}

                  {/* Email + Phone */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        id="popup-email"
                        type="email"
                        autoComplete="email"
                        required
                        value={draft.email}
                        onChange={(e) => update("email")(e.target.value)}
                        placeholder="Your Email"
                        className={cn(
                          inputBase,
                          fieldErrors.email ? "border-red-400" : ""
                        )}
                      />
                      {fieldErrors.email && (
                        <p className="text-[10px] text-red-400 font-sans mt-1">
                          {fieldErrors.email[0]}
                        </p>
                      )}
                    </div>
                    <div>
                      <input
                        id="popup-phone"
                        type="tel"
                        autoComplete="tel"
                        required
                        value={draft.phone}
                        onChange={(e) => update("phone")(e.target.value)}
                        placeholder="+1234567890"
                        className={cn(
                          inputBase,
                          fieldErrors.phone ? "border-red-400" : ""
                        )}
                      />
                      {fieldErrors.phone && (
                        <p className="text-[10px] text-red-400 font-sans mt-1">
                          {fieldErrors.phone[0]}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Global error */}
                  {formState === "error" && errorMsg && (
                    <p className="text-[10px] text-red-400 font-sans">
                      {errorMsg}
                    </p>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    id="popup-submit-btn"
                    disabled={formState === "submitting"}
                    className={cn(
                      "mt-1 w-full px-6 py-3.5 text-[10px] font-sans uppercase tracking-[0.2em] transition-all duration-300 rounded-sm border focus-visible:outline-2 focus-visible:outline-champagne-gold",
                      formState === "submitting"
                        ? "border-champagne-gold/15 text-champagne-gold/30 cursor-not-allowed bg-transparent"
                        : "text-lux-black bg-champagne-gold border-champagne-gold hover:bg-antique-gold hover:border-antique-gold"
                    )}
                  >
                    {formState === "submitting" ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-champagne-gold/30 border-t-champagne-gold rounded-full animate-spin" />
                        Sending…
                      </span>
                    ) : (
                      "Submit"
                    )}
                  </button>

                  {/* Dismiss */}
                  <button
                    type="button"
                    onClick={dismiss}
                    className="text-[9px] uppercase tracking-[0.15em] text-ivory/20 font-sans hover:text-ivory/40 transition-colors duration-150 text-center pt-1"
                  >
                    Not now
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
