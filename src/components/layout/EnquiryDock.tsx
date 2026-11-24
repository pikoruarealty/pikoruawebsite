"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { LeadCapturePopup, type PopupPhase } from "@/components/ui/LeadCapturePopup";
import { EnquiryTab, type DockNudge } from "@/components/layout/EnquiryTab";
import { WhatsAppFAB } from "@/components/layout/WhatsAppFAB";
import { useScrollTuck } from "@/hooks/useScrollTuck";
import { trackEvent } from "@/lib/analytics";
import {
  hasSubmittedThisVisit,
  loadSchedule,
  nudgesDue,
  saveSchedule,
  scheduleAfterClose,
  scheduleAfterWhatsAppTap,
  type EnquirySchedule,
} from "@/lib/enquiry-schedule";

/** No tab, button or pop-up at all. */
const HIDDEN_PREFIXES = ["/admin", "/studio"];
/** Tab and button stay, but the pop-up never opens by itself (these pages have their own form). */
const NO_AUTO_OPEN_PATHS = ["/contact", "/thank-you"];

const TICK_MS = 1000;
/** Wait this long after the visitor leaves a form field or another dialog closes. */
const SETTLE_MS = 3000;
const DIALOG_ID = "enquiry-popup";

function matchesPath(pathname: string, path: string): boolean {
  return pathname === path || pathname.startsWith(`${path}/`);
}

/** Is the visitor typing somewhere else, or looking at another dialog (menu, property details)? */
function somethingElseIsActive(): boolean {
  const el = document.activeElement;
  if (
    el instanceof HTMLElement &&
    !el.closest(`#${DIALOG_ID}`) &&
    (el.matches("input, textarea, select") || el.isContentEditable)
  ) {
    return true;
  }
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  for (const dialog of document.querySelectorAll<HTMLElement>('[aria-modal="true"]')) {
    if (dialog.id === DIALOG_ID) continue;
    const r = dialog.getBoundingClientRect();
    // The mobile menu stays in the DOM, slid off-screen, when closed.
    const onScreen = r.width > 0 && r.height > 0 && r.left < vw - 1 && r.right > 1 && r.top < vh - 1 && r.bottom > 1;
    if (onScreen) return true;
  }
  return false;
}

interface EnquiryDockProps {
  /** Lift the WhatsApp button above the Maya call widget when Maya is on. */
  liftWhatsApp?: boolean;
}

/**
 * The enquiry tab (right edge), the WhatsApp button (bottom right) and the
 * enquiry pop-up, plus the clock that times them. Mounted once in the root
 * layout, so it keeps running across page changes. Timing rules live in
 * `src/lib/enquiry-schedule.ts`.
 */
export function EnquiryDock({ liftWhatsApp = false }: EnquiryDockProps) {
  const pathname = usePathname() ?? "/";
  const hidden = HIDDEN_PREFIXES.some((p) => matchesPath(pathname, p));
  const autoOpenAllowed = !NO_AUTO_OPEN_PATHS.some((p) => matchesPath(pathname, p));

  const [phase, setPhase] = useState<PopupPhase>("closed");
  const [tabNudge, setTabNudge] = useState<{ key: number; kind: DockNudge }>({ key: 0, kind: "both" });
  const [waGlint, setWaGlint] = useState(0);
  const tucked = useScrollTuck();
  const anchorRef = useRef<HTMLDivElement>(null);

  // The clock reads these on every tick without restarting.
  const scheduleRef = useRef<EnquirySchedule | null>(null);
  const live = useRef({ phase, tucked, autoOpenAllowed });
  useEffect(() => {
    live.current = { phase, tucked, autoOpenAllowed };
  });

  const getSchedule = useCallback((): EnquirySchedule => {
    if (!scheduleRef.current) scheduleRef.current = loadSchedule();
    return scheduleRef.current;
  }, []);

  const setSchedule = useCallback((s: EnquirySchedule) => {
    scheduleRef.current = s;
    saveSchedule(s);
  }, []);

  const open = useCallback(() => {
    if (live.current.phase !== "closed") return;
    live.current.phase = "opening";
    setPhase("opening");
  }, []);

  const openFromTab = useCallback(() => {
    trackEvent("enquiry_tab_click");
    open();
  }, [open]);

  const requestClose = useCallback(() => {
    if (live.current.phase !== "open") return;
    live.current.phase = "closing";
    setSchedule(scheduleAfterClose(getSchedule()));
    setPhase("closing");
  }, [getSchedule, setSchedule]);

  const handleOpened = useCallback(() => setPhase("open"), []);

  const handleClosed = useCallback(() => {
    setPhase("closed");
    // The tab "lands": a small point toward the page.
    setTabNudge((n) => ({ key: n.key + 1, kind: "point" }));
  }, []);

  const handleWhatsAppTap = useCallback(() => {
    setSchedule(scheduleAfterWhatsAppTap(getSchedule()));
  }, [getSchedule, setSchedule]);

  // ── The clock: counts visible time, opens the pop-up, plays nudges ───────
  useEffect(() => {
    if (hidden) return;
    let last = performance.now();
    let lastBusyAt = -Infinity;

    const id = window.setInterval(() => {
      const now = performance.now();
      const dt = Math.min(now - last, 2 * TICK_MS);
      last = now;
      if (document.visibilityState !== "visible") return;

      const s = getSchedule();
      const prevMs = s.activeMs;
      const next: EnquirySchedule = { ...s, activeMs: s.activeMs + dt };
      setSchedule(next);

      const { phase: currentPhase, tucked: isTucked, autoOpenAllowed: canAuto } = live.current;
      if (currentPhase !== "closed") return;
      if (hasSubmittedThisVisit()) return;

      if (somethingElseIsActive()) lastBusyAt = now;

      if (
        canAuto &&
        next.activeMs >= next.nextOpenAt &&
        !isTucked &&
        now - lastBusyAt > SETTLE_MS
      ) {
        open();
        return;
      }

      if (isTucked) return;
      const due = nudgesDue(next, prevMs, next.activeMs);
      if (due.enquiry) setTabNudge((n) => ({ key: n.key + 1, kind: "both" }));
      if (due.whatsapp) setWaGlint((g) => g + 1);
    }, TICK_MS);

    return () => window.clearInterval(id);
  }, [hidden, getSchedule, setSchedule, open]);

  if (hidden) return null;

  return (
    <>
      <EnquiryTab
        anchorRef={anchorRef}
        visible={phase === "closed"}
        tucked={tucked}
        nudge={tabNudge}
        onOpen={openFromTab}
        dialogId={DIALOG_ID}
      />
      <WhatsAppFAB
        tucked={tucked}
        glintKey={waGlint}
        visible={phase === "closed"}
        lifted={liftWhatsApp}
        onTap={handleWhatsAppTap}
      />
      <LeadCapturePopup
        phase={phase}
        anchorRef={anchorRef}
        dialogId={DIALOG_ID}
        onOpened={handleOpened}
        onRequestClose={requestClose}
        onClosed={handleClosed}
      />
    </>
  );
}
