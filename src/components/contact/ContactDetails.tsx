import { env } from "@/lib/env";
import { buildWhatsAppUrl } from "@/lib/utils";

export function ContactDetails() {
  const whatsappUrl = buildWhatsAppUrl(
    env.WHATSAPP_NUMBER,
    "Hi, I'd like to speak with someone from PIKORUA."
  );

  return (
    <div className="space-y-9">

      {/* Header */}
      <div>
        <p className="text-[9px] uppercase tracking-[0.3em] text-champagne-gold/55 font-sans mb-3">
          Private Advisory
        </p>
        <h3 className="font-display text-[1.35rem] text-ivory font-normal leading-snug">
          Concierge Desk
        </h3>
        <div className="w-7 h-px bg-champagne-gold/30 mt-4" />
      </div>

      {/* Direct Channels */}
      <div>
        <p className="text-[9px] uppercase tracking-[0.22em] text-ivory/20 font-sans mb-5">
          Direct Channels
        </p>
        <ul className="space-y-5">
          <li>
            <span className="block text-[9px] text-ivory/20 font-sans uppercase tracking-[0.18em] mb-1.5">
              Phone
            </span>
            <a
              href="tel:+916354359222"
              className="group inline-flex items-center gap-2 text-[15px] font-sans text-ivory/75 hover:text-champagne-gold transition-colors duration-200"
            >
              +91 6354 359 222
            </a>
          </li>
          <li>
            <span className="block text-[9px] text-ivory/20 font-sans uppercase tracking-[0.18em] mb-1.5">
              WhatsApp
            </span>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 text-[15px] font-sans text-ivory/75 hover:text-champagne-gold transition-colors duration-200"
            >
              Chat Privately
              <span className="transform group-hover:translate-x-1 transition-transform duration-200 text-[10px] text-champagne-gold/50">→</span>
            </a>
          </li>
          <li>
            <span className="block text-[9px] text-ivory/20 font-sans uppercase tracking-[0.18em] mb-1.5">
              Email
            </span>
            <a
              href="mailto:info@pikorua.in"
              className="text-[15px] font-sans text-ivory/75 hover:text-champagne-gold transition-colors duration-200"
            >
              info@pikorua.in
            </a>
          </li>
        </ul>
      </div>

      <div className="h-px bg-white/[0.05]" />

      {/* Office */}
      <div>
        <p className="text-[9px] uppercase tracking-[0.22em] text-ivory/20 font-sans mb-3">
          Principal Office
        </p>
        <address className="not-italic text-[14px] font-sans text-ivory/40 leading-[1.8]">
          Satyamev Elite, Ambli T-Junction<br />
          Ambli-Bopal Road, Ahmedabad<br />
          Gujarat, India — 380058
        </address>
      </div>

      <div className="h-px bg-white/[0.05]" />

      {/* Hours */}
      <div>
        <p className="text-[9px] uppercase tracking-[0.22em] text-ivory/20 font-sans mb-3">
          Client Hours
        </p>
        <p className="text-[14px] font-sans text-ivory/40 leading-[1.8]">
          Monday – Saturday<br />
          10:00 AM – 7:00 PM IST
        </p>
        <p className="text-[11px] font-sans text-ivory/20 mt-4 leading-relaxed">
          NRI clients — consultations available across global time zones.
        </p>
      </div>

    </div>
  );
}
