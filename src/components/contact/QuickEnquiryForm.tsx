"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn, leadFieldErrors } from "@/lib/utils";
import { trackLeadSubmit } from "@/lib/analytics";
import { getLeadUtm } from "@/lib/attribution";

interface FormState {
  name: string;
  phone: string;
  email: string;
  message: string;
  preferredCallbackTime: string;
  consent: boolean;
  honeypot: string;
}

const INITIAL: FormState = {
  name: "", phone: "", email: "", message: "",
  preferredCallbackTime: "", consent: false, honeypot: "",
};

export function QuickEnquiryForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL);
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
          source: "contact",
          name: form.name,
          phone: form.phone,
          email: form.email,
          message: form.message,
          preferredCallbackTime: form.preferredCallbackTime,
          consent: true,
          honeypot: form.honeypot,
          utm: getLeadUtm(),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const fieldErrors = leadFieldErrors(body);
        setErrors(fieldErrors as Partial<Record<keyof FormState, string>>);
        setServerError(Object.values(fieldErrors)[0] ?? body.error ?? "Something went wrong. Please try again.");
        return;
      }
      trackLeadSubmit("contact");
      router.push("/thank-you?source=contact");
    } catch {
      setServerError("Could not send your message. Please call or WhatsApp us directly.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Honeypot — hidden from real users */}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Your Name" error={errors.name} required>
          <Input
            type="text"
            placeholder="Rajesh Mehta"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            hasError={!!errors.name}
            autoComplete="name"
          />
        </Field>
        <Field label="Phone Number" error={errors.phone} required>
          <Input
            type="tel"
            placeholder="+91 98765 43210"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            hasError={!!errors.phone}
            autoComplete="tel"
          />
        </Field>
      </div>

      <Field label="Email Address" error={errors.email} required>
        <Input
          type="email"
          placeholder="rajesh@example.com"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          hasError={!!errors.email}
          autoComplete="email"
        />
      </Field>

      <Field label="Message" error={errors.message}>
        <textarea
          rows={4}
          placeholder="Tell us what you're looking for, or just say hello."
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          className="w-full px-4 py-3 bg-soft-black border border-white/[0.10] text-ivory text-sm font-sans placeholder-ivory/20 focus:outline-none focus:border-champagne-gold/55 transition-colors duration-200 resize-none rounded-sm"
        />
      </Field>

      <Field label="Preferred callback time" error={undefined}>
        <div className="relative">
          <select
            aria-label="Preferred callback time"
            value={form.preferredCallbackTime}
            onChange={(e) => set("preferredCallbackTime", e.target.value)}
            className="mobile-friendly-select w-full px-4 py-3 bg-soft-black border border-white/[0.10] text-ivory text-sm font-sans rounded-sm focus:outline-none focus:border-champagne-gold/55 transition-colors duration-200 appearance-none cursor-pointer pr-10"
          >
            <option value="">Select a Time Window</option>
            <option value="Morning (9 AM – 12 PM)">Morning (9 AM – 12 PM)</option>
            <option value="Afternoon (12 PM – 4 PM)">Afternoon (12 PM – 4 PM)</option>
            <option value="Evening (5 PM – 8 PM)">Evening (5 PM – 8 PM)</option>
            <option value="Flexible / Any time">Flexible / Anytime</option>
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
      </Field>

      {/* Consent */}
      <div>
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
              "mt-0.5 w-4 h-4 border flex-shrink-0 flex items-center justify-center transition-colors duration-150 outline-none",
              "focus-visible:ring-2 focus-visible:ring-champagne-gold focus-visible:ring-offset-1",
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
          <span className="text-xs font-sans text-ivory/50 leading-relaxed">
            I consent to PIKORUA Realty contacting me regarding this enquiry.
            My information will not be shared with third parties.
            <span className="text-champagne-gold ml-1">*</span>
          </span>
        </label>
        {errors.consent && (
          <p className="text-xs text-red-400 mt-1.5">{errors.consent}</p>
        )}
      </div>

      {serverError && (
        <p className="text-sm text-red-400 font-sans">{serverError}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className={cn(
          "group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4",
          "text-xs font-sans uppercase tracking-[0.2em] transition-all duration-300",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne-gold",
          "min-h-[52px]",
          submitting
            ? "border border-champagne-gold/10 text-champagne-gold/30 cursor-not-allowed"
            : "text-champagne-gold border border-champagne-gold/30 hover:border-champagne-gold/65 hover:bg-champagne-gold/[0.04]"
        )}
      >
        {submitting ? "Sending…" : (
          <>
            Send Enquiry
            <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
          </>
        )}
      </button>
    </form>
  );
}

// ─── Shared form primitives ───────────────────────────────────────────────────

function Field({ label, error, required, children }: {
  label: string; error?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-sans uppercase tracking-[0.12em] text-ivory/50 mb-2">
        {label}{required && <span className="text-champagne-gold ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
    </div>
  );
}

function Input({ hasError, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { hasError: boolean }) {
  return (
    <input
      {...props}
      className={cn(
        "w-full px-4 py-3 bg-soft-black border text-ivory text-sm font-sans placeholder-ivory/20 rounded-sm",
        "focus:outline-none transition-colors duration-200",
        hasError ? "border-red-400 focus:border-red-400" : "border-white/[0.10] focus:border-champagne-gold/55"
      )}
    />
  );
}
