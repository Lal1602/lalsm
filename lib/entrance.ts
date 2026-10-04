/**
 * Where the hero's entrance is: `waiting` (hidden, the preloader is still up), `entering` (the
 * sequence is running) or `done`. The preloader moves it to `entering` as its curtain starts to lift.
 *
 * The first read decides the starting state from what the page's boot script put on <html>: it
 * writes data-hero="wait" before first paint unless the visitor is calm (reduced motion or Lite),
 * so for a calm visitor, or any page that never sets it, the state is simply `done` and nothing
 * waits. The server and the first client render both see `waiting`, so a consumer that only
 * reacts to the state (and renders the same markup either way) cannot cause a mismatch.
 */

/**
 * Runs in <head> before first paint, after the Lite boot script. Marks the page so the hero's
 * CSS can keep its parts hidden until the entrance plays; a calm visitor (Lite, which includes
 * reduced motion) is not marked and sees the finished hero at once. Self-contained: it is a string.
 */
export const HERO_BOOT_SCRIPT = `(function(){var d=document.documentElement;var calm=d.getAttribute('data-lite')==='1'||(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);if(!calm)d.setAttribute('data-hero','wait');})();`;

export type EntranceState = "waiting" | "entering" | "done";

let state: EntranceState | null = null;
const listeners = new Set<() => void>();

function initial(): EntranceState {
  if (typeof document === "undefined") return "waiting";
  return document.documentElement.getAttribute("data-hero") === "wait" ? "waiting" : "done";
}

export function getEntrance(): EntranceState {
  if (state === null) state = initial();
  return state;
}

/** Only moves forward: waiting -> entering -> done. Anything else is ignored. */
export function setEntrance(next: EntranceState): void {
  const order: EntranceState[] = ["waiting", "entering", "done"];
  if (order.indexOf(next) <= order.indexOf(getEntrance())) return;
  state = next;
  listeners.forEach((l) => l());
}

export function subscribeEntrance(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Server snapshot for useSyncExternalStore. */
export const getServerEntrance = (): EntranceState => "waiting";

/** Test hook. */
export function resetEntranceForTests(): void {
  state = null;
  listeners.clear();
}
