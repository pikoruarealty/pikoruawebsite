/**
 * Public environment accessors only.
 * Never add server credentials to this module because it is imported by client components.
 */

function requirePublicEnv(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const env = {
  get SANITY_PROJECT_ID() {
    return requirePublicEnv("NEXT_PUBLIC_SANITY_PROJECT_ID", process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);
  },
  get SANITY_DATASET() {
    return process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
  },
  get SITE_URL() {
    return process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.pikorua.in";
  },
  get GTM_ID() {
    return process.env.NEXT_PUBLIC_GTM_ID ?? "";
  },
  get GA4_MEASUREMENT_ID() {
    return process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ?? "";
  },
  get MICROSOFT_CLARITY_PROJECT_ID() {
    return process.env.NEXT_PUBLIC_MICROSOFT_CLARITY_PROJECT_ID ?? "";
  },
  get WHATSAPP_NUMBER() {
    return process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "916354359222";
  },
  get WHATSAPP_DEFAULT_MESSAGE() {
    return process.env.NEXT_PUBLIC_WHATSAPP_DEFAULT_MESSAGE ??
      "Hi, I'd like to know more about luxury residences in Ahmedabad.";
  },
  get SITE_LIVE() {
    return (process.env.NEXT_PUBLIC_SITE_LIVE ?? "false") === "true";
  },
  /** Maya call agent (floating button, auto-popup, footer line). Off unless set to "true". */
  get MAYA_ENABLED() {
    return (process.env.NEXT_PUBLIC_MAYA_ENABLED ?? "false") === "true";
  },
} as const;
