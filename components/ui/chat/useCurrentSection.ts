"use client";

import { useEffect } from "react";
import { SECTION_IDS, type SectionId } from "@/lib/chat/actions";
import { sectionAt } from "@/lib/chat/context";

/**
 * Tells `onChange` which section is under the middle of the window, while `active`. One passive scroll listener,
 * read at most once a frame, over seven elements: nothing the page would notice. Off while the assistant is closed.
 */
export function useCurrentSection(active: boolean, onChange: (section: SectionId | null) => void) {
  useEffect(() => {
    if (!active) return;
    let frame = 0;

    const read = () => {
      frame = 0;
      const rects = SECTION_IDS.flatMap((id) => {
        const el = document.getElementById(id);
        if (!el) return [];
        const r = el.getBoundingClientRect();
        return [{ id, top: r.top, bottom: r.bottom }];
      });
      onChange(sectionAt(rects, window.innerHeight / 2));
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(read);
    };

    read();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [active, onChange]);
}
