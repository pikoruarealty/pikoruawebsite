"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { rememberUtm } from "@/lib/attribution";

/** Remembers campaign tags from the landing URL so any later lead form can send them. */
export function UtmCapture() {
  const pathname = usePathname();

  useEffect(() => {
    rememberUtm(window.location.search);
  }, [pathname]);

  return null;
}
