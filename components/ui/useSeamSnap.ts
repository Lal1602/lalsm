"use client";
import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { gridPad } from "@/lib/seamGrid";

gsap.registerPlugin(ScrollTrigger);

/**
 * Moves the bottom edge of a section onto the seam grid (lib/seamGrid) by padding it, so
 * the nebula canvas that ends there and the one that starts in the next section meet on a
 * whole device pixel. The padding is published as `--seam-snap` on the section; its CSS adds
 * it to its own bottom padding. It is re-measured whenever the page's height changes (fonts,
 * a resize, content above), and ScrollTrigger is told, because everything below has moved.
 */
export function useSeamSnap(ref: RefObject<HTMLElement | null>, enabled: boolean = true): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!enabled) {
      el.style.removeProperty("--seam-snap");
      return;
    }

    let pad = 0;
    let raf = 0;

    const measure = () => {
      raf = 0;
      // The section's bottom without the padding added here, in document coordinates.
      const y = el.getBoundingClientRect().bottom + window.scrollY - pad;
      const next = Math.round(gridPad(y) * 1000) / 1000;
      if (Math.abs(next - pad) < 0.05) return;
      pad = next;
      el.style.setProperty("--seam-snap", `${pad}px`);
      ScrollTrigger.refresh();
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };

    schedule();
    // The section itself and the page content around it (the body can have a fixed height, in which
    // case its own box never changes when what is inside it grows).
    const ro = new ResizeObserver(schedule);
    ro.observe(el);
    if (el.parentElement) ro.observe(el.parentElement);
    void document.fonts?.ready.then(schedule);

    return () => {
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
      el.style.removeProperty("--seam-snap");
    };
  }, [ref, enabled]);
}
