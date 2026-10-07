"use client";
import { useEffect } from "react";
import { setEntrance } from "@/lib/entrance";
import { holdQualityGovernor } from "@/lib/quality";
import { DIAL_TICKS, SPLASH_TASKS, arcFill, elapsedLabel, lockLabel, odometer, pacedTarget, progressCeiling, settleDigits, taskLabel } from "@/lib/splash";
import { getWarmupStatuses, startWarmup } from "@/lib/warmup";
import { registerWarmupTasks } from "@/lib/warmupTasks";

/**
 * The run is paced: slow in, slow out, so it can be watched. It never finishes faster than this, however fast the
 * device is (the work behind it can only make it longer, never shorter).
 */
const MIN_MS = 6000;
/** Calm visitors (Lite, reduced motion) get a short one: it is there to cover, not to perform. */
const MIN_CALM_MS = 500;
/** Give up waiting for warm-up after this long; sections fall back to their own setup. */
const MAX_MS = 10000;
/** The fastest the counter may move, in percent per millisecond: after a stall it glides on, it does not jump. */
const MAX_RATE = 0.05;
const MAX_RATE_CALM = 0.5;
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

    // Arriving on the home page by a link from another page: the boot script did not flag it (it runs once, on load).
    html.setAttribute("data-splash", "1");

    const calm = html.getAttribute("data-lite") === "1" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const minMs = calm ? MIN_CALM_MS : MIN_MS;
    const q = <T extends Element = HTMLElement>(sel: string) => root.querySelector<T>(sel);
    const qa = <T extends Element = HTMLElement>(sel: string) => Array.from(root.querySelectorAll<T>(sel));

    const stage = q('[data-pl="stage"]');
    const sweep = q('[data-pl="sweep"]');
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
    const fills = SPLASH_TASKS.map((task) => q<SVGPathElement>(`.pl-arc-fill[data-fill="${task.name}"]`));
    const fillShown = SPLASH_TASKS.map(() => 0);
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
    let headTick = -1;
    let lastSweep = -1;
    /** Arcs the counter has run all the way round, and the one whose name the readout is showing. */
    let bandsDone = 0;
    let bandAnnounced = -1;
    let lastField = -Infinity;
    let lastElapsed = "";
    let lastValueNow = -1;
    let frame = 0;
    let leaving = false;
    let finished = false;
    const timers: number[] = [];
    const animations: Animation[] = [];
    const halves: HTMLElement[] = [];
    let lockedCount = 0;
    const later = (fn: () => void, ms: number) => {
      timers.push(window.setTimeout(fn, ms));
    };

    const writeOdometer = (value: number) => {
      const pos = odometer(calm ? Math.round(value) : settleDigits(value));
      reels.forEach((reel, i) => {
        reel.style.transform = `translate3d(0, ${(-(pos[i] / cells[i]) * 100).toFixed(3)}%, 0)`;
      });
      // The leading zeros are there to keep the width, but they are not part of the number.
      const shownValue = calm ? Math.round(value) : settleDigits(value);
      digits[0]?.classList.toggle("is-ghost", shownValue < 99.5);
      digits[1]?.classList.toggle("is-ghost", shownValue < 9.5);
    };

    /** Every tick behind the counter is lit and the one it is on glows half way. */
    const writeTicks = (value: number) => {
      const n = Math.min(DIAL_TICKS, Math.floor((value / 100) * DIAL_TICKS));
      while (litTicks < n) ticks[litTicks++]?.classList.add("is-on");
      while (litTicks > n) ticks[--litTicks]?.classList.remove("is-on");
      const head = n < DIAL_TICKS ? n : -1;
      if (head !== headTick) {
        if (headTick >= 0) ticks[headTick]?.classList.remove("is-head");
        if (head >= 0) ticks[head]?.classList.add("is-head");
        headTick = head;
      }
    };

    /** The sweep's bright edge is where the counter is: one clock for the numbers, the ticks, the arcs and the sweep. */
    const writeSweep = (value: number) => {
      if (!sweep || calm) return;
      const angle = Math.round(value * 3.6 * 20) / 20;
      if (angle === lastSweep) return;
      lastSweep = angle;
      sweep.style.transform = `rotate(${angle}deg)`;
    };

    /** Each arc fills as the counter runs round it. */
    const writeArcs = (value: number) => {
      fills.forEach((fill, i) => {
        if (!fill) return;
        const f = arcFill(value, i, SPLASH_TASKS.length);
        if (f === fillShown[i]) return;
        fillShown[i] = f;
        fill.style.strokeDashoffset = (1 - f).toFixed(4);
      });
    };

    const writeField = (value: number, now: number, force = false) => {
      if (!field || (!force && now - lastField < FIELD_STEP_MS)) return;
      lastField = now;
      field.style.setProperty("--pl-r", `${(-22 + 122 * (value / 100)).toFixed(1)}%`);
    };

    /**
     * The readout and the lock of each arc follow the counter, not the work: an arc locks when the counter has run
     * round it, and the counter cannot get there before the system has finished (progressCeiling). What the arc says
     * is still what really happened to that system.
     */
    const syncSystems = (value: number, all = false) => {
      const statuses = getWarmupStatuses();
      const n = SPLASH_TASKS.length;
      const segment = 100 / n;
      while (bandsDone < n && (all || value >= (bandsDone + 1) * segment - 0.6)) {
        const task = SPLASH_TASKS[bandsDone];
        const st = statuses[task.name];
        const arc = arcs.get(task.name);
        if (st === "ok") {
          arc?.classList.add("is-locked");
          lockedCount += 1;
        } else {
          arc?.classList.add("is-late");
          fills[bandsDone]?.classList.add("is-late");
        }
        if (read && !all) {
          read.textContent = lockLabel(st === "ok" ? "ok" : st === "error" ? "error" : "timeout", task.name);
          if (!calm) read.animate([{ opacity: 0.15 }, { opacity: 1 }], { duration: 260, easing: "ease-out" });
        }
        if (lockedEl) lockedEl.textContent = `${lockedCount}/${n} locked`;
        bandsDone += 1;
      }
      // Between locks the readout names the system the counter is on.
      if (read && !all && bandsDone < n && bandAnnounced !== bandsDone && (bandsDone === 0 || value >= bandsDone * segment + segment * 0.12)) {
        bandAnnounced = bandsDone;
        read.textContent = `SYNCING · ${taskLabel(SPLASH_TASKS[bandsDone].name)}`;
      }
    };

    const writeProgress = (now: number) => {
      const value = Math.min(100, shown);
      writeOdometer(value);
      writeTicks(value);
      writeSweep(value);
      writeArcs(value);
      writeField(value, now);
      syncSystems(value);
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
              { opacity: 0, transform: "scaleX(1) scaleY(1)" },
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
      syncSystems(100, true);
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

      const forced = elapsed >= MAX_MS;
      // Where the counter is allowed to be: the paced clock, held back only by systems that have not finished yet
      // (in the dial's order, so an arc never fills before its system is done). Past MAX_MS nothing holds it.
      const statuses = getWarmupStatuses();
      const ceiling = forced ? 100 : progressCeiling(SPLASH_TASKS.map((t) => (statuses[t.name] ?? "pending") !== "pending"));
      const target = Math.min(ceiling, pacedTarget(elapsed, minMs));
      // Frame-rate independent ease toward the target, never faster than MAX_RATE: after a stall it glides on.
      const step = (target - shown) * (1 - Math.pow(1 - 0.1, dt / 16.7));
      shown = Math.min(100, Math.max(shown, shown + Math.min(step, (calm ? MAX_RATE_CALM : MAX_RATE) * dt)));
      writeProgress(now);

      const ready = ceiling >= 100 && elapsed >= minMs;
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
