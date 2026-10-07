"use client";

import { openCvChooser, useCvChooser } from "@/lib/cv/chooser";

/**
 * The handles for the CV: every one of them is the same sheet-in-a-sleeve icon with the EN / ID chips, and every one
 * opens the one shared chooser (components/ui/CvChooser.tsx, through lib/cv/chooser.ts). They differ only in where
 * they sit and how loud they are:
 *
 *   card    the dossier card on the career slide (the big one)
 *   nav     the pill in the navigation bar, on every screen size
 *   hero    the third call to action under the headline
 *   inline  a row in the contact section's list of channels
 *
 * (The edge tab that follows the visitor is components/ui/CvTab.tsx.) `source` says which handle it was, for analytics
 * and so a handle can show that the chooser it opened is open.
 */

export type CvHandleVariant = "card" | "nav" | "hero" | "inline";

export function SheetIcon() {
  return (
    <svg className="cvd-icon" viewBox="0 0 26 30" aria-hidden="true">
      <g className="cvd-icon-sheet">
        <rect x="5" y="2" width="16" height="21" rx="1.5" />
        <path className="cvd-icon-l1" d="M8.5 8h9" />
        <path className="cvd-icon-l2" d="M8.5 11.5h9" />
        <path className="cvd-icon-l3" d="M8.5 15h5.5" />
      </g>
      <path className="cvd-icon-sleeve" d="M2.5 14.5h21l-1.4 12.2a1.5 1.5 0 0 1-1.5 1.3H5.4a1.5 1.5 0 0 1-1.5-1.3z" />
    </svg>
  );
}

function Chips() {
  return (
    <span className="cvd-chips" aria-hidden="true">
      <span>EN</span>
      <span>ID</span>
    </span>
  );
}

export default function CvDownload({
  source,
  variant = "card",
  label = "Download CV",
}: {
  source: string;
  variant?: CvHandleVariant;
  label?: string;
}) {
  const { open, source: active } = useCvChooser();
  const common = {
    type: "button" as const,
    "aria-haspopup": "dialog" as const,
    "aria-expanded": open && active === source,
    "data-cursor-text": "CV ↓",
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => openCvChooser(source, e.currentTarget),
  };

  if (variant === "nav") {
    return (
      <button {...common} className="cvd-handle cvd-nav" aria-label="Download CV, English or Indonesian">
        <SheetIcon />
        <span className="cvd-nav-label">CV</span>
        <Chips />
      </button>
    );
  }

  if (variant === "hero") {
    return (
      <button {...common} className="cvd-handle hx-btn hx-btn-cv">
        <SheetIcon />
        <span className="hx-btn-window">
          <span className="hx-btn-roll">
            <span>{label}</span>
            <span aria-hidden="true">{label}</span>
          </span>
        </span>
        <Chips />
      </button>
    );
  }

  if (variant === "inline") {
    return (
      <button {...common} className="cvd-handle cvd-inline">
        <span className="channel-key">CV</span>
        <span className="channel-value">PDF · English / Indonesia</span>
        <span className="channel-arrow" aria-hidden="true">
          ↓
        </span>
      </button>
    );
  }

  return (
    <button {...common} className="cvd-handle cvd-trigger">
      <span className="cvd-sweep" aria-hidden="true" />
      <span className="cvd-face">
        <SheetIcon />
        <span className="cvd-copy">
          <b>{label}</b>
          <i>
            <u>PDF</u>
            <span>EN</span>
            <span>ID</span>
          </i>
        </span>
        <span className="cvd-go" aria-hidden="true">
          ↓
        </span>
      </span>
    </button>
  );
}
