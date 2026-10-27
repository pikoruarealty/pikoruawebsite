"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn, leadFieldErrors } from "@/lib/utils";
import { trackLeadSubmit } from "@/lib/analytics";

interface PropertyEnquiryFormProps {
  propertySlug: string;
  propertyName: string;
  locationLabel: string;
}

interface FormState {
  name: string;
  phone: string;
  email: string;
  message: string;
  preferredCallbackTime: string;
  consent: boolean;
  honeypot: string;
}

export function PropertyEnquiryForm({
  propertySlug,
  propertyName,
  locationLabel,
}: PropertyEnquiryFormProps) {
  const router = useRouter();

  const initialMessage = `I am interested in exploring ${propertyName} on ${locationLabel}. Please share private details and availability.`;

  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    email: "",
    message: initialMessage,
    preferredCallbackTime: "",
    consent: false,
    honeypot: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  function set(field: keyof FormState, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate(): boolean {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (form.name.trim().length < 2) e.name = "Please enter your name";
    if (!form.phone.trim()) e.phone = "Please enter your phone number";
    if (!form.email.trim()) e.email = "Please enter your email";
    if (!form.consent) e.consent = "Please consent to be contacted";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setServerError("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "enquiry",
          name: form.name,
          phone: form.phone,
          email: form.email,
          message: form.message,
          preferredCallbackTime: form.preferredCallbackTime,
          propertyRef: propertySlug,
          consent: true,
          honeypot: form.honeypot,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const fieldErrors = leadFieldErrors(body);
        setErrors(fieldErrors as Partial<Record<keyof FormState, string>>);
        setServerError(Object.values(fieldErrors)[0] ?? body.error ?? "Something went wrong. Please try again.");
        return;
      }

      trackLeadSubmit("enquiry", { property_ref: propertySlug });
      router.push(`/thank-you?source=enquiry&property=${propertySlug}`);
    } catch {
      setServerError("Could not send your enquiry. Please reach us via WhatsApp directly.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-soft-black border border-white/[0.06] p-6 sm:p-8 rounded-md space-y-6 relative overflow-hidden">
      {/* Background visual detail */}
      <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-champagne-gold/5 blur-[60px] pointer-events-none" />

      <div className="space-y-1.5 relative">
        <h3 className="font-display text-lg text-white uppercase tracking-wider">
          Request Private Details
        </h3>
        <p className="text-xs font-sans text-ivory/40 leading-relaxed">
          Submit your contact details and an advisor will reach out to you discreetly.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4 relative">
        {/* Honeypot */}
        <input
          type="text"
          name="website"
          value={form.honeypot}
          onChange={(e) => set("honeypot", e.target.value)}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          autoComplete="off"
        />

        <div>
          <label htmlFor="property-callback-time" className="block text-[10px] font-sans uppercase tracking-[0.12em] text-ivory/50 mb-1.5">
            Your Name <span className="text-champagne-gold">*</span>
          </label>
          <input
            type="text"
            placeholder="Aarav Shah"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className={cn(
              "w-full px-4 py-3 bg-lux-black border text-ivory text-xs font-sans placeholder-ivory/20 rounded-sm focus:outline-none transition-colors duration-200",
              errors.name ? "border-red-400 focus:border-red-400" : "border-white/[0.08] focus:border-champagne-gold/50"
            )}
            autoComplete="name"
          />
          {errors.name && <p className="text-[11px] text-red-400 mt-1">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-sans uppercase tracking-[0.12em] text-ivory/50 mb-1.5">
              Phone Number <span className="text-champagne-gold">*</span>
            </label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              className={cn(
                "w-full px-4 py-3 bg-lux-black border text-ivory text-xs font-sans placeholder-ivory/20 rounded-sm focus:outline-none transition-colors duration-200",
                errors.phone ? "border-red-400 focus:border-red-400" : "border-white/[0.08] focus:border-champagne-gold/50"
              )}
              autoComplete="tel"
            />
            {errors.phone && <p className="text-[11px] text-red-400 mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-[10px] font-sans uppercase tracking-[0.12em] text-ivory/50 mb-1.5">
              Email Address <span className="text-champagne-gold">*</span>
            </label>
            <input
              type="email"
              placeholder="aarav@example.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className={cn(
                "w-full px-4 py-3 bg-lux-black border text-ivory text-xs font-sans placeholder-ivory/20 rounded-sm focus:outline-none transition-colors duration-200",
                errors.email ? "border-red-400 focus:border-red-400" : "border-white/[0.08] focus:border-champagne-gold/50"
              )}
              autoComplete="email"
            />
            {errors.email && <p className="text-[11px] text-red-400 mt-1">{errors.email}</p>}
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-sans uppercase tracking-[0.12em] text-ivory/50 mb-1.5">
            Preferred Callback Time
          </label>
          <div className="relative">
            <select
              id="property-callback-time"
              value={form.preferredCallbackTime}
              onChange={(e) => set("preferredCallbackTime", e.target.value)}
              className="mobile-friendly-select w-full px-4 py-3 bg-lux-black border border-white/[0.08] text-ivory text-xs font-sans rounded-sm focus:outline-none focus:border-champagne-gold/50 transition-colors duration-200 appearance-none cursor-pointer pr-10"
            >
              <option value="">Select a Time Window</option>
              <option value="Morning (9 AM – 12 PM)">Morning (9 AM – 12 PM)</option>
              <option value="Afternoon (12 PM – 4 PM)">Afternoon (12 PM – 4 PM)</option>
              <option value="Evening (5 PM – 8 PM)">Evening (5 PM – 8 PM)</option>
              <option value="Flexible / Any time">Flexible / Anytime</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-champagne-gold/60">
              <svg
                className="h-3.5 w-3.5"
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

        <div>
          <label className="block text-[10px] font-sans uppercase tracking-[0.12em] text-ivory/50 mb-1.5">
            Message
          </label>
          <textarea
            rows={3}
            value={form.message}
            onChange={(e) => set("message", e.target.value)}
            className="w-full px-4 py-3 bg-lux-black border border-white/[0.08] text-ivory text-xs font-sans placeholder-ivory/20 rounded-sm focus:outline-none focus:border-champagne-gold/50 transition-colors duration-200 resize-none"
          />
        </div>

        {/* Consent Checkbox */}
        <div className="pt-2">
          <label className="flex items-start gap-3 cursor-pointer select-none group">
            <span
              role="checkbox"
              aria-checked={form.consent}
              tabIndex={0}
              onClick={() => set("consent", !form.consent)}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") set("consent", !form.consent);
              }}
              className={cn(
                "mt-0.5 w-4 h-4 border flex-shrink-0 flex items-center justify-center transition-colors duration-150 outline-none rounded-sm",
                errors.consent
                  ? "border-red-400"
                  : form.consent
                  ? "border-champagne-gold bg-champagne-gold/10"
                  : "border-white/20 group-hover:border-white/40"
              )}
            >
              {form.consent && (
                <svg viewBox="0 0 10 8" className="w-2.5 h-2 text-champagne-gold" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M1 4l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <span className="text-[10px] font-sans text-ivory/40 leading-normal">
              I consent to PIKORUA Realty contacting me regarding this enquiry. 
              My details will remain confidential and private.<span className="text-champagne-gold ml-0.5">*</span>
            </span>
          </label>
          {errors.consent && (
            <p className="text-[11px] text-red-400 mt-1">{errors.consent}</p>
          )}
        </div>

        {serverError && (
          <p className="text-xs text-red-400 font-sans">{serverError}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className={cn(
            "group inline-flex items-center justify-center gap-2 px-6 py-3.5 w-full",
            "text-[10px] font-sans uppercase tracking-[0.2em] transition-all duration-300 rounded-sm border focus-visible:outline-2",
            submitting
              ? "border-champagne-gold/15 text-champagne-gold/30 cursor-not-allowed bg-transparent"
              : "text-lux-black bg-champagne-gold border-champagne-gold hover:bg-antique-gold hover:border-antique-gold"
          )}
        >
          {submitting ? "Sending Details…" : (
            <>
              Submit Enquiry
              <span className="transform group-hover:translate-x-0.5 transition-transform duration-300">→</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
