"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { getWarmupSnapshot, startWarmup } from "@/lib/warmup";
import { registerWarmupTasks } from "@/lib/warmupTasks";

/** The counter never finishes faster than this, so it never just flashes. */
const MIN_MS = 1400;
/** Give up waiting for warm-up after this long; sections fall back to their own setup. */
const MAX_MS = 9000;

/**
 * The counter is the real progress of the warm-up pipeline (lib/warmup.ts): the
 * WebGL scenes below are created, compiled and uploaded behind this screen, so
 * reaching them later is an animation rather than a stall.
 */
export default function Preloader() {
  const counterRef = useRef<HTMLDivElement>(null);
  const preloaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const counter = counterRef.current;
    const preloader = preloaderRef.current;
    if (!counter || !preloader) return;

    document.body.style.overflow = "hidden";
    registerWarmupTasks();
    void startWarmup();

    const startedAt = performance.now();
    let shown = 0;
    let frame = 0;
    let leaving = false;

    const leave = () => {
      if (leaving) return;
      leaving = true;
      counter.textContent = "100%";
      setTimeout(() => {
        gsap.to(preloader, {
          yPercent: -100,
          duration: 1.5,
          ease: "power4.inOut",
          onComplete: () => {
            document.body.style.overflow = "";
            preloader.style.display = "none";
            window.dispatchEvent(new Event("lalsm:preloader-done"));
          },
        });
        gsap.fromTo(
          ".hero h1, .hero p, .hero .btn-group",
          { y: 100, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.3, stagger: 0.2, delay: 0.5, ease: "power3.out" },
        );
      }, 350);
    };

    const tick = (now: number) => {
      const elapsed = now - startedAt;
      const snap = getWarmupSnapshot();
      // Real progress, but paced so a very fast device still shows a counter.
      const target = Math.min(snap.finished ? 1 : snap.progress * 0.97, elapsed / MIN_MS);
      shown += (target * 100 - shown) * 0.14;
      counter.textContent = Math.min(99, Math.round(shown)) + "%";

      const done = snap.finished && elapsed >= MIN_MS;
      if (done || elapsed >= MAX_MS) {
        leave();
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="preloader" ref={preloaderRef}>
      <div className="loader-content">
        <div className="counter" ref={counterRef}>0%</div>
        <div className="loading-text">INITIALIZING SYSTEM...</div>
      </div>
    </div>
  );
}
