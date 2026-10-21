// Public base URL for uploaded media (served by Nginx from MEDIA_DIR on the VPS).
export const MEDIA_BASE = (process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? "https://www.pikorua.in/media").replace(/\/$/, "");

export const MEDIA = {
  logo: "/logo.png",
  logoIcon: "/logo-icon.png",
  founder: `${MEDIA_BASE}/images/founder_v2.jpg`,
  videos: {
    hero: `${MEDIA_BASE}/videos/hero.mp4`,
    hero2: `${MEDIA_BASE}/videos/hero2.mp4`,
    bg: `${MEDIA_BASE}/videos/bg.mp4`,
    bg1: `${MEDIA_BASE}/videos/bg_1.mp4`,
    heroPoster: `/images/hero-living.jpg`,
  },
} as const;
