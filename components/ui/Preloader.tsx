"use client";
import { useEffect } from "react";
import { setEntrance } from "@/lib/entrance";
import { holdQualityGovernor } from "@/lib/quality";
import { DIAL_TICKS, SPLASH_TASKS, elapsedLabel, lockLabel, odometer } from "@/lib/splash";
import { getWarmupSnapshot, getWarmupStatuses, startWarmup } from "@/lib/warmup";
import { registerWarmupTasks } from "@/lib/warmupTasks";

/** The counter never finishes faster than this, so the screen is never just a flash. */
const MIN_MS = 1700;
/** Calm visitors (Lite, reduced motion) get a short one: it is there to cover, not to perform. */
const MIN_CALM_MS = 500;
/** Give up waiting for warm-up after this long; sections fall back to their own setup. */
const MAX_MS = 9000;
/** After the last system locks: the sweep fades, then the halves are made, then they part. */
const FADE_SWEEP_MS = 200;
const HOLD_MS = 380;
const SPLIT_MS = 1400;
/** The mask of the lattice is rewritten this often at most: its edge is 22% soft, a faster rewrite is invisible. */
const FIELD_STEP_MS = 50;
const EASE_SPLIT = "cubic-bezier(0.76, 0, 0.24, 1)";

/**
 * The controller of the splash screen. The screen itself (components/ui/PreloaderShell.tsx) is part of the
 * server's HTML and is covering the page from the first paint; this only writes the real progress of the
 * warm-up pipeline (lib/warmup.ts) into it, and opens it when the work is done. The WebGL scenes below are
 * created, compiled and drawn once behind it, so reaching them later is an animation rather than a stall.
 *
 * It renders nothing: the markup is not part of this component, so there is nothing for it to hydrate.
 */
