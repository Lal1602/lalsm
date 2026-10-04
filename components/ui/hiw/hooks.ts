"use client";
import { useEffect, useSyncExternalStore, type RefObject } from "react";
import { useMotionValue, type MotionValue } from "motion/react";
import { useLite } from "@/lib/lite";
import { useQuality } from "@/lib/quality";

/**
 * How much motion the visitor and the device can take.
 *
 *   calm: reduced motion or Lite. Everything still works, but nothing is smoothed,
 *         tilted, stretched or thrown: values simply land.
 *   rich: calm is off AND the quality governor is at its two best tiers. Gates the
 *         decorative extras (pointer parallax, scroll-velocity warp, particles) so
 *         a struggling device keeps the interactions and drops the ornament.
 */
export function useCalm(): { calm: boolean; rich: boolean; particles: number } {
  // Not motion's useReducedMotion: that reads the preference on the very first client render, so
  // the markup it produced differed from the server's and hydration failed for those visitors.
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const { lite } = useLite();
  const { tier, preset } = useQuality();
  const calm = Boolean(reduced) || lite;
  return { calm, rich: !calm && tier <= 1, particles: calm ? 0 : preset.particles };
}

/**
 * False on the server and during hydration, true from then on. For inline styles that only
 * exist once something is live: written into the server's HTML they would stay behind, frozen,
 * for a visitor whose preference then turns the effect off.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/** A media query that is false on the server and during hydration. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (notify) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", notify);
      return () => mq.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** The element's width as a motion value, so transforms can be built from it with no React render. */
export function useElementWidth(ref: RefObject<HTMLElement | null>): MotionValue<number> {
  const width = useMotionValue(1000);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => width.set(el.clientWidth || 1000);
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, width]);
  return width;
}
