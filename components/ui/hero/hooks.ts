"use client";
import { useSyncExternalStore } from "react";

/** What the clock shows on the server and during hydration, so the two always agree. */
export const CLOCK_PLACEHOLDER = "--:--:--";

const jakarta = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Jakarta",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

/**
 * The snapshot must be the same value every time React asks between two ticks. Reading the clock inside
 * getSnapshot is not: two reads in a row can straddle a second, and React (in development) reports that
 * as a store that changes by itself. So the time is read here, once per tick, and getSnapshot returns it.
 */
let current = "";
const now = () => jakarta.format(new Date());

function subscribe(notify: () => void) {
  current = now();
  const id = window.setInterval(() => {
    // A hidden tab has nobody to read it.
    if (document.hidden) return;
    current = now();
    notify();
  }, 1000);
  return () => window.clearInterval(id);
}

/**
 * The time in Surabaya, to the second. A string snapshot compares by value, so React only
 * re-renders when the second actually changes.
 */
export function useJakartaClock(): string {
  return useSyncExternalStore(
    subscribe,
    () => current || (current = now()),
    () => CLOCK_PLACEHOLDER,
  );
}
