"use client";
import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * True while the element is on screen AND the tab is visible. A demo loop starts and
 * stops with it, so a demo that is scrolled away or in a background tab costs nothing.
 */
export function useRunning(ref: RefObject<Element | null>): boolean {
  const [inView, setInView] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(Boolean(entry?.isIntersecting)), { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);

  useEffect(() => {
    const on = () => setVisible(!document.hidden);
    on();
    document.addEventListener("visibilitychange", on);
    return () => document.removeEventListener("visibilitychange", on);
  }, []);

  return inView && visible;
}

export type Palette = Record<string, string>;

/**
 * Canvas drawing cannot use CSS variables directly, so the demos read their colours
 * from the element's computed style once, and again whenever the theme changes. The
 * returned object is stable (mutated in place), so a render loop can hold on to it.
 */
export function usePalette(ref: RefObject<HTMLElement | null>, names: string[]): RefObject<Palette> {
  const palette = useRef<Palette>({});
  const key = names.join(",");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => {
      const cs = getComputedStyle(el);
      for (const n of key.split(",")) palette.current[n] = cs.getPropertyValue(n).trim();
    };
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, [ref, key]);

  return palette;
}

/** Keeps a canvas's backing store matched to its CSS size and the device (capped) pixel ratio. */
export function useCanvasSize(
  ref: RefObject<HTMLCanvasElement | null>,
  maxDpr: number,
): RefObject<{ w: number; h: number; dpr: number }> {
  const size = useRef({ w: 300, h: 100, dpr: 1 });
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      const w = Math.max(1, c.clientWidth);
      const h = Math.max(1, c.clientHeight);
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      Object.assign(size.current, { w, h, dpr }); // in place: render loops hold this object
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(c);
    return () => ro.disconnect();
  }, [ref, maxDpr]);
  return size;
}
