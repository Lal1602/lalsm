import { animate, stagger, type AnimationPlaybackControls, type MotionValue } from "motion/react";
import type { PortraitDots } from "./portraitField";

/**
 * The hero's entrance, played once as the preloader's curtain lifts.
 *
 * One easing family throughout (an expo-out), so everything arrives the same way and only the
 * delays differ. Times are seconds after the curtain starts; BASE holds the whole thing back until
 * the curtain has cleared enough of the hero for the first movement to be seen.
 *
 *   0.00  frame ticks draw                       0.65  headline, line 1 (28 ms per letter)
 *   0.10  kicker rule, kicker text               0.77  headline, line 2
 *   1.05  the beacon drops in with a spring      1.05  lede
 *   1.25  buttons                                1.35  portrait: dots arrive as a wave from the full stop
 *   1.45  ledger; the archive count rolls up     1.65  ruler (from the middle out)
 *   1.95  scroll cue                             ~2.65 done: the beacon pings once
 *
 * Every element is hidden by CSS until this runs (html[data-hero="wait"], set before first paint). The
 * hidden state is re-applied here as inline style before that attribute is released, so there is no
 * frame in which the finished hero shows. When the sequence ends the inline styles are removed,
 * which leaves the elements to CSS and to the pointer system.
 */

const EASE = [0.16, 1, 0.3, 1] as const;
const BASE = 0.45;

export interface EntranceRun {
  /** Resolves when the whole sequence has played (or was cancelled). */
  done: Promise<void>;
  /** Stops everything and leaves the hero in its finished state. */
  cancel: () => void;
}

interface Plan {
  root: HTMLElement;
  count: MotionValue<number>;
  archive: number;
  /** The portrait's dots, when they are ready: they bring themselves in. Without them the photograph is wiped up. */
  develop?: PortraitDots["develop"] | null;
}

type Css = Partial<CSSStyleDeclaration>;

