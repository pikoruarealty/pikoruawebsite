import Link from "next/link";
import { LOCATION_LANDING_PAGES, PROPERTY_TYPE_LANDING_PAGES } from "@/lib/data/geo";
import { GOOGLE_BUSINESS_PROFILE_URL } from "@/lib/seo";
import { CALL_AGENT_NAME, CALL_AGENT_PHONE_DISPLAY, CALL_AGENT_PHONE_E164 } from "@/lib/data/callAgent";
import { env } from "@/lib/env";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "Properties" },
  { href: "/nri", label: "NRI Property Centre" },
  { href: "/about", label: "About" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/blog", label: "Blog" },
  { href: "/learn", label: "Buyer Guides" },
  { href: "/compare", label: "Comparisons" },
  { href: "/contact", label: "Contact" },
];

const FOOTER_LOCATION_LINKS = LOCATION_LANDING_PAGES.slice(0, 6);
const FOOTER_TYPE_LINK_SLUGS = [
  "luxury-apartments-ahmedabad",
  "penthouses-duplexes-ahmedabad",
  "luxury-villas-ahmedabad",
  "luxury-bungalows-ahmedabad",
  "residential-plots-ahmedabad",
];
const FOOTER_TYPE_LINKS = FOOTER_TYPE_LINK_SLUGS.map((slug) =>
  PROPERTY_TYPE_LANDING_PAGES.find((page) => page.slug === slug)
).filter((page): page is (typeof PROPERTY_TYPE_LANDING_PAGES)[number] => Boolean(page));

interface FooterProps {
  googleMapsUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  linkedinUrl?: string;
  youtubeUrl?: string;
}

export function Footer({
  googleMapsUrl = GOOGLE_BUSINESS_PROFILE_URL,
  instagramUrl = "https://www.instagram.com/pikorua.realty?igsh=MTN5d2NmNW1yY3Vvag==",
  facebookUrl = "https://www.facebook.com/share/18tH6uh55f/?mibextid=wwXIfr",
  linkedinUrl = "https://www.linkedin.com/company/pikorua-realty/posts/?feedView=all",
  youtubeUrl = "https://youtube.com/@pikorua_realty_official?si=M3r65vxOcgUvdGfi",
}: FooterProps) {
  const socialLinks = [
    { href: instagramUrl, label: "Instagram", icon: <InstagramIcon /> },
    { href: facebookUrl,  label: "Facebook",  icon: <FacebookIcon /> },
    { href: linkedinUrl,  label: "LinkedIn",  icon: <LinkedInIcon /> },
    { href: youtubeUrl,   label: "YouTube",   icon: <YouTubeIcon /> },
  ].filter((s) => s.href);

  return (
    <footer className="bg-lux-black border-t border-white/[0.06]" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div>
            <div className="mb-2.5">
              <span className="font-display text-2xl tracking-[0.12em] text-ivory block">PIKORUA</span>
              <span className="text-[10px] tracking-[0.25em] text-champagne-gold uppercase font-sans">Realty</span>
            </div>
            <p className="text-sm text-ivory/55 leading-relaxed max-w-xs font-sans">
              A private gateway to Ahmedabad&rsquo;s finest luxury residences — curated, never listed.
            </p>
            <div className="h-px w-8 bg-champagne-gold/35 my-4" />
            <p className="text-xs text-ivory/50 font-sans">
              Ahmedabad&nbsp;·&nbsp;Mumbai &amp; Dubai
            </p>
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-champagne-gold font-sans mb-3">Contact</h2>
            <ul className="space-y-2 font-sans text-sm text-ivory/55">
              <li>
                <a href="mailto:connect@pikorua.in" className="hover:text-ivory transition-colors duration-150">
                  connect@pikorua.in
                </a>
              </li>
              <li>
                <a href="tel:+916354359222" className="hover:text-ivory transition-colors duration-150">
                  +91 6354 359 222
                </a>
              </li>
              {env.MAYA_ENABLED && (
                <li>
                  <a href={`tel:${CALL_AGENT_PHONE_E164}`} className="hover:text-ivory transition-colors duration-150">
                    {CALL_AGENT_PHONE_DISPLAY}
                  </a>
                  <span className="text-ivory/35 text-xs"> — Private Advisory Line ({CALL_AGENT_NAME})</span>
                </li>
              )}
              <li className="text-ivory/50 leading-relaxed text-xs">
                Iskon-Ambli, Ahmedabad<br />Gujarat, India
              </li>
              {googleMapsUrl && (
                <li>
                  <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-champagne-gold/60 hover:text-champagne-gold transition-colors duration-150">
                    View on Google Maps →
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Navigation */}
          <div>
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-champagne-gold font-sans mb-3">Navigation</h2>
            <ul className="space-y-2">
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm font-sans text-ivory/55 hover:text-ivory transition-colors duration-150">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-champagne-gold font-sans mb-3">Corridors</h2>
            <ul className="space-y-2">
              {FOOTER_LOCATION_LINKS.map((page) => (
                <li key={page.href}>
                  <Link href={page.href} className="text-sm font-sans text-ivory/55 hover:text-ivory transition-colors duration-150">
                    {page.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-champagne-gold font-sans mb-3">Property Types</h2>
            <ul className="space-y-2">
              {FOOTER_TYPE_LINKS.map((page) => (
                <li key={page.href}>
                  <Link href={page.href} className="text-sm font-sans text-ivory/55 hover:text-ivory transition-colors duration-150">
                    {page.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.06] py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-ivory/50 font-sans">
            &copy; {new Date().getFullYear()} PIKORUA Realty. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-5">
                {socialLinks.map(({ href, label, icon }) => (
                  <a key={label} href={href!} target="_blank" rel="noopener noreferrer" aria-label={label}
                    className="opacity-80 hover:opacity-100 hover:scale-110 transition-all duration-200">
                    <span className="w-7 h-7 block">{icon}</span>
                  </a>
                ))}
              </div>
            )}
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="text-xs text-ivory/50 hover:text-ivory/80 transition-colors duration-150 font-sans">Privacy</Link>
              <Link href="/terms"   className="text-xs text-ivory/50 hover:text-ivory/80 transition-colors duration-150 font-sans">Terms</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" aria-hidden="true" className="w-full h-full">
      <defs>
        <linearGradient id="ig-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FEDA75" />
          <stop offset="30%" stopColor="#FA7E1E" />
          <stop offset="60%" stopColor="#D62976" />
          <stop offset="85%" stopColor="#962FBF" />
          <stop offset="100%" stopColor="#4F5BD5" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="url(#ig-gradient)" />
      <circle cx="12" cy="12" r="4" stroke="url(#ig-gradient)" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="#D62976" stroke="none" />
    </svg>
  );
}
function FacebookIcon() {
  return <svg viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true" className="w-full h-full"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
}
function LinkedInIcon() {
  return <svg viewBox="0 0 24 24" fill="#0A66C2" aria-hidden="true" className="w-full h-full"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
}
function YouTubeIcon() {
  return <svg viewBox="0 0 24 24" fill="#FF0000" aria-hidden="true" className="w-full h-full"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>;
}
