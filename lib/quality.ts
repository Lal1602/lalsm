"use client";

import { useSyncExternalStore } from "react";
import { QualityGovernor, QUALITY_PRESETS, type QualityPreset, type QualityTier } from "./qualityGovernor";

/**
 * Browser side of the quality governor. One rAF sampler feeds frame deltas to
 * the pure QualityGovernor; its verdict is published as <html data-q="0..3"> and
 * a window event. Effects read it through useQuality() or `[data-q]` in CSS.
 * Lite mode (data-lite="1") always reads as the leanest tier.
 */

export const QUALITY_EVENT = "lalsm:quality-change";

let started = false;
let held = 0;

/**
 * Pauses the governor's sampling while a demo is deliberately loading the main thread
 * (the frame-time meter's "load" switch). Without it the governor would read the staged
 * stutter as a struggling device and strip the page's effects. Calls nest.
 */
export function holdQualityGovernor(on: boolean): void {
  held = Math.max(0, held + (on ? 1 : -1));
}

function readTier(): QualityTier {
  if (typeof document === "undefined") return 0;
  const root = document.documentElement;
  if (root.getAttribute("data-lite") === "1") return 3;
  const raw = Number(root.getAttribute("data-q"));
  return (raw >= 0 && raw <= 3 ? raw : 0) as QualityTier;
}

/** Idempotent. Safe to call from any client component's effect. */
export function startQualityGovernor(): void {
  if (started || typeof window === "undefined") return;
  started = true;

  const root = document.documentElement;
  const initial = Number(root.getAttribute("data-q")) as QualityTier;
  const governor = new QualityGovernor({ initialTier: initial >= 0 && initial <= 3 ? initial : 0 });

  let last = performance.now();

  const tick = (now: number) => {
    const delta = now - last;
    last = now;
    if (!document.hidden && held === 0) {
      const next = governor.push(delta, now);
      if (next !== null) {
        root.setAttribute("data-q", String(next));
        window.dispatchEvent(new Event(QUALITY_EVENT));
      }
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function subscribe(callback: () => void) {
  window.addEventListener(QUALITY_EVENT, callback);
  // Lite toggles change the effective tier too.
  window.addEventListener("lalsm:lite-change", callback);
  return () => {
    window.removeEventListener(QUALITY_EVENT, callback);
    window.removeEventListener("lalsm:lite-change", callback);
  };
}

/** Current tier and the numbers each effect should size itself by. */
export function useQuality(): { tier: QualityTier; preset: QualityPreset } {
  const tier = useSyncExternalStore(subscribe, readTier, () => 0 as QualityTier);
  return { tier, preset: QUALITY_PRESETS[tier] };
}

/** Non-React read for render loops that must not subscribe. */
export function getQualityPreset(): QualityPreset {
  return QUALITY_PRESETS[readTier()];
}

/** Subscribe from a render loop; returns the unsubscribe. */
export function onQualityChange(fn: () => void): () => void {
  return subscribe(fn);
}