export function runEntrance({ root, count, archive, develop }: Plan): EntranceRun {
  const q = (selector: string) => Array.from(root.querySelectorAll<HTMLElement>(selector));
  const html = root.ownerDocument.documentElement;

  const ticks = q(".hx-tick");
  const ruler = q(".hx-ruler i");
  const rule = q(".hx-kicker .eyebrow-rule");
  const kickerText = q(".hx-kicker > span");
  const line1 = q('.hx-line[data-line="0"] .hx-ch');
  const line2 = q('.hx-line[data-line="1"] .hx-ch');
  const stop = q(".hx-stop");
  const ping = q(".hx-ping");
  const lede = q(".hx-lede");
  const buttons = q(".hx-btn");
  // With the dots in place the <img> is hidden and the canvas starts empty; otherwise the photograph itself is wiped up.
  const dotted = !!develop && !!root.querySelector(".hx-portrait[data-dots]");
  const portrait = dotted ? [] : q(".hx-portrait-in");
  const photo = dotted ? [] : q(".hx-photo");
  const cells = q(".hx-cell");
  const cue = q(".hx-cue");
  const hair = q(".hx-hair");
  const orbit = q(".hx-orbit");
  const guides = q(".hx-guide");
  const guideLabels = q(".hx-guide-label");
  const margin = q(".hx-margin");

  const touched: HTMLElement[] = [];
  const hide = (els: HTMLElement[], css: Css) =>
    els.forEach((el) => {
      Object.assign(el.style, css);
      touched.push(el);
    });

  // The hidden state, as inline style, before the CSS that hides everything is released.
  hide(ticks, { opacity: "0", transform: "scale(0.5)" });
  hide(ruler, { opacity: "0", transform: "scaleX(0)" });
  hide(rule, { transform: "scaleX(0)", transformOrigin: "left center" });
  hide(kickerText, { opacity: "0", transform: "translateX(-8px)" });
  hide([...line1, ...line2], { transform: "translateY(110%)" });
  hide(stop, { transform: "translateY(-140%)" });
  hide(lede, { opacity: "0", transform: "translateY(16px)" });
  hide(buttons, { opacity: "0", transform: "translateY(14px)" });
  hide(portrait, { clipPath: "inset(100% 0% 0% 0%)" });
  hide(photo, { transform: "scale(1.14)" });
  hide(cells, { opacity: "0", transform: "translateY(10px)" });
  hide(cue, { opacity: "0" });
  hide(hair, { transform: "scaleX(0)" });
  hide(orbit, { opacity: "0" });
  hide(guides, { transform: "scaleX(0)", transformOrigin: "left center" });
  hide(guideLabels, { opacity: "0" });
  hide(margin, { transform: "scaleY(0)", transformOrigin: "top center" });
  count.set(0);
  html.setAttribute("data-hero", "go");

  const controls: AnimationPlaybackControls[] = [];
  const play = (c: AnimationPlaybackControls) => {
    controls.push(c);
    return c;
  };
  const at = (seconds: number) => BASE + seconds;

  play(animate(ticks, { opacity: [0, 1], scale: [0.5, 1] }, { duration: 0.7, ease: EASE, delay: stagger(0.06, { startDelay: at(0) }) }));
  play(animate(rule, { scaleX: [0, 1] }, { duration: 0.6, ease: EASE, delay: at(0.1) }));
  play(animate(kickerText, { opacity: [0, 1], x: [-8, 0] }, { duration: 0.6, ease: EASE, delay: stagger(0.08, { startDelay: at(0.2) }) }));

  play(animate(line1, { y: ["110%", "0%"] }, { duration: 0.9, ease: EASE, delay: stagger(0.028, { startDelay: at(0.65) }) }));
  play(animate(line2, { y: ["110%", "0%"] }, { duration: 0.9, ease: EASE, delay: stagger(0.028, { startDelay: at(0.77) }) }));
  // A spring takes two keyframes only: "from" and "to".
  play(animate(stop, { y: ["-140%", "0%"] }, { type: "spring", stiffness: 240, damping: 13, delay: at(1.05) }));

  play(animate(lede, { opacity: [0, 1], y: [16, 0] }, { duration: 0.7, ease: EASE, delay: at(1.05) }));
  play(animate(buttons, { opacity: [0, 1], y: [14, 0] }, { duration: 0.7, ease: EASE, delay: stagger(0.09, { startDelay: at(1.25) }) }));

  if (dotted && develop) {
    play(develop(at(1.35)));
  } else {
    play(animate(portrait, { clipPath: ["inset(100% 0% 0% 0%)", "inset(0% 0% 0% 0%)"] }, { duration: 1.1, ease: EASE, delay: at(1.35) }));
    play(animate(photo, { scale: [1.14, 1] }, { duration: 1.4, ease: EASE, delay: at(1.35) }));
  }

  play(animate(cells, { opacity: [0, 1], y: [10, 0] }, { duration: 0.7, ease: EASE, delay: stagger(0.08, { startDelay: at(1.45) }) }));
  play(animate(count, archive, { duration: 1.1, ease: EASE, delay: at(1.45) }));

  play(animate(ruler, { opacity: [0, 1], scaleX: [0, 1] }, { duration: 0.5, ease: EASE, delay: stagger(0.022, { startDelay: at(1.65), from: "center" }) }));
  play(animate(hair, { scaleX: [0, 1] }, { duration: 1.3, ease: EASE, delay: at(0.3) }));
  // The sheet is drawn: the margin runs down, then each guide runs across from the left.
  play(animate(margin, { scaleY: [0, 1] }, { duration: 1.2, ease: EASE, delay: at(0.5) }));
  play(animate(guides, { scaleX: [0, 1] }, { duration: 1.4, ease: EASE, delay: stagger(0.12, { startDelay: at(0.85) }) }));
  play(animate(guideLabels, { opacity: [0, 1] }, { duration: 0.6, ease: "easeOut", delay: stagger(0.1, { startDelay: at(1.7) }) }));
  // The rings come in last and slowest: they are the background to everything above.
  play(animate(orbit, { opacity: [0, 1] }, { duration: 2.2, ease: "easeOut", delay: at(1.2) }));
  play(animate(cue, { opacity: [0, 1] }, { duration: 0.7, ease: "easeOut", delay: at(1.95) }));

  let finished = false;
  const settle = () => {
    if (finished) return;
    finished = true;
    touched.forEach((el) => {
      el.style.removeProperty("opacity");
      el.style.removeProperty("transform");
      el.style.removeProperty("clip-path");
      el.style.removeProperty("transform-origin");
    });
    count.set(archive);
    html.removeAttribute("data-hero");
  };

  const done = Promise.all(controls.map((c) => c.finished.catch(() => undefined))).then(() => {
    const wasCancelled = finished;
    settle();
    // The last beat: the beacon lights once.
    if (!wasCancelled) {
      ping.forEach((el) => {
        animate(el, { opacity: [0.6, 0], scale: [0.7, 3.4] }, { duration: 1.2, ease: EASE });
      });
    }
  });

  return {
    done,
    cancel: () => {
      controls.forEach((c) => c.stop());
      settle();
    },
  };
}