export default function Preloader() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".preloader");
    const html = document.documentElement;
    if (!root) {
      html.removeAttribute("data-splash");
      return;
    }

    const calm = html.getAttribute("data-lite") === "1" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const minMs = calm ? MIN_CALM_MS : MIN_MS;
    const q = <T extends Element = HTMLElement>(sel: string) => root.querySelector<T>(sel);
    const qa = <T extends Element = HTMLElement>(sel: string) => Array.from(root.querySelectorAll<T>(sel));

    const stage = q('[data-pl="stage"]');
    const horizon = q('[data-pl="horizon"]');
    const field = q('[data-pl="field"]');
    const read = q('[data-pl="read"]');
    const lockedEl = q('[data-pl="locked"]');
    const elapsedEl = q('[data-pl="elapsed"]');
    const clockEl = q('[data-pl="clock"]');
    const ticks = qa<SVGLineElement>('[data-pl="tick"]');
    const reels = qa('[data-pl="reel"]');
    const digits = qa(".pl-digit");
    const arcs = new Map(qa<SVGPathElement>(".pl-arc").map((a) => [a.getAttribute("data-task") ?? "", a] as const));
    const wrapper = document.getElementById("main-content-wrapper");
    const cells = [2, 11, 11];

    // Covered and still: the scroll is locked (CSS does it from the first paint; this keeps the old
    // contract for anything that looks at the body) and nothing behind the screen can take focus.
    document.body.style.overflow = "hidden";
    wrapper?.setAttribute("inert", "");
    // The warm-up compiles and uploads a good deal at once: that stutter is not the device struggling.
    holdQualityGovernor(true);
    let governorHeld = true;
    const releaseGovernor = () => {
      if (!governorHeld) return;
      governorHeld = false;
      holdQualityGovernor(false);
    };

    try {
      if (clockEl) {
        const time = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date());
        clockEl.textContent = `WIB ${time}`;
      }
    } catch {
      /* the corner keeps its placeholder */
    }

    registerWarmupTasks();
    void startWarmup();

    const startedAt = performance.now();
    let last = startedAt;
    let shown = 0;
    let litTicks = 0;
    let lastField = -Infinity;
    let lastElapsed = "";
    let lastValueNow = -1;
    let frame = 0;
    let leaving = false;
    let finished = false;
    const timers: number[] = [];
    const animations: Animation[] = [];
    const halves: HTMLElement[] = [];
    const seen = new Set<string>();
    let lockedCount = 0;
    const later = (fn: () => void, ms: number) => {
      timers.push(window.setTimeout(fn, ms));
    };

    const writeOdometer = (value: number) => {
      const pos = odometer(calm ? Math.round(value) : value);
      reels.forEach((reel, i) => {
        reel.style.transform = `translate3d(0, ${(-(pos[i] / cells[i]) * 100).toFixed(3)}%, 0)`;
      });
      // The leading zeros are there to keep the width, but they are not part of the number.
      digits[0]?.classList.toggle("is-ghost", value < 99.5);
      digits[1]?.classList.toggle("is-ghost", value < 9.5);
    };

    const writeTicks = (value: number) => {
      const n = Math.min(DIAL_TICKS, Math.round((value / 100) * DIAL_TICKS));
      while (litTicks < n) ticks[litTicks++]?.classList.add("is-on");
      while (litTicks > n) ticks[--litTicks]?.classList.remove("is-on");
    };

    const writeField = (value: number, now: number, force = false) => {
      if (!field || (!force && now - lastField < FIELD_STEP_MS)) return;
      lastField = now;
      field.style.setProperty("--pl-r", `${(-22 + 122 * (value / 100)).toFixed(1)}%`);
    };

    /** One arc and the readout for each system that has finished since the last look, as it really ended. */
    const syncSystems = () => {
      const statuses = getWarmupStatuses();
      for (const task of SPLASH_TASKS) {
        const s = statuses[task.name];
        if (!s || s === "pending" || seen.has(task.name)) continue;
        seen.add(task.name);
        const arc = arcs.get(task.name);
        if (s === "ok") {
          arc?.classList.add("is-locked");
          lockedCount += 1;
        } else arc?.classList.add("is-late");
        if (read) {
          read.textContent = lockLabel(s, task.name);
          if (!calm) read.animate([{ opacity: 0.15 }, { opacity: 1 }], { duration: 260, easing: "ease-out" });
        }
        if (lockedEl) lockedEl.textContent = `${lockedCount}/${SPLASH_TASKS.length} locked`;
      }
    };

    const writeProgress = (now: number) => {
      const value = Math.min(100, shown);
      writeOdometer(value);
      writeTicks(value);
      writeField(value, now);
      const tenth = Math.floor(value / 10) * 10;
      if (tenth !== lastValueNow) {
        lastValueNow = tenth;
        root.setAttribute("aria-valuenow", String(tenth));
      }
      // Since the request began (not since this script mounted): what the visitor has actually waited.
      const label = elapsedLabel(now);
      if (label !== lastElapsed && elapsedEl) {
        lastElapsed = label;
        elapsedEl.textContent = label;
      }
    };

    /** Everything is done: the hero's entrance starts as the curtain opens, and the page is handed back. */
    const finish = () => {
      if (finished) return;
      finished = true;
      animations.forEach((a) => a.cancel());
      halves.forEach((h) => h.remove());
      document.body.style.overflow = "";
      root.style.display = "none";
      html.removeAttribute("data-splash");
      wrapper?.removeAttribute("inert");
      window.dispatchEvent(new Event("lalsm:preloader-done"));
      later(releaseGovernor, 1500);
    };

    /** Two copies of the stage, one clipped to each half of the screen, made while they still match it exactly. */
    const makeHalves = () => {
      if (!stage) return;
      for (const side of ["top", "bottom"] as const) {
        const half = document.createElement("div");
        half.className = `pl-half pl-half--${side}`;
        half.setAttribute("aria-hidden", "true");
        half.appendChild(stage.cloneNode(true));
        root.appendChild(half);
        halves.push(half);
      }
    };

    /** The halves part along the horizon, the dial's ring breathes out, the line flares: transforms only. */
    const split = () => {
      root.classList.add("is-split");
      const [top, bottom] = halves;
      if (!top || !bottom) return finish();
      const move = (el: HTMLElement, to: string) =>
        el.animate([{ transform: "translate3d(0, 0, 0)" }, { transform: `translate3d(0, ${to}, 0)` }], {
          duration: SPLIT_MS,
          easing: EASE_SPLIT,
          fill: "forwards",
        });
      const a = move(top, "-50%");
      const b = move(bottom, "50%");
      animations.push(a, b);
      halves.forEach((h) => {
        const ring = h.querySelector<SVGElement>(".pl-dial svg");
        if (!ring) return;
        animations.push(
          ring.animate(
            [
              { opacity: 1, transform: "scale(1)" },
              { opacity: 0, transform: "scale(1.14)" },
            ],
            { duration: 750, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)", fill: "forwards" },
          ),
        );
      });
      if (horizon) {
        animations.push(
          horizon.animate(
            [
              { opacity: 0.34, transform: "scaleX(1) scaleY(1)" },
              { opacity: 1, transform: "scaleX(1) scaleY(3)", offset: 0.3 },
              { opacity: 0, transform: "scaleX(1) scaleY(7)" },
            ],
            { duration: 1100, easing: "ease-out", fill: "forwards" },
          ),
        );
      }
      // The hero rises into the opening, not after it.
      later(() => setEntrance("entering"), 140);
      void a.finished.then(finish, finish);
    };

    const leave = (now: number) => {
      if (leaving) return;
      leaving = true;
      shown = 100;
      writeProgress(now);
      writeField(100, now, true);
      syncSystems();
      if (read) {
        read.textContent =
          lockedCount === SPLASH_TASKS.length ? `All ${lockedCount} systems locked` : `${lockedCount} of ${SPLASH_TASKS.length} locked, the rest on fallback`;
      }
      root.setAttribute("aria-valuenow", "100");
      root.classList.add("is-leaving");
      // The page has settled behind the screen (fonts, lazily mounted parts, images): measure it once more,
      // now, while nothing is moving, and not in the middle of the opening.
      void import("gsap/ScrollTrigger").then((m) => m.ScrollTrigger.refresh()).catch(() => undefined);

      if (calm) {
        later(() => {
          setEntrance("entering");
          const fade = root.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 350, easing: "ease-out", fill: "forwards" });
          animations.push(fade);
          void fade.finished.then(finish, finish);
        }, 150);
        return;
      }
      later(makeHalves, FADE_SWEEP_MS);
      later(split, FADE_SWEEP_MS + HOLD_MS);
    };

    const tick = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      const elapsed = now - startedAt;
      const snap = getWarmupSnapshot();
      syncSystems();

      const forced = elapsed >= MAX_MS;
      const ready = snap.finished && elapsed >= minMs;
      // Real progress, but paced so a very fast device still shows a counter that is read, not a flash.
      const target = forced || ready ? 1 : Math.min(snap.finished ? 1 : snap.progress * 0.97, elapsed / minMs);
      // Frame-rate independent ease toward the target; the display never reaches 100 before the work does.
      shown += (target * 100 - shown) * (1 - Math.pow(1 - 0.12, dt / 16.7));
      if (!(forced || ready)) shown = Math.min(shown, 99);
      writeProgress(now);

      if ((forced || ready) && 100 - shown < 0.6) {
        leave(now);
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      timers.forEach((t) => window.clearTimeout(t));
      releaseGovernor();
      // Unmounted before it was done (development's double effect): leave the page as it was found.
      if (!finished && !leaving) {
        document.body.style.overflow = "";
        wrapper?.removeAttribute("inert");
      }
    };
  }, []);

  return null;
}
