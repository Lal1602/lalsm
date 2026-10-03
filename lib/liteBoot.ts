/**
 * Server-safe half of Lite mode (no "use client"): the detection logic and the
 * inline script that applies it to <html> before first paint. The React hook
 * lives in lib/lite.ts.
 *
 * Both functions below are serialised with toString() into a <script>, so they
 * must stay fully self-contained — no imports, no outer variables, and plain
 * `&&` checks instead of optional chaining.
 */

export type LiteMode = "auto" | "on" | "off";

export const LITE_STORAGE_KEY = "lite-mode";

/** Device heuristics for "auto": reduced motion, Save-Data, or a weak device. */
export function detectAutoLite(): boolean {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  return (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    !!(nav.connection && nav.connection.saveData) ||
    (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 2) ||
    (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 2)
  );
}

function boot(detect: () => boolean) {
  let mode = "auto";
  try {
    const stored = localStorage.getItem("lite-mode");
    if (stored === "on" || stored === "off") mode = stored;
  } catch {
    // storage blocked: stay on auto
  }

  const lite = mode === "on" || (mode === "auto" && detect());
  const root = document.documentElement;
  root.setAttribute("data-lite", lite ? "1" : "0");
  root.setAttribute("data-lite-mode", mode);
}

export const LITE_BOOT_SCRIPT = `(${boot.toString()})(${detectAutoLite.toString()});`;
