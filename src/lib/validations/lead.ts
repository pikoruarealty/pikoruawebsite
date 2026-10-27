import { z } from "zod";

// ─── Shared field primitives ───────────────────────────────────────────────

// Indian mobile: exactly 10 digits, starting 6-9. International: + followed by 8-15 digits.
const PHONE_FORMAT_RE = /^(\+[1-9]\d{7,14}|[6-9]\d{9})$/;

function hasRepeatedDigitRun(value: string): boolean {
  const digitsOnly = value.replace(/\D/g, "");
  return /(\d)\1{6,}/.test(digitsOnly);
}

const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s\-().]/g, ""))
  .pipe(
    z
      .string()
      .regex(
        PHONE_FORMAT_RE,
        "Enter a valid 10-digit Indian mobile number, or include a country code (e.g. +971...)"
      )
      .refine((v) => !hasRepeatedDigitRun(v), "Please enter a valid phone number")
  );

const optionalPhoneSchema = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((v) => (v ? v.replace(/[\s\-().]/g, "") : v))
  .pipe(
    z
      .string()
      .regex(PHONE_FORMAT_RE, "Enter a valid phone number, or include a country code")
      .refine((v) => !hasRepeatedDigitRun(v), "Please enter a valid phone number")
      .optional()
      .or(z.literal(""))
  );

// Domains of known disposable/temporary email providers — blocked at the schema level.
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "mailinator.com",
  "tempmail.com",
  "temp-mail.org",
  "guerrillamail.com",
  "10minutemail.com",
  "yopmail.com",
  "throwawaymail.com",
  "trashmail.com",
  "fakeinbox.com",
  "getnada.com",
  "dispostable.com",
  "sharklasers.com",
  "mailnesia.com",
  "maildrop.cc",
  "mintemail.com",
]);

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Please enter a valid email address")
  .max(254)
  .refine(
    (v) => !DISPOSABLE_EMAIL_DOMAINS.has(v.split("@")[1] ?? ""),
    "Please use a permanent email address"
  );

// Letters in any script (\p{M} keeps Gujarati/Devanagari vowel signs), spaces,
// dots, hyphens and apostrophes. Built with RegExp because \p{} needs ES2018+.
const NAME_CHARS_RE = new RegExp("^\\p{L}[\\p{L}\\p{M}\\s.'’-]*$", "u");
const LETTER_RE = new RegExp("\\p{L}", "gu");
// The vowel check only makes sense for names written in Latin letters.
const LATIN_NAME_RE = /^[A-Za-z\s.'’-]+$/;
const VOWEL_RE = /[aeiouAEIOU]/;

// Catches "asdasd", "aaaaaa", "abcabc", etc.
function isRepeatingPattern(value: string): boolean {
  const compact = value.replace(/[\s.'’-]/g, "").toLowerCase();
  if (compact.length < 4) return false;
  for (let blockLen = 1; blockLen <= Math.floor(compact.length / 2); blockLen++) {
    if (compact.length % blockLen !== 0) continue;
    const block = compact.slice(0, blockLen);
    if (block.repeat(compact.length / blockLen) === compact) return true;
  }
  return false;
}

const nameSchema = z
  .string()
  .trim()
  .min(2, "Please enter your name")
  .max(100)
  .regex(NAME_CHARS_RE, "Name can only contain letters, spaces, dots, hyphens and apostrophes")
  .refine((v) => (v.match(LETTER_RE)?.length ?? 0) >= 2, "Please enter your name")
  .refine((v) => !LATIN_NAME_RE.test(v) || VOWEL_RE.test(v), "Please enter a valid name")
  .refine((v) => !isRepeatingPattern(v), "Please enter a valid name");

// Zod v4: errorMap removed — use message directly
const consentSchema = z.literal(true, {
  message: "Please consent to be contacted",
});

const honeypotSchema = z.string().max(0, "Bot detected").optional();

// Zod v4: z.record() requires both key and value types
const utmSchema = z.record(z.string(), z.string()).optional();

// ─── A. Guided Discovery (6-step) ─────────────────────────────────────────

export const discoverySchema = z.object({
  honeypot: honeypotSchema,
  category: z.enum([
    "apartment",
    "penthouse",
    "villa",
    "bungalow",
    "plot",
    "residential-investment",
    "office",
    "showroom",
  ]),
  locations: z
    .array(
      z.enum([
        "iskon-ambli",
        "sindhu-bhavan",
        "thaltej",
        "shilaj",
        "vaishno-devi",
        "sg-highway",
        "other",
      ])
    )
    .min(1, "Please select at least one location"),
  budgetBand: z.enum(["1-2cr", "3-4cr", "5-7cr", "8-10cr", "10cr-plus"]),
  purpose: z.enum([
    "self-use",
    "investment",
    "nri-purchase",
    "selling",
    "exploring",
  ]),
  timeline: z.enum([
    "immediately",
    "1-3months",
    "3-6months",
    "exploring",
  ]),
  name: nameSchema,
  phone: phoneSchema,
  whatsapp: optionalPhoneSchema,
  email: emailSchema.optional().or(z.literal("")),
  preferredCallbackTime: z.string().max(100).optional(),
  consent: consentSchema,
  utm: utmSchema,
});

export type DiscoveryInput = z.infer<typeof discoverySchema>;

// ─── B. Property Enquiry ──────────────────────────────────────────────────

export const propertyEnquirySchema = z.object({
  honeypot: honeypotSchema,
  name: nameSchema,
  phone: phoneSchema,
  whatsapp: optionalPhoneSchema,
  email: emailSchema,
  propertyRef: z.string().max(200),
  message: z.string().max(1000).optional(),
  preferredCallbackTime: z.string().max(100).optional(),
  consent: consentSchema,
  utm: utmSchema,
});

export type PropertyEnquiryInput = z.infer<typeof propertyEnquirySchema>;

// ─── C. Callback Request ──────────────────────────────────────────────────

export const callbackSchema = z.object({
  honeypot: honeypotSchema,
  name: nameSchema,
  phone: phoneSchema,
  preferredCallbackTime: z
    .string()
    .min(1, "Please select a preferred time")
    .max(100),
  consent: consentSchema,
  utm: utmSchema,
});

export type CallbackInput = z.infer<typeof callbackSchema>;

// ─── D. Private Consultation Booking ──────────────────────────────────────

export const consultationSchema = z.object({
  honeypot: honeypotSchema,
  name: nameSchema,
  phone: phoneSchema,
  email: emailSchema,
  preferredDate: z.string().max(50).optional(),
  preferredTimeSlot: z.string().max(50).optional(),
  purpose: z.enum(["buy", "sell", "invest", "nri", "explore"]).optional(),
  notes: z.string().max(1000).optional(),
  consent: consentSchema,
  utm: utmSchema,
});

export type ConsultationInput = z.infer<typeof consultationSchema>;

// ─── E. Contact / Qualified Enquiry ───────────────────────────────────────

export const contactSchema = z.object({
  honeypot: honeypotSchema,
  name: nameSchema,
  phone: phoneSchema,
  whatsapp: optionalPhoneSchema,
  email: emailSchema,
  interest: z.string().max(200).optional(),
  message: z.string().max(1000).optional(),
  preferredCallbackTime: z.string().max(100).optional(),
  consent: consentSchema,
  utm: utmSchema,
  category: z
    .enum([
      "apartment",
      "penthouse",
      "villa",
      "bungalow",
      "plot",
      "residential-investment",
      "office",
      "showroom",
    ])
    .optional(),
  budgetBand: z
    .enum(["1-2cr", "3-4cr", "5-7cr", "8-10cr", "10cr-plus"])
    .optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
