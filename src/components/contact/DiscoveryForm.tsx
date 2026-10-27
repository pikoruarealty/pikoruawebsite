"use client";

import { useState, useId } from "react";
import { useRouter } from "next/navigation";
import { cn, leadFieldErrors } from "@/lib/utils";
import { trackLeadSubmit } from "@/lib/analytics";
import type { ResidentialCategory, LocationSlug, BudgetBand, LeadPurpose, Timeline } from "@/types";

// ─── Static data ────────────────────────────────────────────────────────────

const PURPOSES: { id: LeadPurpose; label: string; sub: string }[] = [
  { id: "self-use",     label: "I want to buy",       sub: "A home for myself or my family" },
  { id: "nri-purchase", label: "NRI Purchase",         sub: "Buying from outside India" },
  { id: "investment",   label: "Investment",            sub: "Residential investment opportunity" },
  { id: "selling",      label: "I want to sell",       sub: "Discreet representation of my property" },
];

const CATEGORIES: { id: ResidentialCategory; label: string }[] = [
  { id: "apartment",              label: "4 BHK or 5 BHK Apartment" },
  { id: "penthouse",              label: "Penthouse or Duplex" },
  { id: "villa",                  label: "Villa or Bungalow" },
  { id: "plot",                   label: "Premium Plot" },
  { id: "residential-investment", label: "Investment Property" },
  { id: "office",                 label: "Office" },
  { id: "showroom",               label: "Showroom" },
];

const LOCATION_OPTIONS: { id: LocationSlug; label: string }[] = [
  { id: "iskon-ambli",   label: "Iskon–Ambli" },
  { id: "sindhu-bhavan", label: "Sindhu Bhavan" },
  { id: "thaltej",       label: "Thaltej" },
  { id: "shilaj",        label: "Shilaj" },
  { id: "vaishno-devi",  label: "Vaishno Devi" },
  { id: "sg-highway",    label: "SG Highway" },
  { id: "other",         label: "Open to suggestions" },
];

const BUDGETS: { id: BudgetBand; label: string; sub: string }[] = [
  { id: "1-2cr",     label: "₹1 Cr – ₹2 Cr",   sub: "Entry premium" },
  { id: "3-4cr",     label: "₹3 Cr – ₹4 Cr",   sub: "Premium luxury" },
  { id: "5-7cr",     label: "₹5 Cr – ₹7 Cr",   sub: "Mid luxury" },
  { id: "8-10cr",    label: "₹8 Cr – ₹10 Cr",  sub: "Ultra premium" },
  { id: "10cr-plus", label: "₹10 Cr +",         sub: "Ultra HNI" },
];

const TIMELINES: { id: Timeline; label: string }[] = [
  { id: "immediately", label: "Ready now" },
  { id: "1-3months",   label: "1 – 3 months" },
  { id: "3-6months",   label: "3 – 6 months" },
  { id: "exploring",   label: "Just exploring" },
];

const CALLBACK_SLOTS = [
  "Morning (9 AM – 12 PM)",
  "Afternoon (12 PM – 4 PM)",
  "Evening (5 PM – 8 PM)",
  "Flexible / Any time",
];

// ─── Types ───────────────────────────────────────────────────────────────────

type FormState = {
  purpose: LeadPurpose | "";
  category: ResidentialCategory | "";
  locations: LocationSlug[];
  budgetBand: BudgetBand | "";
  timeline: Timeline | "";
  name: string;
  phone: string;
  sameWhatsApp: boolean;
  whatsapp: string;
  email: string;
  preferredCallbackTime: string;
  consent: boolean;
  honeypot: string;
};

type StepErrors = Record<string, string>;

// ─── Props ───────────────────────────────────────────────────────────────────

