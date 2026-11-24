"use client";

import { useEffect, useState } from "react";

/**
 * True while the visitor is scrolling, false again `settleMs` after the last
 * scroll event. Floating buttons use it to slide out of the way during a
 * scroll and come back when the page is still.
 */
export function useScrollTuck(settleMs = 650): boolean {
  const [tucked, setTucked] = useState(false);

  useEffect(() => {
    let timer: number | undefined;
    let isTucked = false;
    let lastY = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      // Ignore sub-pixel jitter (iOS toolbar resizes, focus scrolls).
      if (!isTucked && Math.abs(y - lastY) < 4) return;
      lastY = y;
      if (!isTucked) {
        isTucked = true;
        setTucked(true);
      }
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        isTucked = false;
        lastY = window.scrollY;
        setTucked(false);
      }, settleMs);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
    };
  }, [settleMs]);

  return tucked;
}
