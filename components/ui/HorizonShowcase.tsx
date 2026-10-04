"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import BackgroundPixelStars from "./BackgroundPixelStars";
import StarChart from "./StarChart";
import HorizonHud from "./HorizonHud";
import CosmicNebulaSeam from "./CosmicNebulaSeam";
import AccretionHorizonSeam from "./AccretionHorizonSeam";
import horizonScrollState from "@/lib/horizonScrollState";
import { useLite } from "@/lib/lite";
import { useMediaQuery } from "./hiw/hooks";
import { useSeamSnap } from "./useSeamSnap";

// Lazy-loaded — both use browser APIs, must be client-only
const CvTimelineSlide = dynamic(() => import("./CvTimelineSlide"), { ssr: false });
const TubesCursor = dynamic(() => import("./TubesCursor"), { ssr: false });

// The two stops on the horizontal transit. Order matches the slides below.
const WAYPOINTS = [
  { code: "01", label: "Observation Deck" },
  { code: "02", label: "Flight Record" },
];

/*
  Manifest strip under the title. Replaces the old paragraph, which only
  described the star field the visitor was already looking at. These are real
  values: the coordinates are PENS Surabaya, the payload is the stack this
  section actually runs on.
*/
const MANIFEST = [
  { key: "Origin", val: "07.2756°S · 112.7937°E" },
  { key: "Vessel", val: "BILAL // CREATIVE DEV" },
  { key: "Payload", val: "WEBGL · MOTION · SYSTEMS" },
];

export default function HorizonShowcase() {
  const [mounted, setMounted] = useState(false);
  const { lite } = useLite();
  const sectionRef = useRef<HTMLElement | null>(null);
  // Where the section is not pinned (phones) its bottom edge is the seam into Projects: keep it on a
  // whole device pixel. Pinned, the same is done through the pin's length (GSAPEffects).
  const stacked = useMediaQuery("(max-width: 968px)");
  useSeamSnap(sectionRef, stacked);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    // Ensure custom cursor elements remain visible
    document
      .querySelectorAll<HTMLElement>(".cursor-dot, .cursor-outline")
      .forEach((el) => {
        el.style.opacity = "";
        el.style.pointerEvents = "";
      });
  }, []);

  // ── Publish the active waypoint onto the container ────────────────────────
  // CSS keys off data-waypoint to park the star chart's two rotating layers
  // whenever slide 01 is off screen, so they cost nothing on the career slide.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    let current = -1;
    const apply = (progress: number) => {
      const index = Math.round(progress * (WAYPOINTS.length - 1));
      if (index === current) return;
      current = index;
      el.dataset.waypoint = String(index);
    };

    const unsubscribe = horizonScrollState.subscribe(apply);
    apply(horizonScrollState.progress);
    return unsubscribe;
  }, [mounted]);

  return (
    <section
      ref={sectionRef}
      className="horizon-container"
      id="playground"
      data-waypoint="0"
      aria-label="Horizon Showcase Section"
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
          {!lite && <BackgroundPixelStars />}
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
          {!lite && <TubesCursor />}
        </div>
      )}

      {/* 3D Concave optical depth vignette — z-index 15, always on top */}
      <div className="horizon-concave-backdrop" />

      {/* ── Seamless Cosmic-to-Cyber Transition Bridge (Procedural Nebula Continuation + Cyber Grid) ── */}
      <div className="horizon-top-transition" aria-hidden="true">
        <CosmicNebulaSeam part="lower" />
        <div className="horizon-top-cyber-grid" />
      </div>

      {/* ── Seamless Accretion Wave & Horizon Seam (Upper Half, renders behind cards) ── */}
      {mounted && <AccretionHorizonSeam part="upper" />}

      {/* Slides wrapper — GSAP translates this horizontally for scroll */}
      <div className="horizon-wrapper">

        {/* SLIDE 1: OBSERVATION DECK (Hidden on mobile) */}
        <div className="horizon-slide slide--kinetic hide-on-mobile">
          <StarChart />

          <div className="horizon-slide-content">
            <p className="slide-badge deck-badge">
              <span className="deck-badge-rule" aria-hidden="true" />
              {"SECTOR 01 · OBSERVATION DECK"}
              <span className="deck-badge-rule" aria-hidden="true" />
            </p>

            <h2 className="kinetic-hero-title">
              CREATIVE<br />
              <span className="text-hollow">PLAYGROUND</span>
            </h2>

            <dl className="transit-manifest">
              {MANIFEST.map((row) => (
                <div className="manifest-cell" key={row.key}>
                  <dt>{row.key}</dt>
                  <dd>{row.val}</dd>
                </div>
              ))}
              <div className="manifest-cell manifest-cell--signal">
                <dt>Signal</dt>
                <dd>
                  <i className="manifest-pulse" aria-hidden="true" />
                  TRANSMITTING
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* SLIDE 2: FLIGHT RECORD — career pathway */}
        {mounted && <CvTimelineSlide />}

      </div>

      {/* Instrument frame — fixed relative to the section, above the slides */}
      <HorizonHud waypoints={WAYPOINTS} />
    </section>
  );
}
