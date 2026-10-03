"use client";

import { useCallback, useSyncExternalStore } from "react";
import { detectAutoLite, LITE_STORAGE_KEY, type LiteMode } from "./liteBoot";

/**
 * React side of Lite mode — see lib/liteBoot.ts for what it is and how the
 * inline script sets <html data-lite="1|0" data-lite-mode="auto|on|off"> before
 * first paint. Components read that attribute; CSS keys off it directly.
 */

export type { LiteMode };

export const LITE_EVENT = "lalsm:lite-change";

function readAttr(name: string): string | null {
  return typeof document === "undefined" ? null : document.documentElement.getAttribute(name);
}

function subscribe(callback: () => void) {
  window.addEventListener(LITE_EVENT, callback);
  return () => window.removeEventListener(LITE_EVENT, callback);
}

/** Applies a mode chosen by the visitor and notifies every subscriber. */
export function setLiteMode(mode: LiteMode) {
  try {
    if (mode === "auto") localStorage.removeItem(LITE_STORAGE_KEY);
    else localStorage.setItem(LITE_STORAGE_KEY, mode);
  } catch {
    // storage blocked: the choice still applies for this page view
  }

  const lite = mode === "on" || (mode === "auto" && detectAutoLite());
  const root = document.documentElement;
  root.setAttribute("data-lite", lite ? "1" : "0");
  root.setAttribute("data-lite-mode", mode);
  window.dispatchEvent(new Event(LITE_EVENT));
}

/** Current lite state and the visitor's chosen mode. The server renders as full. */
export function useLite() {
  const lite = useSyncExternalStore(
    subscribe,
    () => readAttr("data-lite") === "1",
    () => false,
  );
  const mode = useSyncExternalStore(
    subscribe,
    () => (readAttr("data-lite-mode") as LiteMode | null) ?? "auto",
    () => "auto" as LiteMode,
  );
  const setMode = useCallback((next: LiteMode) => setLiteMode(next), []);
  return { lite, mode, setMode };
}
