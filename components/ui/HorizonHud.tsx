"use client";
import { useCallback, useEffect, useRef } from "react";
import horizonScrollState from "@/lib/horizonScrollState";

/**
 * HorizonHud — the fixed instrument frame around the Horizon section.
 *
 * Lives outside `.horizon-wrapper`, so it stays put while the slides translate
 * underneath it. Everything it animates is either a transform or a single text
 * node, and the text nodes are only touched when their rendered value actually
 * changes — the section is already GPU-bound, so the HUD deliberately adds no
 * blur, no shadow animation and no extra compositing layers beyond the ruler.
 */

export type Waypoint = { code: string; label: string };

export default function HorizonHud({ waypoints }: { waypoints: Waypoint[] }) {
  const pctRef = useRef<HTMLSpanElement>(null);
  const rulerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const sectorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const lastText = { pct: -1, sector: -1 };

    const update = (progress: number) => {
      const pct = Math.round(progress * 100);
      if (pct !== lastText.pct && pctRef.current) {
        lastText.pct = pct;
        pctRef.current.textContent = String(pct).padStart(3, "0");
      }

      // Ruler drifts twice as far as the slides so the parallax reads as depth.
      if (rulerRef.current) {
        rulerRef.current.style.transform = `translate3d(${-progress * 22}%, 0, 0)`;
      }
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${progress})`;
      }

      const active = Math.round(progress * (waypoints.length - 1));
      if (active !== lastText.sector) {
        lastText.sector = active;
        if (sectorRef.current) {
          sectorRef.current.textContent = String(active + 1).padStart(2, "0");
        }
        const nodes = railRef.current?.children;
        if (nodes) {
          for (let i = 0; i < nodes.length; i++) {
            (nodes[i] as HTMLElement).classList.toggle("is-active", i === active);
          }
        }
      }
    };

    const unsubscribe = horizonScrollState.subscribe(update);
    update(horizonScrollState.progress);
    return unsubscribe;
  }, [waypoints.length]);

  // Jump to a waypoint by mapping its index onto the pinned ScrollTrigger range.
  const jumpTo = useCallback(
    (index: number) => {
      const { start, end } = horizonScrollState;
      if (end <= start) return;
      const target = start + ((end - start) * index) / Math.max(1, waypoints.length - 1);
      // Go through Lenis when it is running — a native scrollTo would be
      // overwritten by Lenis' own target on the very next frame.
      if (window.__lenis) window.__lenis.scrollTo(target, { duration: 1 });
      else window.scrollTo({ top: target, behavior: "smooth" });
    },
    [waypoints.length]
  );

  return (
    <div className="horizon-hud">
      {/* ── Right edge sector stamp ── */}
      <div className="hud-sector" aria-hidden="true">
        SECTOR <span ref={sectorRef}>01</span> / {String(waypoints.length).padStart(2, "0")}
      </div>

      {/* ── Waypoint rail (interactive) ── */}
      <nav className="hud-rail" ref={railRef} aria-label="Horizon section waypoints">
        {waypoints.map((w, i) => (
          <button
            key={w.code}
            type="button"
            className={`hud-waypoint${i === 0 ? " is-active" : ""}`}
            onClick={() => jumpTo(i)}
          >
            <span className="hud-waypoint-node" aria-hidden="true" />
            <span className="hud-waypoint-code">{w.code}</span>
            <span className="hud-waypoint-label">{w.label}</span>
          </button>
        ))}
      </nav>

      {/* ── Distance ruler along the bottom edge ── */}
      <div className="hud-ruler" aria-hidden="true">
        <div className="hud-ruler-track" ref={rulerRef} />
      </div>
    </div>
  );
}
