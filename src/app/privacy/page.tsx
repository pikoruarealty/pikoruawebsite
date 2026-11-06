import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Privacy Policy",
  description:
    "How PIKORUA Realty collects, uses, and protects enquiry information submitted through its Ahmedabad luxury real estate advisory website.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <Header alwaysSolid />
      <main id="main-content" className="bg-lux-black text-ivory min-h-screen">
        <section className="pt-28 pb-16 lg:pt-36 lg:pb-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <p className="text-[10px] uppercase tracking-[0.25em] text-champagne-gold font-sans mb-4">
              PIKORUA Realty
            </p>
            <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-light uppercase tracking-wider">
              Privacy Policy
            </h1>
            <div className="mt-10 space-y-8 text-sm leading-7 text-ivory/65 font-sans">
              <section>
                <h2 className="text-xs uppercase tracking-[0.2em] text-champagne-gold mb-3">Information We Collect</h2>
                <p>
                  We collect the details you choose to submit through enquiry forms, WhatsApp links, email, or phone calls. This may include your name, phone number, email address, property interest, budget range, and message details.
                </p>
              </section>
              <section>
                <h2 className="text-xs uppercase tracking-[0.2em] text-champagne-gold mb-3">How We Use It</h2>
                <p>
                  We use enquiry information to respond personally, understand your real estate requirement, curate relevant residential options, and maintain internal lead records. We do not sell enquiry data to public listing portals.
                </p>
              </section>
              <section>
                <h2 className="text-xs uppercase tracking-[0.2em] text-champagne-gold mb-3">Analytics</h2>
                <p>
                  We may use analytics tools, including Google Analytics, Google Tag Manager, and Microsoft Clarity, to understand site performance, page usage, and visitor experience. These tools may collect device, browser, interaction, and approximate location information to help us improve the website.
                </p>
              </section>
              <section>
                <h2 className="text-xs uppercase tracking-[0.2em] text-champagne-gold mb-3">Confidentiality</h2>
                <p>
                  PIKORUA Realty operates as a private advisory. Buyer, seller, and property information is handled with discretion and shared only where needed to progress a requested consultation or transaction.
                </p>
              </section>
              <section>
                <h2 className="text-xs uppercase tracking-[0.2em] text-champagne-gold mb-3">Contact</h2>
                <p>
                  For privacy questions or data correction requests, contact us at{" "}
                  <a className="text-champagne-gold hover:underline" href="mailto:info@pikorua.in">
                    info@pikorua.in
                  </a>
                  .
                </p>
              </section>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
