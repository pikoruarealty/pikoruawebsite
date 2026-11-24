"use client";

import type { CSSProperties, RefObject } from "react";
import { cn } from "@/lib/utils";

export type DockNudge = "point" | "glint" | "both";

interface EnquiryTabProps {
  /** The fixed, never-transformed box; the pop-up morphs out of and back into it. */
  anchorRef: RefObject<HTMLDivElement | null>;
  /** False while the pop-up is open (the pop-up has "become" the tab). */
  visible: boolean;
  /** Slide mostly off-screen while the visitor scrolls. */
  tucked: boolean;
  /** Changing `key` restarts the nudge animation. */
  nudge: { key: number; kind: DockNudge };
  onOpen: () => void;
  dialogId: string;
}

/**
 * Slim tab on the right edge, halfway down, on every page. It is the pop-up's
 * resting place: the enquiry form opens out of it and shrinks back into it.
 */
export function EnquiryTab({ anchorRef, visible, tucked, nudge, onOpen, dialogId }: EnquiryTabProps) {
  const buttonStyle: CSSProperties = {
    transition: `translate 500ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${visible ? 240 : 160}ms ease-out`,
  };

  return (
    <div
      ref={anchorRef}
      className="fixed z-40 top-[calc(50%-54px)] h-[108px] w-[30px] lg:top-[calc(50%-70px)] lg:h-[140px] lg:w-[42px]"
      style={{ right: "env(safe-area-inset-right, 0px)" }}
    >
      <button
        type="button"
        onClick={onOpen}
        aria-label="Open the enquiry form"
        aria-haspopup="dialog"
        aria-controls={dialogId}
        aria-expanded={!visible}
        tabIndex={visible ? 0 : -1}
        style={buttonStyle}
        className={cn(
          "group block h-full w-full cursor-pointer rounded-l-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne-gold",
          tucked && visible && "translate-x-[62%] focus-visible:translate-x-0",
          !visible && "pointer-events-none opacity-0"
        )}
      >
        <span
          key={nudge.key}
          data-nudge={nudge.key > 0 ? nudge.kind : undefined}
          style={{ "--dock-nx": "-7px" } as CSSProperties}
          className="dock-face flex h-full w-full flex-col items-center justify-center gap-2 rounded-l-md border-r-0 text-ivory group-hover:border-muted-gold lg:gap-2.5"
        >
          <span className="dock-arrow text-champagne-gold" aria-hidden="true">
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3 w-3 lg:h-3.5 lg:w-3.5"
            >
              <path d="M13 8H3M7 4 3 8l4 4" />
            </svg>
          </span>
          <span className="rotate-180 font-sans text-[9px] font-medium uppercase tracking-[0.24em] [writing-mode:vertical-rl] lg:text-[10px]">
            Enquire
          </span>
        </span>
      </button>
    </div>
  );
}
