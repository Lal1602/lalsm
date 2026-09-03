"use client";
import { useEffect } from "react";
import Lenis from "lenis";

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

    // Update ScrollTrigger on Lenis scroll
    lenis.on("scroll", () => {
      // Import GSAP's ScrollTrigger dynamically or directly
      import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
        ScrollTrigger.update();
      });
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    // Initial refresh to ensure all triggers align with the loaded DOM height
    const refreshTimer = setTimeout(() => {
      import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
        ScrollTrigger.refresh();
      });
    }, 1000);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(refreshTimer);
      lenis.destroy();
    };
  }, []);

  return null;
}
