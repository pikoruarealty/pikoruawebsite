import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { createMetadata } from "@/lib/seo";
import { GUJRERA_AGENT_REGISTRATION_NO } from "@/lib/data/blog-disclaimers";

export const metadata: Metadata = createMetadata({
  title: "Terms of Use",
  description:
    "Terms for using the PIKORUA Realty website and submitting private luxury real estate enquiries in Ahmedabad.",
  path: "/terms",
});

export default function TermsPage() {
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
              Terms of Use
            </h1>
            <div className="mt-10 space-y-8 text-sm leading-7 text-ivory/65 font-sans">
              <section>
                <h2 className="text-xs uppercase tracking-[0.2em] text-champagne-gold mb-3">Website Content</h2>
                <p>
                  The information on this website is provided for general advisory and discovery purposes. Property availability, pricing, specifications, possession status, and documentation details can change without notice.
                </p>
              </section>
              <section>
                <h2 className="text-xs uppercase tracking-[0.2em] text-champagne-gold mb-3">No Public Offer</h2>
                <p>
                  Website content does not constitute a public offer, legal advice, financial advice, or a binding representation. Specific property details are confirmed during a private consultation.
                </p>
              </section>
              <section>
                <h2 className="text-xs uppercase tracking-[0.2em] text-champagne-gold mb-3">Blog and AI-Assisted Content</h2>
                <p>
                  Articles on our <Link className="text-champagne-gold hover:underline" href="/blog">blog</Link> marked with a ★ are prepared with the help of artificial intelligence by the PIKORUA Editorial Desk from publicly available information, including the third-party sources credited in them, and are published without individual review by a qualified professional. They are general information about property markets, regulations and localities, and may contain errors, omissions or out-of-date information. Figures are reproduced from the credited sources as at their publication date and are not independently verified; sentences that begin with &ldquo;Example&rdquo; are hypothetical illustrations, not market data or forecasts. Each such article carries a disclaimer that forms part of these terms.
                </p>
              </section>
              <section>
                <h2 className="text-xs uppercase tracking-[0.2em] text-champagne-gold mb-3">No Professional Advice or Guarantee</h2>
                <p>
                  Nothing on this website is legal, tax, financial or investment advice, or a recommendation to buy, sell or lease any property. Tax, legal, RERA and foreign-exchange (FEMA/RBI) rules depend on individual circumstances and change from time to time; consult a qualified advocate, chartered accountant or authorised dealer bank before acting. Property values and rents can fall as well as rise, past performance is not a reliable indicator of future results, and no return, rental income, appreciation or resale outcome is guaranteed.
                </p>
              </section>
              <section>
                <h2 className="text-xs uppercase tracking-[0.2em] text-champagne-gold mb-3">Third-Party Information and Links</h2>
                <p>
                  We refer to and link to news reports, government websites and other third-party content for convenience. PIKORUA Realty is not affiliated with those publishers, does not endorse their content and is not responsible for its accuracy or availability. Names and trademarks belong to their respective owners. Mentions of projects or developers are not an endorsement; confirm details with the developer and against the project&rsquo;s RERA registration.
                </p>
              </section>
              <section>
                <h2 className="text-xs uppercase tracking-[0.2em] text-champagne-gold mb-3">Limitation of Liability</h2>
                <p>
                  You use this website and its content at your own risk. To the fullest extent permitted by law, PIKORUA Realty and its partners, employees and agents are not liable for any direct, indirect or consequential loss arising from reliance on information on this website, from any error or omission in it, or from its unavailability. Nothing in these terms excludes liability that cannot be excluded under applicable law, including the Consumer Protection Act, 2019. If you find an error, write to us and we will review and correct it.
                </p>
              </section>
              <section>
                <h2 className="text-xs uppercase tracking-[0.2em] text-champagne-gold mb-3">User Enquiries</h2>
                <p>
                  By submitting an enquiry, you confirm that the information provided is accurate and that PIKORUA Realty may contact you by phone, email, or WhatsApp to respond to your request.
                </p>
              </section>
              <section>
                <h2 className="text-xs uppercase tracking-[0.2em] text-champagne-gold mb-3">Governing Law and Changes</h2>
                <p>
                  These terms are governed by the laws of India, and the courts at Ahmedabad, Gujarat have jurisdiction over any dispute arising from them. We may update these terms from time to time; the version published here applies from the date shown below.
                  {GUJRERA_AGENT_REGISTRATION_NO && ` PIKORUA Realty GujRERA agent registration no. ${GUJRERA_AGENT_REGISTRATION_NO}.`}
                </p>
              </section>
              <section>
                <h2 className="text-xs uppercase tracking-[0.2em] text-champagne-gold mb-3">Contact</h2>
                <p>
                  For questions about these terms, contact{" "}
                  <a className="text-champagne-gold hover:underline" href="mailto:connect@pikorua.in">
                    connect@pikorua.in
                  </a>
                  .
                </p>
              </section>
              <p className="text-xs text-ivory/40">Last updated: 30 October 2026.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
