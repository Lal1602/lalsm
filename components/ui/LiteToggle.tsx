"use client";

import { useEffect, useState } from "react";
import "./lite.css";
import { useLite, type LiteMode } from "@/lib/lite";
import { track } from "@/lib/analytics";

const OPTIONS: { value: LiteMode; label: string; hint: string }[] = [
  { value: "auto", label: "Auto", hint: "Decide from my device" },
  { value: "on", label: "Lite", hint: "Fewer effects, smoother scroll" },
  { value: "off", label: "Full", hint: "All the 3D and glow" },
];

const HINT_DISMISSED_KEY = "lite-hint-dismissed";

/**
 * Watches the first few seconds of frames. If the page is visibly struggling and
 * the visitor has not chosen anything yet, `onChoppy` fires once.
 */
function useChoppyDetector(enabled: boolean, onChoppy: () => void) {
  useEffect(() => {
    if (!enabled) return;
    try {
      if (sessionStorage.getItem(HINT_DISMISSED_KEY)) return;
    } catch {
      // storage blocked: still fine to probe
    }

    let raf = 0;
    let startTimer = 0;

    // Let the preloader and first paint settle, then sample ~3s of frames.
    startTimer = window.setTimeout(() => {
      let last = performance.now();
      const begin = last;
      let frames = 0;
      let slow = 0;

      const tick = (now: number) => {
        const delta = now - last;
        last = now;
        if (!document.hidden && delta < 500) {
          frames += 1;
          if (delta > 40) slow += 1; // under 25 fps for this frame
        }
        if (now - begin < 3000) {
          raf = requestAnimationFrame(tick);
        } else if (frames > 20 && slow / frames > 0.35) {
          onChoppy();
        }
      };
      raf = requestAnimationFrame(tick);
    }, 7000);

    return () => {
      window.clearTimeout(startTimer);
      cancelAnimationFrame(raf);
    };
  }, [enabled, onChoppy]);
}

export default function LiteToggle() {
  const { lite, mode, setMode } = useLite();
  const [open, setOpen] = useState(false);
  const [suggest, setSuggest] = useState(false);

  useChoppyDetector(mode === "auto" && !lite, () => setSuggest(true));

  // Esc closes the menu.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const choose = (next: LiteMode) => {
    setMode(next);
    track("lite_mode", { mode: next });
    setOpen(false);
    setSuggest(false);
  };

  const dismissSuggestion = () => {
    setSuggest(false);
    try {
      sessionStorage.setItem(HINT_DISMISSED_KEY, "1");
    } catch {
      // storage blocked: the hint may return on reload, which is acceptable
    }
  };

  return (
    <div className="lite-root" data-lenis-prevent>
      {suggest && (
        <div className="lite-suggest" role="status">
          <p>Scrolling feels choppy? Lite mode trims the heavy effects.</p>
          <div className="lite-suggest-actions">
            <button type="button" onClick={() => choose("on")}>
              Switch to Lite
            </button>
            <button type="button" className="is-quiet" onClick={dismissSuggestion}>
              Not now
            </button>
          </div>
        </div>
      )}

      {open && (
        <div className="lite-menu" role="radiogroup" aria-label="Visual quality">
          {OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={mode === option.value}
              className={mode === option.value ? "is-active" : undefined}
              onClick={() => choose(option.value)}
            >
              <strong>{option.label}</strong>
              <span>{option.hint}</span>
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        className={`lite-btn${lite ? " is-lite" : ""}`}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`Visual quality: ${lite ? "lite" : "full"}${mode === "auto" ? " (auto)" : ""}. Open settings`}
        onClick={() => setOpen((v) => !v)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
        </svg>
        <span>{lite ? "LITE" : "FULL"}</span>
      </button>
    </div>
  );
}
