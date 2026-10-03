"use client";

import { track } from "@/lib/analytics";

export default function PrintButton({ label = "Print / Save as PDF" }: { label?: string }) {
  return (
    <button
      type="button"
      className="ps-btn ps-btn--ghost"
      onClick={() => {
        track("cv_print");
        window.print();
      }}
    >
      {label}
    </button>
  );
}
