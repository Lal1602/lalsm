"use client";
import React, { useEffect, useRef } from "react";
import { markTubesWarmed } from "@/lib/tubesWarm";
import { getQualityPreset, onQualityChange } from "@/lib/quality";

// ── Type stubs for the self-hosted threejs-components module ─────────────────────────
interface TubesInstance {
  tubes: {
    setColors: (colors: string[]) => void;
    setLightsColors: (colors: string[]) => void;
  };
  three?: {
    minPixelRatio?: number;
    maxPixelRatio?: number;
    resize?: () => void;
    render?: () => void;
    renderer?: { init?: () => Promise<unknown> };
  };
  dispose?: () => void;
}

type TubesFactory = (
  canvas: HTMLCanvasElement,
  options: {
    tubes: {
      colors: string[];
      lights: { intensity: number; colors: string[] };
    };
  }
) => TubesInstance;

// ── Color palette — themed to match portfolio cyan/violet/purple ──────────────
const TUBE_COLORS = ["#00f3ff", "#bc13fe", "#8965e0"] as const;
const LIGHT_COLORS = ["#00f3ff", "#bc13fe", "#f4d03f", "#11cdef"] as const;

function randomColors(count: number): string[] {
  return Array.from({ length: count }, () =>
    "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0")
  );
}

async function warm(app: TubesInstance) {
  try {
    await app.three?.renderer?.init?.();
    app.three?.render?.();
  } catch (err) {
    console.warn("[TubesCursor] warm-up frame failed:", err);
  } finally {
    markTubesWarmed();
  }
}

/**
 * TubesCursor
 *
 * WebGL cursor-following tube animation via the self-hosted threejs-components build.
 * Scoped to the Horizon Showcase section only (canvas is absolute, not fixed).
 * Click to randomize colors.
 */
export default function TubesCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const appRef = useRef<TubesInstance | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas pixel dimensions to match the section viewport before library init.
    // Without this, canvas.width/height = 0 and the library computes NaN geometry.
    const syncSize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.offsetWidth || window.innerWidth;
        canvas.height = parent.offsetHeight || window.innerHeight;
      }
    };
    syncSize();

    // Keep in sync on resize
    const ro = new ResizeObserver(syncSize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    // Self-hosted copy (see public/vendor/README.txt). Typed as string, not a
    // literal, so TypeScript treats this as a runtime import rather than trying
    // to resolve a module.
    const MODULE_URL: string = "/vendor/tubes1.min.js";

    let offQuality: (() => void) | null = null;
    const initTimer = setTimeout(() => {
      syncSize(); // re-sync just before init in case layout shifted
      (import(/* webpackIgnore: true */ MODULE_URL) as Promise<{ default: TubesFactory }>)
        .then(({ default: factory }) => {
          if (!canvasRef.current) return;
          const app = factory(canvasRef.current, {
            tubes: {
              colors: [...TUBE_COLORS],
              lights: { intensity: 200, colors: [...LIGHT_COLORS] },
            },
          });
          // The library pins its buffer to 2x whatever the screen is, so on a 1x
          // display it drew 4.2 megapixels (plus a bloom pass) into a 1.05
          // megapixel canvas — resolution the screen cannot show. Both bounds
          // default to 2, so the max alone stays clamped up at 2. The governor then takes
          // it lower on a device that is struggling: the tubes are a soft glow, so
          // they lose almost nothing and the fill cost drops with the square of it.
          const fit = () => {
            if (!app.three) return;
            const ratio = Math.min(window.devicePixelRatio || 1, 2) * getQualityPreset().tubeScale;
            if (app.three.maxPixelRatio === ratio) return;
            app.three.minPixelRatio = ratio;
            app.three.maxPixelRatio = ratio;
            app.three.resize?.();
          };
          fit();
          offQuality = onQualityChange(fit);
          appRef.current = app;
          // The library only renders while on screen, so its first frame (pipelines, render targets,
          // bloom) would land on the frame the visitor scrolls in. Draw it now, behind the preloader.
          void warm(app);
        })
        .catch((err: unknown) => {
          console.error("[TubesCursor] Failed to load:", err);
          markTubesWarmed();
        });
    }, 150);

    return () => {
      ro.disconnect();
      clearTimeout(initTimer);
      offQuality?.();
      markTubesWarmed();
      if (appRef.current && typeof appRef.current.dispose === "function") {
        appRef.current.dispose();
      }
      appRef.current = null;
    };
  }, []);

  const handleClick = () => {
    if (!appRef.current) return;
    appRef.current.tubes.setColors(randomColors(3));
    appRef.current.tubes.setLightsColors(randomColors(4));
  };

  return (
    <div
      onClick={handleClick}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 8,
        cursor: "none",
        // transparent so the pixel stars div below (z-index 5) remains visible
        background: "transparent",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          position: "absolute",
          inset: 0,
          // Tubes WebGL is the dark atmospheric background.
          // Stars layer (z-index 9) floats above this canvas.
        }}
      />
    </div>
  );
}
