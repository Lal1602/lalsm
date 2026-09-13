/**
 * LenisSetup parks its instance on `window` so components outside the smooth
 * scroll provider (e.g. the Horizon waypoint rail) can drive programmatic
 * scrolls through Lenis instead of fighting it with native window.scrollTo.
 */
import type Lenis from "lenis";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export {};