interface DiscoveryFormProps {
  initialPurpose?: LeadPurpose | "";
  id?: string;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function DiscoveryForm({ initialPurpose = "", id = "discovery" }: DiscoveryFormProps) {
  const router = useRouter();
  const uid = useId();

  const startsAtStep2 = Boolean(initialPurpose);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(startsAtStep2 ? 2 : 1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [errors, setErrors] = useState<StepErrors>({});

  const [form, setForm] = useState<FormState>({
    purpose: initialPurpose,
    category: "",
    locations: [],
    budgetBand: "",
    timeline: "",
    name: "",
    phone: "",
    sameWhatsApp: true,
    whatsapp: "",
    email: "",
    preferredCallbackTime: "",
    consent: false,
    honeypot: "",
  });

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  };

  const toggleLocation = (loc: LocationSlug) => {
    set("locations", form.locations.includes(loc)
      ? form.locations.filter((l) => l !== loc)
      : [...form.locations, loc]
    );
  };

  // ─── Validation per step ──────────────────────────────────────────────────

  const validateStep = (s: typeof step): StepErrors => {
    const errs: StepErrors = {};
    if (s === 1) {
      if (!form.purpose) errs.purpose = "Please select your intent to continue";
    }
    if (s === 2) {
      if (!form.category) errs.category = "Please select a property type";
      if (form.locations.length === 0) errs.locations = "Please select at least one location";
    }
    if (s === 3) {
      if (!form.budgetBand) errs.budgetBand = "Please select a budget range";
      if (!form.timeline) errs.timeline = "Please select a timeline";
    }
    if (s === 4) {
      if (!form.name.trim() || form.name.trim().length < 2) errs.name = "Please enter your name";
      if (!form.phone.trim() || form.phone.trim().length < 7) errs.phone = "Please enter a valid phone number";
      if (!form.consent) errs.consent = "Please give consent to continue";
    }
    return errs;
  };

  const advance = () => {
    const errs = validateStep(step);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep((s) => Math.min(s + 1, 4) as typeof step);
  };

  const back = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 1) as typeof step);
  };

  // ─── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    const errs = validateStep(4);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setSubmitError("");

    const payload = {
      source: "discovery",
      honeypot: form.honeypot,
      purpose: form.purpose || undefined,
      category: form.category || undefined,
      locations: form.locations,
      budgetBand: form.budgetBand || undefined,
      timeline: form.timeline || undefined,
      name: form.name.trim(),
      phone: form.phone.trim(),
      whatsapp: form.sameWhatsApp ? undefined : (form.whatsapp.trim() || undefined),
      email: form.email.trim() || undefined,
      preferredCallbackTime: form.preferredCallbackTime || undefined,
      consent: form.consent,
    };

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const fieldErrors = leadFieldErrors(data);
        if (Object.keys(fieldErrors).length) setErrors(fieldErrors);
        throw new Error(Object.values(fieldErrors)[0] ?? data?.error ?? "Submission failed. Please try again.");
      }
      trackLeadSubmit("discovery", { lead_purpose: form.purpose });
      router.push(`/thank-you?source=discovery&purpose=${form.purpose}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  const isSelling = form.purpose === "selling";
  const progress = (step / 4) * 100;

  return (
    <div id={id} className="w-full">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3 gap-1">
          {(["Intent", "Preferences", "Budget & Timeline", "Your Details"] as const).map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => { if (i + 1 < step) { setErrors({}); setStep((i + 1) as typeof step); } }}
              disabled={i + 1 >= step}
              className={cn(
                "text-[9px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.15em] font-sans transition-colors duration-150 truncate",
                i + 1 === step
                  ? "text-ivory"
                  : i + 1 < step
                  ? "text-champagne-gold cursor-pointer hover:text-antique-gold"
                  : "text-ivory/20 cursor-default"
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="h-px bg-white/[0.08] relative">
          <div
            className="absolute inset-y-0 left-0 bg-champagne-gold transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Honeypot (hidden, anti-spam) */}
      <div aria-hidden="true" className="hidden">
        <input
          tabIndex={-1}
          autoComplete="off"
          value={form.honeypot}
          onChange={(e) => set("honeypot", e.target.value)}
        />
      </div>

      {/* ── Step 1: Purpose ────────────────────────────────────────────────── */}
      {step === 1 && (
        <div>
          <h3 className="font-display text-[clamp(1.25rem,2.5vw,1.75rem)] text-ivory mb-2">
            How can we help you?
          </h3>
          <p className="text-sm font-sans text-ivory/40 mb-8">
            Select the option that best describes your intent.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {PURPOSES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => set("purpose", p.id)}
                className={cn(
                  "group text-left p-5 border transition-all duration-200",
                  "focus-visible:outline-2 focus-visible:outline-champagne-gold focus-visible:outline-offset-2",
                  form.purpose === p.id
                    ? "border-champagne-gold bg-champagne-gold/[0.04]"
                    : "border-white/[0.08] hover:border-white/20 bg-soft-black"
                )}
              >
                <div
                  className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center mb-4 transition-colors duration-150",
                    form.purpose === p.id ? "border-champagne-gold" : "border-white/[0.15] group-hover:border-white/30"
                  )}
                >
                  {form.purpose === p.id && <div className="w-1.5 h-1.5 rounded-full bg-champagne-gold" />}
                </div>
                <p className="font-sans text-sm font-medium text-ivory mb-1">{p.label}</p>
                <p className="font-sans text-xs text-ivory/40">{p.sub}</p>
              </button>
            ))}
          </div>

          {errors.purpose && (
            <p className="text-xs font-sans text-red-400 mb-4">{errors.purpose}</p>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-6">
            <button
              type="button"
              onClick={() => { set("purpose", "exploring"); setStep(2); }}
              className="group text-xs font-sans text-ivory/30 hover:text-ivory/60 tracking-[0.1em] uppercase transition-colors duration-150 inline-flex items-center gap-1.5"
            >
              Just exploring
              <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
            </button>
            <button
              type="button"
              onClick={advance}
              className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 text-xs font-sans uppercase tracking-[0.2em] text-champagne-gold border border-champagne-gold/30 hover:border-champagne-gold/65 hover:bg-champagne-gold/[0.04] transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne-gold min-h-[48px] sm:w-auto w-full"
            >
              Continue
              <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Category + Locations ───────────────────────────────────── */}
      {step === 2 && (
        <div>
          <h3 className="font-display text-[clamp(1.25rem,2.5vw,1.75rem)] text-ivory mb-2">
            {isSelling ? "Tell us about your property" : "What are you looking for?"}
          </h3>
          <p className="text-sm font-sans text-ivory/40 mb-8">
            {isSelling
              ? "Help us understand the type and location of the property you wish to sell."
              : "Select a property type and preferred corridor."}
          </p>

          {/* Category */}
          <div className="mb-7">
            <p className="text-[10px] uppercase tracking-[0.2em] font-sans text-ivory/50 mb-3">
              {isSelling ? "Property type" : "Property type"}
            </p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => set("category", cat.id)}
                  className={cn(
                    "px-4 py-2 text-xs font-sans uppercase tracking-[0.12em] border transition-all duration-150",
                    "focus-visible:outline-2 focus-visible:outline-champagne-gold",
                    form.category === cat.id
                      ? "border-champagne-gold text-champagne-gold bg-champagne-gold/[0.06]"
                      : "border-white/[0.1] text-ivory/50 hover:border-white/25 hover:text-ivory/70"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            {errors.category && (
              <p className="text-xs font-sans text-red-500 mt-2">{errors.category}</p>
            )}
          </div>

          {/* Locations */}
          <div className="mb-8">
            <p className="text-[10px] uppercase tracking-[0.2em] font-sans text-ivory/50 mb-3">
              {isSelling ? "Located in" : "Preferred corridors"}{" "}
              <span className="normal-case tracking-normal text-ivory/25">(select all that apply)</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {LOCATION_OPTIONS.map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => toggleLocation(loc.id)}
                  className={cn(
                    "px-4 py-2 text-xs font-sans uppercase tracking-[0.12em] border transition-all duration-150",
                    "focus-visible:outline-2 focus-visible:outline-champagne-gold",
                    form.locations.includes(loc.id)
                      ? "border-champagne-gold text-champagne-gold bg-champagne-gold/[0.06]"
                      : "border-white/[0.1] text-ivory/50 hover:border-white/25 hover:text-ivory/70"
                  )}
                >
                  {loc.label}
                </button>
              ))}
            </div>
            {errors.locations && (
              <p className="text-xs font-sans text-red-500 mt-2">{errors.locations}</p>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 sm:gap-6">
            <button
              type="button"
              onClick={back}
              className="group text-xs font-sans text-ivory/30 hover:text-ivory/60 tracking-[0.1em] uppercase transition-colors duration-150 inline-flex items-center gap-1.5 justify-center sm:justify-start"
            >
              <span className="transform group-hover:-translate-x-1 transition-transform duration-300">←</span>
              Back
            </button>
            <button
              type="button"
              onClick={advance}
              className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 text-xs font-sans uppercase tracking-[0.2em] text-champagne-gold border border-champagne-gold/30 hover:border-champagne-gold/65 hover:bg-champagne-gold/[0.04] transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne-gold min-h-[48px] sm:w-auto w-full"
            >
              Continue
              <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Budget + Timeline ───────────────────────────────────────── */}
      {step === 3 && (
        <div>
          <h3 className="font-display text-[clamp(1.25rem,2.5vw,1.75rem)] text-ivory mb-2">
            {isSelling ? "Ideal valuation & timing" : "Budget & timeline"}
          </h3>
          <p className="text-sm font-sans text-ivory/40 mb-8">
            {isSelling
              ? "This helps us match you with the right qualified buyers."
              : "This helps us curate only the most relevant residences for you."}
          </p>

          {/* Budget */}
          <div className="mb-8">
            <p className="text-[10px] uppercase tracking-[0.2em] font-sans text-ivory/50 mb-3">
              {isSelling ? "Expected valuation" : "Budget range"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {BUDGETS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => set("budgetBand", b.id)}
                  className={cn(
                    "text-left p-4 border transition-all duration-150 focus-visible:outline-2 focus-visible:outline-champagne-gold",
                    form.budgetBand === b.id
                      ? "border-champagne-gold bg-champagne-gold/[0.04]"
                      : "border-white/[0.08] hover:border-white/20 bg-soft-black"
                  )}
                >
                  <p className={cn(
                    "text-sm font-sans font-medium transition-colors duration-150",
                    form.budgetBand === b.id ? "text-champagne-gold" : "text-ivory/60"
                  )}>
                    {b.label}
                  </p>
                  <p className="text-[10px] font-sans text-ivory/30 mt-0.5">{b.sub}</p>
                </button>
              ))}
            </div>
            {errors.budgetBand && (
              <p className="text-xs font-sans text-red-500 mt-2">{errors.budgetBand}</p>
            )}
          </div>

          {/* Timeline */}
          <div className="mb-8">
            <p className="text-[10px] uppercase tracking-[0.2em] font-sans text-ivory/50 mb-3">
              Timeline
            </p>
            <div className="flex flex-wrap gap-2">
              {TIMELINES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => set("timeline", t.id)}
                  className={cn(
                    "px-5 py-2.5 text-xs font-sans tracking-[0.1em] border transition-all duration-150",
                    "focus-visible:outline-2 focus-visible:outline-champagne-gold",
                    form.timeline === t.id
                      ? "border-champagne-gold text-champagne-gold bg-champagne-gold/[0.06]"
                      : "border-white/[0.1] text-ivory/50 hover:border-white/25 hover:text-ivory/70"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {errors.timeline && (
              <p className="text-xs font-sans text-red-500 mt-2">{errors.timeline}</p>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 sm:gap-6">
            <button
              type="button"
              onClick={back}
              className="group text-xs font-sans text-ivory/30 hover:text-ivory/60 tracking-[0.1em] uppercase transition-colors duration-150 inline-flex items-center gap-1.5 justify-center sm:justify-start"
            >
              <span className="transform group-hover:-translate-x-1 transition-transform duration-300">←</span>
              Back
            </button>
            <button
              type="button"
              onClick={advance}
              className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 text-xs font-sans uppercase tracking-[0.2em] text-champagne-gold border border-champagne-gold/30 hover:border-champagne-gold/65 hover:bg-champagne-gold/[0.04] transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne-gold min-h-[48px] sm:w-auto w-full"
            >
              Continue
              <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Step 4: Contact details ─────────────────────────────────────────── */}
      {step === 4 && (
        <div>
          <h3 className="font-display text-[clamp(1.25rem,2.5vw,1.75rem)] text-ivory mb-2">
            Almost there
          </h3>
          <p className="text-sm font-sans text-ivory/40 mb-8">
            We respond personally — never with automated replies. Your details are held in confidence.
          </p>

          <div className="space-y-5">
            {/* Name */}
            <div>
              <label htmlFor={`${uid}-name`} className="block text-[10px] uppercase tracking-[0.15em] font-sans text-ivory/50 mb-2">
                Full Name <span className="text-champagne-gold">*</span>
              </label>
              <input
                id={`${uid}-name`}
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Your name"
                className={cn(
                  "w-full px-4 py-3 text-sm font-sans text-ivory bg-soft-black border outline-none transition-colors duration-150 placeholder:text-ivory/20",
                  errors.name ? "border-red-400" : "border-white/[0.10] focus:border-champagne-gold/55"
                )}
              />
              {errors.name && <p className="text-xs font-sans text-red-500 mt-1.5">{errors.name}</p>}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor={`${uid}-phone`} className="block text-[10px] uppercase tracking-[0.15em] font-sans text-ivory/50 mb-2">
                Phone <span className="text-champagne-gold">*</span>
              </label>
              <input
                id={`${uid}-phone`}
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                className={cn(
                  "w-full px-4 py-3 text-sm font-sans text-ivory bg-soft-black border outline-none transition-colors duration-150 placeholder:text-ivory/20",
                  errors.phone ? "border-red-400" : "border-white/[0.10] focus:border-champagne-gold/55"
                )}
              />
              {errors.phone && <p className="text-xs font-sans text-red-500 mt-1.5">{errors.phone}</p>}
            </div>

            {/* WhatsApp */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer select-none group">
                <span
                  role="checkbox"
                  aria-checked={form.sameWhatsApp}
                  tabIndex={0}
                  onClick={() => set("sameWhatsApp", !form.sameWhatsApp)}
                  onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") set("sameWhatsApp", !form.sameWhatsApp); }}
                  className={cn(
                    "w-4 h-4 border flex-shrink-0 flex items-center justify-center transition-colors duration-150 outline-none",
                    "focus-visible:ring-2 focus-visible:ring-champagne-gold focus-visible:ring-offset-1",
                    form.sameWhatsApp ? "border-champagne-gold bg-champagne-gold/10" : "border-white/20 group-hover:border-white/40"
                  )}
                >
                  {form.sameWhatsApp && (
                    <svg viewBox="0 0 10 8" className="w-2.5 h-2 text-champagne-gold" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M1 4l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span className="text-xs font-sans text-ivory/50">WhatsApp is the same number</span>
              </label>

              {!form.sameWhatsApp && (
                <div className="mt-3">
                  <label htmlFor={`${uid}-whatsapp`} className="block text-[10px] uppercase tracking-[0.15em] font-sans text-ivory/50 mb-2">
                    WhatsApp Number
                  </label>
                  <input
                    id={`${uid}-whatsapp`}
                    type="tel"
                    autoComplete="tel"
                    value={form.whatsapp}
                    onChange={(e) => set("whatsapp", e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full px-4 py-3 text-sm font-sans text-ivory bg-soft-black border border-white/[0.10] focus:border-champagne-gold/55 outline-none transition-colors duration-150 placeholder:text-ivory/20"
                  />
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor={`${uid}-email`} className="block text-[10px] uppercase tracking-[0.15em] font-sans text-ivory/50 mb-2">
                Email <span className="text-ivory/25 font-normal normal-case tracking-normal text-[10px]">(optional)</span>
              </label>
              <input
                id={`${uid}-email`}
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 text-sm font-sans text-ivory bg-soft-black border border-white/[0.10] focus:border-champagne-gold/55 outline-none transition-colors duration-150 placeholder:text-ivory/20"
              />
            </div>

            {/* Preferred callback time */}
            <div>
              <label htmlFor={`${uid}-time`} className="block text-[10px] uppercase tracking-[0.15em] font-sans text-ivory/50 mb-2">
                Best time to call <span className="text-ivory/25 font-normal normal-case tracking-normal text-[10px]">(optional)</span>
              </label>
              <div className="relative">
                <select
                  id={`${uid}-time`}
                  value={form.preferredCallbackTime}
                  onChange={(e) => set("preferredCallbackTime", e.target.value)}
                  className="mobile-friendly-select w-full px-4 py-3 pr-10 text-sm font-sans text-ivory bg-soft-black border border-white/[0.10] focus:border-champagne-gold/55 outline-none transition-colors duration-150 appearance-none cursor-pointer"
                >
                  <option value="">Select a Time Window</option>
                  {CALLBACK_SLOTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-champagne-gold/60">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Consent */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer select-none group">
                <span
                  role="checkbox"
                  aria-checked={form.consent}
                  tabIndex={0}
                  onClick={() => set("consent", !form.consent)}
                  onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") set("consent", !form.consent); }}
                  className={cn(
                    "mt-0.5 w-4 h-4 border flex-shrink-0 flex items-center justify-center transition-colors duration-150 outline-none",
                    "focus-visible:ring-2 focus-visible:ring-champagne-gold focus-visible:ring-offset-1",
                    errors.consent
                      ? "border-red-400"
                      : form.consent ? "border-champagne-gold bg-champagne-gold/10" : "border-white/20 group-hover:border-white/40"
                  )}
                >
                  {form.consent && (
                    <svg viewBox="0 0 10 8" className="w-2.5 h-2 text-champagne-gold" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M1 4l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span className="text-xs font-sans text-ivory/40 leading-relaxed">
                  I consent to PIKORUA Realty contacting me regarding my enquiry. My details will not be shared with third parties.
                  <span className="text-champagne-gold ml-1">*</span>
                </span>
              </label>
              {errors.consent && <p className="text-xs font-sans text-red-500 mt-1.5">{errors.consent}</p>}
            </div>
          </div>

          {submitError && (
            <div className="mt-5 px-4 py-3 border border-red-900/30 bg-red-950/20 text-xs font-sans text-red-400">
              {submitError}
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 sm:gap-6 mt-8">
            <button
              type="button"
              onClick={back}
              disabled={submitting}
              className="group text-xs font-sans text-ivory/30 hover:text-ivory/60 tracking-[0.1em] uppercase transition-colors duration-150 inline-flex items-center gap-1.5 disabled:opacity-40 justify-center sm:justify-start"
            >
              <span className="transform group-hover:-translate-x-1 transition-transform duration-300">←</span>
              Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className={cn(
                "group inline-flex items-center justify-center gap-2 px-8 py-3.5 text-xs font-sans uppercase tracking-[0.2em] transition-all duration-300 sm:w-auto w-full",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne-gold min-h-[48px]",
                submitting
                  ? "border border-champagne-gold/10 text-champagne-gold/30 cursor-not-allowed"
                  : "text-champagne-gold border border-champagne-gold/30 hover:border-champagne-gold/65 hover:bg-champagne-gold/[0.04]"
              )}
            >
              {submitting ? "Submitting…" : (
                <>
                  Send Enquiry
                  <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                </>
              )}
            </button>
          </div>

          <p className="mt-4 text-[10px] font-sans text-ivory/25 leading-relaxed">
            By submitting, you agree to our privacy policy. We respond within one business day.
          </p>
        </div>
      )}
    </div>
  );
}
