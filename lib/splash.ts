/**
 * The splash screen ("First Light"): what it is made of, as data. The screen's markup
 * (components/ui/PreloaderShell.tsx) is rendered by the server so that it is in the very first paint, and the
 * controller (components/ui/Preloader.tsx) only writes numbers into it. Both read this file, so the dial's
 * eight arcs and the warm-up's eight tasks cannot drift apart.
 */

/**
 * Runs in <head> before first paint, after the theme, Lite and hero boot scripts. Marks the page as covered
 * (CSS locks the scroll while it is) and starts it at the top: the splash and the hero's entrance both belong to
 * the top of the page, and a browser that restores a scroll position behind a cover would land the entrance
 * somewhere nobody is looking. Self-contained: it is a string.
 *
 * Only the home page has a splash (its controller lives in ClientShell). The other pages (/cv, /blog, /projects/*)
 * share the layout, and so the markup, but nothing there would ever lift it: the flag is set on "/" alone, and the
 * stylesheet shows the cover only while the flag is set.
 */
export const SPLASH_BOOT_SCRIPT = `(function(){if(location.pathname!=='/')return;var d=document.documentElement;d.setAttribute('data-splash','1');try{history.scrollRestoration='manual';}catch(e){}try{window.scrollTo(0,0);}catch(e){}})();`;

export interface SplashTask {
  /** The warm-up task (lib/warmupTasks.ts) this arc stands for. */
  name: string;
  /** What the readout says when it locks. */
  label: string;
  /** Its share of the progress, about its cost. */
  weight: number;
}

/** In the order the arcs run round the dial (clockwise from the top): the page's own order, hero first. */
export const SPLASH_TASKS: readonly SplashTask[] = [
  { name: "portrait", label: "PORTRAIT", weight: 1.5 },
  { name: "fonts", label: "TYPE FACES", weight: 0.5 },
  { name: "chunks", label: "SECTIONS", weight: 1.5 },
  { name: "images", label: "CERTIFICATES", weight: 1 },
  { name: "space", label: "SKY SHADERS", weight: 1 },
  { name: "seams", label: "NEBULA SEAMS", weight: 2 },
  { name: "tubes", label: "HORIZON TUBES", weight: 2 },
  { name: "plates", label: "PROJECT PLATES", weight: 3 },
];

export const taskWeight = (name: string): number => SPLASH_TASKS.find((t) => t.name === name)?.weight ?? 1;
export const taskLabel = (name: string): string => SPLASH_TASKS.find((t) => t.name === name)?.label ?? name.toUpperCase();

/** Ticks on the dial: one per percent and a bit, in the manner of the hero's ruler. Every fifth is long. */
export const DIAL_TICKS = 120;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/**
 * Where each column of the odometer sits, in cells, for a value from 0 to 100 (fractions roll). A column holds
 * the digits 0..9 and then a 0 again, so rolling from 9 to 0 is a continuous move that ends on a picture identical
 * to the start: nothing ever has to jump back. [hundreds, tens, ones].
 */
export function odometer(value: number): [number, number, number] {
  const v = Math.min(100, Math.max(0, value));
  // Tens roll over while the ones go from 9 to 10; hundreds while the tens go from 9 to 10, that is, 99 to 100.
  const tens = Math.floor(v / 10) + clamp01((v % 10) - 9);
  const hundreds = clamp01(v - 99);
  return [hundreds, tens, v >= 100 ? 0 : v % 10];
}

const smoothstep = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};

/**
 * The number the odometer should show for a progress value. The progress itself rises continuously, but a reel
 * that is always half-way between two digits is unreadable: every digit instead rests on its whole value for the
 * first part of each unit and rolls to the next one over the rest, eased. It stays inside the unit the value is in and
 * never goes back (it trails the value by under 0.45 at most and leads it by under 0.1 while rolling).
 */
export function settleDigits(value: number): number {
  const v = Math.min(100, Math.max(0, value));
  if (v >= 100) return 100;
  const whole = Math.floor(v);
  return whole + smoothstep((v - whole - 0.4) / 0.6);
}

/** Where the paced clock puts the counter after `elapsedMs` of a run meant to last `durationMs`: slow in, slow out. */
export const pacedTarget = (elapsedMs: number, durationMs: number): number => 100 * smoothstep(elapsedMs / Math.max(1, durationMs));

/**
 * How far the dial may show, given which systems (in dial order) have settled. Each system owns an equal arc of the
 * dial, so the counter cannot pass an arc whose system has not finished: it waits near the end of that arc (`wait` of
 * the way through) and the arcs after it stay dark. Everything settled: all the way.
 */
export function progressCeiling(settled: readonly boolean[], wait = 0.85): number {
  const segment = 100 / Math.max(1, settled.length);
  for (let i = 0; i < settled.length; i++) if (!settled[i]) return (i + wait) * segment;
  return 100;
}

/** 0..1: how much of arc `index` (of `count`, clockwise from the top) the counter has run round. */
export function arcFill(value: number, index: number, count: number): number {
  const segment = 100 / Math.max(1, count);
  return clamp01((value - index * segment) / segment);
}

/** Seconds, one decimal, for the corner clock. */
export const elapsedLabel = (ms: number): string => `${(Math.max(0, ms) / 1000).toFixed(1)}s`;

/** "LOCKED", or what really happened to a task that did not finish in time. */
export function lockLabel(status: "ok" | "timeout" | "error", name: string): string {
  const label = taskLabel(name);
  if (status === "ok") return `LOCKED · ${label}`;
  return `FALLBACK · ${label}`;
}
