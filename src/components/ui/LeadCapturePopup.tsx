"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { getLeadUtm } from "@/lib/attribution";
import { trackLeadSubmit } from "@/lib/analytics";

// Keep the popup from repeating inside the same browser session after submit.
// A fresh visit/session should still see it again after the configured delay.
const SUBMITTED_KEY = "pikorua_popup_submitted";
const RESHOW_DELAY_MS = 2 * 60 * 1000; // 2 minutes

function hasSubmittedBefore(): boolean {
  return sessionStorage.getItem(SUBMITTED_KEY) !== null;
}

const DISMISSED_KEY = "pikorua_popup_dismissed_at";

function hasDismissedRecently(): boolean {
  if (typeof window === "undefined") return false;
  const dismissedAt = sessionStorage.getItem(DISMISSED_KEY);
  if (!dismissedAt) return false;
  return Date.now() - Number(dismissedAt) < RESHOW_DELAY_MS;
}

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

interface LeadCapturePopupProps {
  openOnMount?: boolean;
}

export function LeadCapturePopup({ openOnMount = false }: LeadCapturePopupProps) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("");
  const [budgetBand, setBudgetBand] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [fieldErrors, setFieldErrors] = useState<FieldError>({});
  const [errorMsg, setErrorMsg] = useState("");
  const reshowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearReshowTimer() {
    if (reshowTimerRef.current) {
      clearTimeout(reshowTimerRef.current);
      reshowTimerRef.current = null;
    }
  }

  const pathname = usePathname();

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));

    // Never show lead popup on the admin console
    if (pathname?.startsWith("/admin")) {
      return () => cancelAnimationFrame(frame);
    }

    if (typeof window !== "undefined" && (hasSubmittedBefore() || hasDismissedRecently())) {
      // If they dismissed recently, set a timer for the remaining time
      if (hasDismissedRecently()) {
        const lastDismissed = Number(sessionStorage.getItem(DISMISSED_KEY) || 0);
        const timePassed = Date.now() - lastDismissed;
        const timeLeft = RESHOW_DELAY_MS - timePassed;
        if (timeLeft > 0) {
          clearReshowTimer();
          reshowTimerRef.current = setTimeout(() => {
            if (!hasSubmittedBefore()) setVisible(true);
          }, timeLeft);
        }
      }
      return () => cancelAnimationFrame(frame);
    }

    let openOnMountTimer: ReturnType<typeof setTimeout> | null = null;

    if (openOnMount) {
      openOnMountTimer = setTimeout(() => setVisible(true), 0);
    }

    return () => {
      cancelAnimationFrame(frame);
      if (openOnMountTimer) clearTimeout(openOnMountTimer);
      clearReshowTimer();
    };
  }, [openOnMount, pathname]);


  const dismiss = () => {
    setVisible(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(DISMISSED_KEY, String(Date.now()));
    }
    // Keep nagging every couple of minutes until they either submit or leave.
    clearReshowTimer();
    reshowTimerRef.current = setTimeout(() => {
      if (!hasSubmittedBefore()) setVisible(true);
    }, RESHOW_DELAY_MS);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setErrorMsg("");
    setFormState("submitting");

    const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "popup",
          name: fullName,
          phone,
          email,
          category: category || undefined,
          budgetBand: budgetBand || undefined,
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
      trackLeadSubmit("popup");
      clearReshowTimer();
      sessionStorage.setItem(SUBMITTED_KEY, String(Date.now()));

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

  if (!mounted || pathname?.startsWith("/admin")) return null;

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            key="popup-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[8000] bg-black/75 backdrop-blur-sm"
            onClick={dismiss}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            key="popup-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="popup-title"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[8001] flex items-start sm:items-center justify-center p-4 overflow-y-auto pointer-events-none"
          >
            <div
              className="popup-mobile-surface relative w-full max-w-[420px] max-h-[calc(100dvh-2rem)] pointer-events-auto bg-soft-black border border-white/[0.06] rounded-md overflow-x-hidden overflow-y-auto shadow-[0_40px_100px_rgba(0,0,0,0.85)]"
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
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className={cn(
                            selectBase,
                            !category ? "text-ivory/40" : "text-ivory"
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
                          value={budgetBand}
                          onChange={(e) => setBudgetBand(e.target.value)}
                          className={cn(
                            selectBase,
                            !budgetBand ? "text-ivory/40" : "text-ivory"
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
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
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
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
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
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
