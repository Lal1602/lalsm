"use client";
import React, { useEffect, useRef } from "react";

// ── Type stubs for the threejs-components CDN module ─────────────────────────
interface TubesInstance {
  tubes: {
    setColors: (colors: string[]) => void;
    setLightsColors: (colors: string[]) => void;
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

/**
 * TubesCursor
 *
 * WebGL cursor-following tube animation via threejs-components CDN library.
 * Scoped to the Horizon Showcase section only (canvas is absolute, not fixed).
 * Click to randomize colors.
 */
export default function TubesCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const appRef = useRef<TubesInstance | null>(null);

  useEffect(() => {
    let initTimer: ReturnType<typeof setTimeout>;
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

    const CDN_URL =
      "https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js";

    initTimer = setTimeout(() => {
      syncSize(); // re-sync just before init in case layout shifted
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore — TypeScript cannot resolve CDN URLs statically; this is intentional.
      (import(/* webpackIgnore: true */ CDN_URL) as Promise<{ default: TubesFactory }>)
        .then(({ default: factory }) => {
          if (!canvasRef.current) return;
          const app = factory(canvasRef.current, {
            tubes: {
              colors: [...TUBE_COLORS],
              lights: { intensity: 200, colors: [...LIGHT_COLORS] },
            },
          });
          appRef.current = app;
        })
        .catch((err: unknown) => {
          console.error("[TubesCursor] Failed to load:", err);
        });
    }, 150);

    return () => {
      ro.disconnect();
      clearTimeout(initTimer);
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
