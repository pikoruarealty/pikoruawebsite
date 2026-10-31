/**
 * Official social profiles. This is the only place these URLs live: the
 * footer, thank-you page, structured data (sameAs) and llms-full.txt all read
 * from here, so a renamed account is a one-line fix.
 */
export const INSTAGRAM_HANDLE = "pikorua.luxury";

export const SOCIAL_LINKS = {
  instagram: `https://www.instagram.com/${INSTAGRAM_HANDLE}/`,
  facebook: "https://www.facebook.com/Pikorua.Realty",
  linkedin: "https://www.linkedin.com/company/pikorua-realty/",
  youtube: "https://www.youtube.com/@pikorua_realty_official",
} as const;

export const YOUTUBE_HANDLE = "pikorua_realty_official";

/** The founder's personal LinkedIn profile (used on the Person schema). */
export const FOUNDER_LINKEDIN_URL = "https://www.linkedin.com/in/jitendra-k-p-0b237021b/";
