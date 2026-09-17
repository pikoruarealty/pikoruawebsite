"use client";

import type { ComponentProps } from "react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { env } from "@/lib/env";
import { buildWhatsAppUrl } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "Properties" },
  { href: "/about", label: "About" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/nri", label: "NRI Centre" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

const PROPERTY_ROOT_PATHS = [
  "/luxury-apartments-ahmedabad",
  "/luxury-real-estate-ahmedabad",
  "/luxury-property-consultant-ahmedabad",
  "/real-estate-consultant-ahmedabad",
  "/ultra-luxury-properties-ahmedabad",
  "/luxury-homes-ahmedabad",
  "/luxury-4bhk-ahmedabad",
  "/luxury-5bhk-ahmedabad",
  "/penthouses-ahmedabad",
  "/luxury-villas-ahmedabad",
  "/luxury-bungalows-ahmedabad",
  "/luxury-plots-ahmedabad",
  "/investment-property-ahmedabad",
  "/commercial-property-ahmedabad",
];

const NRI_ROOT_PATHS = [
  "/nri-property-consultant-ahmedabad",
  "/nri-property-investment-ahmedabad",
  "/nri-buying-property-in-ahmedabad",
  "/nri-home-buying-process-india",
  "/nri-property-from-usa",
  "/nri-property-from-uk",
  "/nri-property-from-dubai",
  "/nri-property-from-uae",
  "/nri-property-from-canada",
  "/nri-property-from-singapore",
  "/nri-property-from-australia",
  "/power-of-attorney-for-nri-property-purchase",
  "/nre-vs-nro-property-payment",
  "/nri-home-loans-india",
  "/tds-on-property-purchase-by-nri",
  "/nri-property-inspection-service",
  "/virtual-property-tours-ahmedabad",
  "/property-management-for-nris",
  "/selling-inherited-property-for-nris",
  "/repatriation-of-property-sale-proceeds-nri",
];

const PROPERTY_CATEGORIES = [
  { slug: "apartment", label: "Apartments", href: "/luxury-apartments-ahmedabad" },
  { slug: "penthouse", label: "Penthouses", href: "/penthouses-ahmedabad" },
  { slug: "duplex", label: "Duplexes", href: "/penthouses-ahmedabad" },
  { slug: "villa", label: "Villas", href: "/luxury-villas-ahmedabad" },
  { slug: "bungalow", label: "Bungalows", href: "/luxury-bungalows-ahmedabad" },
  { slug: "plot", label: "Plots / Land", href: "/luxury-plots-ahmedabad" },
  { slug: "investment", label: "Investment Properties", href: "/investment-property-ahmedabad" },
];

function HeaderLink({ prefetch = false, ...props }: ComponentProps<typeof Link>) {
  return <Link prefetch={prefetch} {...props} />;
}

interface HeaderProps {
  // Non-hero pages skip the transparent phase and start dark immediately
  alwaysSolid?: boolean;
}

export function Header({ alwaysSolid = false }: HeaderProps) {
  const [scrolled, setScrolled] = useState(alwaysSolid);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const pathname = usePathname();
  const drawerRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const hasMountedRef = useRef(false);

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (alwaysSolid) return;
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [alwaysSolid]);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      setDrawerOpen(false);
      setDropdownOpen(false);
      setMobileDropdownOpen(false);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const el = drawerRef.current;
    if (!el) return;
    const focusable = el.querySelectorAll<HTMLElement>(
      'a, button, [tabindex]:not([tabindex="-1"])'
    );
    focusable[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setDrawerOpen(false); hamburgerRef.current?.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  const whatsappUrl = buildWhatsAppUrl(env.WHATSAPP_NUMBER, env.WHATSAPP_DEFAULT_MESSAGE);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled
            // After scroll: dark glass with gold hairline
            ? "bg-lux-black/90 backdrop-blur-md border-b border-champagne-gold/20"
            // Before scroll: completely transparent background with no border
            : "bg-transparent border-b border-transparent"
        )}
      >
        <div className="w-full px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">

            {/* Logo - always visible on all screen sizes */}
            <HeaderLink
              href="/"
              onClick={handleLogoClick}
              className="flex-shrink-0 flex items-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-champagne-gold rounded-sm"
              aria-label="PIKORUA Realty - Home"
            >
                <Image
                  src="/logo.png"
                  alt="PIKORUA Realty"
                  width={224}
                  height={48}
                  quality={75}
                  className="h-8 sm:h-9 lg:h-11 w-auto object-contain"
                />
              </HeaderLink>

              {/* Desktop nav */}
              <nav
                aria-label="Main navigation"
                className={cn(
                  "hidden lg:flex items-center gap-8 transition-all duration-500",
                  scrolled ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
                )}
              >
              {NAV_LINKS.map(({ href, label }) => {
                const active =
                  pathname === href ||
                  (label === "Properties" &&
                    (pathname.startsWith("/properties") ||
                      pathname.startsWith("/property-types") ||
                      pathname.startsWith("/locations") ||
                      PROPERTY_ROOT_PATHS.includes(pathname))) ||
                  (label === "NRI Centre" &&
                    (pathname.startsWith("/nri") || NRI_ROOT_PATHS.includes(pathname)));

                if (label === "Properties") {
                  return (
                    <div
                      key={href}
                      className="relative group py-4"
                      onMouseEnter={() => setDropdownOpen(true)}
                      onMouseLeave={() => setDropdownOpen(false)}
                    >
                      <HeaderLink
                        href="/properties"
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "relative text-base font-sans tracking-wider py-1 transition-colors duration-200",
                          active ? "text-ivory" : "text-ivory/70 hover:text-ivory",
                          "after:absolute after:bottom-0 after:left-0 after:h-px after:bg-champagne-gold",
                          "after:transition-all after:duration-300",
                          active ? "after:w-full" : "after:w-0 hover:after:w-full"
                        )}
                      >
                        Properties
                        <ChevronDownIcon className={cn("inline-block w-3 h-3 ml-1.5 transition-transform duration-200 align-middle -mt-0.5 group-hover:rotate-180", dropdownOpen && "rotate-180")} />
                      </HeaderLink>

                      {/* Dropdown Menu - Landscape/Mega-Menu Layout */}
                      <div
                        className={cn(
                          "absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[550px] bg-lux-black/95 backdrop-blur-md border border-champagne-gold/20 p-5 shadow-2xl transition-all duration-300 rounded-sm z-50",
                          dropdownOpen 
                            ? "opacity-100 translate-y-0 visible pointer-events-auto" 
                            : "opacity-0 -translate-y-2 invisible pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible group-hover:pointer-events-auto"
                        )}
                      >
                        <div className="grid grid-cols-3 gap-6 text-left">
                          {/* Column 1: Towers & Sky */}
                          <div className="space-y-3">
                            <h4 className="text-[10px] font-sans uppercase tracking-[0.2em] text-champagne-gold/70 border-b border-white/10 pb-1.5 font-medium">
                              Towers & Sky
                            </h4>
                            <div className="flex flex-col gap-2">
                              <HeaderLink
                                href="/luxury-apartments-ahmedabad"
                                className="text-xs font-sans tracking-wider text-ivory/60 hover:text-champagne-gold transition-colors duration-150"
                              >
                                Apartments
                              </HeaderLink>
                              <HeaderLink
                                href="/penthouses-ahmedabad"
                                className="text-xs font-sans tracking-wider text-ivory/60 hover:text-champagne-gold transition-colors duration-150"
                              >
                                Penthouses
                              </HeaderLink>
                              <HeaderLink
                                href="/penthouses-ahmedabad"
                                className="text-xs font-sans tracking-wider text-ivory/60 hover:text-champagne-gold transition-colors duration-150"
                              >
                                Duplexes
                              </HeaderLink>
                            </div>
                          </div>

                          {/* Column 2: Landed & Land */}
                          <div className="space-y-3">
                            <h4 className="text-[10px] font-sans uppercase tracking-[0.2em] text-champagne-gold/70 border-b border-white/10 pb-1.5 font-medium">
                              Landed & Land
                            </h4>
                            <div className="flex flex-col gap-2">
                              <HeaderLink
                                href="/luxury-villas-ahmedabad"
                                className="text-xs font-sans tracking-wider text-ivory/60 hover:text-champagne-gold transition-colors duration-150"
                              >
                                Villas
                              </HeaderLink>
                              <HeaderLink
                                href="/luxury-bungalows-ahmedabad"
                                className="text-xs font-sans tracking-wider text-ivory/60 hover:text-champagne-gold transition-colors duration-150"
                              >
                                Bungalows
                              </HeaderLink>
                              <HeaderLink
                                href="/luxury-plots-ahmedabad"
                                className="text-xs font-sans tracking-wider text-ivory/60 hover:text-champagne-gold transition-colors duration-150"
                              >
                                Plots / Land
                              </HeaderLink>
                            </div>
                          </div>

                          {/* Column 3: Strategic Assets */}
                          <div className="space-y-3">
                            <h4 className="text-[10px] font-sans uppercase tracking-[0.2em] text-champagne-gold/70 border-b border-white/10 pb-1.5 font-medium">
                              Strategic Assets
                            </h4>
                            <div className="flex flex-col gap-2">
                              <HeaderLink
                                href="/investment-property-ahmedabad"
                                className="text-xs font-sans tracking-wider text-ivory/60 hover:text-champagne-gold transition-colors duration-150"
                              >
                                Investment Properties
                              </HeaderLink>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Bar */}
                        <div className="mt-4 pt-3.5 border-t border-white/[0.06] flex items-center justify-end">
                          <HeaderLink
                            href="/properties"
                            className="text-[11px] font-sans uppercase tracking-[0.15em] text-champagne-gold hover:text-antique-gold transition-colors duration-150 font-medium"
                          >
                            Explore All Signature Collection
                          </HeaderLink>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <HeaderLink
                    key={href}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative text-base font-sans tracking-wider py-1 transition-colors duration-200",
                      active ? "text-ivory" : "text-ivory/70 hover:text-ivory",
                      "after:absolute after:bottom-0 after:left-0 after:h-px after:bg-champagne-gold",
                      "after:transition-all after:duration-300",
                      active ? "after:w-full" : "after:w-0 hover:after:w-full"
                    )}
                  >
                    {label}
                  </HeaderLink>
                );
              })}
            </nav>

            {/* Desktop CTAs */}
            <div
              className={cn(
                "hidden lg:flex items-center gap-4 transition-all duration-500",
                scrolled ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
              )}
            >
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 flex items-center justify-center text-[#4ade80] hover:text-[#86efac] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4ade80] rounded-sm"
                aria-label="Chat on WhatsApp"
              >
                <WhatsAppIcon className="w-6 h-6" />
              </a>

              <div className="w-px h-4 bg-ivory/15" aria-hidden="true" />

              <HeaderLink
                href="/contact"
                className="px-5 py-2 text-xs font-sans tracking-widest uppercase border border-champagne-gold text-champagne-gold font-medium hover:bg-champagne-gold hover:text-lux-black transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne-gold rounded-sm min-h-[44px] flex items-center"
              >
                Get In Touch
              </HeaderLink>
            </div>

            {/* Mobile hamburger - always visible on mobile, fades in on scroll on desktop */}
            <button
              ref={hamburgerRef}
              onClick={() => setDrawerOpen(!drawerOpen)}
              aria-expanded={drawerOpen}
              aria-controls="mobile-drawer"
              aria-label={drawerOpen ? "Close menu" : "Open menu"}
              className="lg:hidden flex flex-col justify-center items-center w-11 h-11 gap-1.5 focus-visible:outline-2 focus-visible:outline-champagne-gold rounded-sm"
            >
              {[
                drawerOpen ? "translate-y-[7px] rotate-45" : "",
                drawerOpen ? "opacity-0" : "",
                drawerOpen ? "-translate-y-[7px] -rotate-45" : "",
              ].map((extra, i) => (
                <span
                  key={i}
                  className={cn("block h-px w-6 bg-ivory transition-all duration-200", extra)}
                />
              ))}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-lux-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300",
          drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile drawer */}
      <div
        ref={drawerRef}
        id="mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          "fixed top-0 right-0 bottom-0 z-50 w-72 flex flex-col lg:hidden",
          "bg-soft-black border-l border-champagne-gold/20",
          "transition-transform duration-300 ease-in-out",
          "pb-[env(safe-area-inset-bottom,0px)]",
          drawerOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-6 h-16 border-b border-ivory/[0.06]">
          <span className="font-display text-base tracking-[0.12em] text-ivory">PIKORUA</span>
          <button
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
            className="w-11 h-11 flex items-center justify-center text-ivory/40 hover:text-ivory focus-visible:outline-2 focus-visible:outline-champagne-gold rounded-sm"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M1 1l16 16M17 1L1 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <nav aria-label="Mobile navigation" className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-1">
          {NAV_LINKS.map(({ href, label }) => {
            const active =
              pathname === href ||
              (label === "Properties" &&
                (pathname.startsWith("/properties") ||
                  pathname.startsWith("/property-types") ||
                  pathname.startsWith("/locations") ||
                  PROPERTY_ROOT_PATHS.includes(pathname))) ||
              (label === "NRI Centre" &&
                (pathname.startsWith("/nri") || NRI_ROOT_PATHS.includes(pathname)));

            if (label === "Properties") {
              return (
                <div key={href} className="border-b border-ivory/[0.06]">
                  <button
                    onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
                    className={cn(
                      "flex items-center justify-between w-full py-3 text-base font-sans tracking-wider text-left",
                      "transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-champagne-gold",
                      active ? "text-champagne-gold" : "text-ivory/50 hover:text-ivory"
                    )}
                  >
                    <span>Properties</span>
                    <ChevronDownIcon className={cn("w-4 h-4 transition-transform duration-200 text-ivory/30", mobileDropdownOpen && "rotate-180")} />
                  </button>

                  <div
                    className={cn(
                      "pl-4 flex flex-col gap-1 overflow-hidden transition-all duration-300 ease-in-out",
                      mobileDropdownOpen ? "max-h-[300px] pb-3 opacity-100" : "max-h-0 opacity-0"
                    )}
                  >
                    {PROPERTY_CATEGORIES.map((cat) => (
                      <HeaderLink
                        key={cat.slug}
                        href={cat.href}
                        className="block py-2 text-sm font-sans text-ivory/50 hover:text-champagne-gold transition-colors"
                      >
                        {cat.label}
                      </HeaderLink>
                    ))}
                    <HeaderLink
                      href="/properties"
                      className="block py-2 text-sm font-sans text-champagne-gold hover:text-antique-gold transition-colors font-medium"
                    >
                      View All Properties
                    </HeaderLink>
                  </div>
                </div>
              );
            }

            return (
              <HeaderLink
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "block py-3 text-base font-sans tracking-wider border-b border-ivory/[0.06]",
                  "transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-champagne-gold",
                  active ? "text-champagne-gold" : "text-ivory/50 hover:text-ivory"
                )}
              >
                {label}
              </HeaderLink>
            );
          })}
        </nav>

        <div className="px-6 pb-8 flex flex-col gap-3">
          <HeaderLink
            href="/contact"
            className="flex items-center justify-center h-12 text-xs font-sans tracking-widest uppercase border border-champagne-gold text-champagne-gold font-medium hover:bg-champagne-gold hover:text-lux-black transition-all duration-200 rounded-sm"
          >
            Get In Touch
          </HeaderLink>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 h-12 text-xs font-sans tracking-widest uppercase text-[#4ade80] border border-[#4ade80]/30 hover:bg-[#4ade80]/10 transition-all duration-200"
          >
            <WhatsAppIcon className="w-4 h-4" />
            WhatsApp
          </a>
        </div>
      </div>
    </>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
