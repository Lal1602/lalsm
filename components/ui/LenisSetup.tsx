"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function LenisSetup() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    // Statically imported, so this no longer kicks off a dynamic import()
    // on every single scroll event.
    lenis.on("scroll", ScrollTrigger.update);

    // Deliberately Lenis' own rAF rather than gsap.ticker: parking a permanent
    // callback on the ticker keeps GSAP awake every frame even when nothing is
    // animating, which measurably cost frames while the page sat idle.
    let rafId = 0;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Expose the instance so programmatic scrolls (Horizon waypoint rail) go
    // through Lenis. A native window.scrollTo would be immediately overridden
    // by Lenis' own animation target on the next frame.
    window.__lenis = lenis;

    // Initial refresh to ensure all triggers align with the loaded DOM height
    const refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 1000);

    return () => {
      clearTimeout(refreshTimer);
      cancelAnimationFrame(rafId);
      delete window.__lenis;
      lenis.destroy();
    };
  }, []);

  return null;
}
