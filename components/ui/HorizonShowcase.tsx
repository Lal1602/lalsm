"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import BackgroundPixelStars from "./BackgroundPixelStars";

// Lazy-loaded — both use browser APIs, must be client-only
const CvTimelineSlide = dynamic(() => import("./CvTimelineSlide"), { ssr: false });
const TubesCursor = dynamic(() => import("./TubesCursor"), { ssr: false });

export default function HorizonShowcase() {
  const [mounted, setMounted] = useState(false);
  // Tracks whether the mouse is inside the horizon section
  const [tubesActive, setTubesActive] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Hide / restore portfolio custom cursor while inside horizon section ────
  // The portfolio uses .cursor-dot and .cursor-outline (position: fixed, z-index 20000).
  // When tubes are active we hide them so they don't fight with the WebGL cursor effect.
  const hideCursor = useCallback(() => {
    document
      .querySelectorAll<HTMLElement>(".cursor-dot, .cursor-outline")
      .forEach((el) => {
        el.style.opacity = "0";
        el.style.pointerEvents = "none";
      });
  }, []);

  const showCursor = useCallback(() => {
    document
      .querySelectorAll<HTMLElement>(".cursor-dot, .cursor-outline")
      .forEach((el) => {
        el.style.opacity = "";
        el.style.pointerEvents = "";
      });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setTubesActive(true);
    hideCursor();
  }, [hideCursor]);

  const handleMouseLeave = useCallback(() => {
    setTubesActive(false);
    showCursor();
  }, [showCursor]);

  // Safety net: if component unmounts while mouse is inside, restore cursor
  useEffect(() => {
    return () => {
      showCursor();
    };
  }, [showCursor]);

  return (
    <section
      ref={sectionRef}
      className="horizon-container"
      id="playground"
      aria-label="Horizon Showcase Section"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/*
        ── PIXEL STARS BACKGROUND (z-index 5) ──────────────────────────────────
        Outside .horizon-wrapper so it is NOT in the preserve-3d stacking context.
        Transparent slides let stars show through from below on every slide.
      */}
      {mounted && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            // z-index 9: ABOVE TubesCursor (z-index 8) so stars are visible over the WebGL bg
            zIndex: 9,
            pointerEvents: "none",
            // Force own GPU composite layer — prevents flicker when
            // GSAP ScrollTrigger mutates sibling/parent transforms during fast scroll
            transform: "translateZ(0)",
            willChange: "transform",
            backfaceVisibility: "hidden",
          }}
        >
          <BackgroundPixelStars />
        </div>
      )}

      {/*
        ── TUBES CURSOR (z-index 8) ─────────────────────────────────────────────
        Rendered only after mount. Sits above pixel stars (z-index 5) and below
        .horizon-wrapper (z-index 10), so slide text always paints above the tubes.
        The canvas fills .horizon-container absolutely — NOT fixed — so the effect
        is scoped entirely to the horizontal scroll section.
        pointer-events: none on the wrapper here so mouse events pass through to
        slides (links, buttons, etc.) — the TubesCursor canvas handles its own
        mouse tracking internally via the CDN library.
      */}
      {mounted && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 8,
            // pointer-events none on the wrapper; inner canvas has its own listeners
            pointerEvents: "none",
            // Force own GPU composite layer to prevent flicker during scroll
            transform: "translateZ(0)",
            willChange: "transform",
            backfaceVisibility: "hidden",
          }}
        >
          <TubesCursor />
        </div>
      )}

      {/* 3D Concave optical depth vignette — z-index 15, always on top */}
      <div className="horizon-concave-backdrop" />

      {/* Slides wrapper — GSAP translates this horizontally for scroll */}
      <div className="horizon-wrapper">

        {/* SLIDE 1: CREATIVE PLAYGROUND */}
        <div className="horizon-slide slide--kinetic">
          <div className="horizon-slide-content">
            <p className="slide-badge">// PLAYGROUND</p>
            <h2 className="kinetic-hero-title">
              CREATIVE<br />
              <span className="text-hollow">PLAYGROUND</span>
            </h2>
            <p className="slide-description">
              An immersive retro-pixel star field — every star twinkles and shooting stars
              streak across the cosmos as the canvas of creativity.
            </p>
          </div>
        </div>

        {/* SLIDE 2: CAREER PATHWAY */}
        {mounted && <CvTimelineSlide />}

      </div>
    </section>
  );
}
