"use client";
import { useEffect, type RefObject } from "react";
import * as m from "motion/react-m";
import { useMotionValue, useScroll, useSpring, useTransform, useVelocity } from "motion/react";
import { SkyStars } from "../ascentSky";
import { useCalm, useHydrated } from "./hooks";

/** The few stars that get a visible cross. Hand placed: a flare is only worth drawing where nothing competes. [x%, y%, arm px] */
const GLINTS: Array<[number, number, number]> = [
  [7.5, 19, 30],
  [61, 11, 22],
  [90, 63, 26],
  [31, 88, 18],
  [45, 34, 15],
];

/**
 * The sky behind the deck, with depth.
 *
 * Three star layers and two planets sit at different distances. Three things move
 * them, and every one is a transform on a layer that is already composited, so none
 * of it repaints:
 *
 *   scroll    each layer slides by an amount proportional to how close it is, so the
 *             near stars pass the far ones as the page goes by;
 *   pointer   the layers lean a few pixels against the cursor, near ones most;
 *   velocity  throw the page and the stars stretch into streaks, near ones most,
 *             then relax when it settles. Gated to the section being on screen, so
 *             scrolling anywhere else on the page does not write to it.
 *
 * With reduced motion, Lite, or a struggling device only what is cheap remains.
 */
export default function HiwSky({ sectionRef }: { sectionRef: RefObject<HTMLElement | null> }) {
  const { calm, rich } = useCalm();

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const yFar = useTransform(scrollYProgress, [0, 1], [16, -16]);
  const yMid = useTransform(scrollYProgress, [0, 1], [46, -46]);
  const yNear = useTransform(scrollYProgress, [0, 1], [96, -96]);
  const yOrbA = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const yOrbB = useTransform(scrollYProgress, [0, 1], [-90, 90]);

  // ── Warp: page velocity, smoothed, only while the section is on screen ──
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { stiffness: 90, damping: 26 });
  const visible = useMotionValue(0);
  const heat = useTransform([velocity, visible], ([v, vis]: number[]) => (vis ? Math.min(1, Math.abs(v) / 3200) : 0));
  const warpFar = useTransform(heat, (h) => 1 + h * 0.25);
  const warpMid = useTransform(heat, (h) => 1 + h * 0.8);
  const warpNear = useTransform(heat, (h) => 1 + h * 1.9);

  // ── Pointer: -1..1 across the section, sprung ──
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 60, damping: 18 });
  const sy = useSpring(py, { stiffness: 60, damping: 18 });
  const xFar = useTransform(sx, (v) => v * -4);
  const xMid = useTransform(sx, (v) => v * -11);
  const xNear = useTransform(sx, (v) => v * -24);
  const yPFar = useTransform(sy, (v) => v * -3);
  const yPMid = useTransform(sy, (v) => v * -8);
  const yPNear = useTransform(sy, (v) => v * -18);
  // Scroll and pointer offsets add: one transform per layer.
  const yFarT = useTransform([yFar, yPFar], ([a, b]: number[]) => a + b);
  const yMidT = useTransform([yMid, yPMid], ([a, b]: number[]) => a + b);
  const yNearT = useTransform([yNear, yPNear], ([a, b]: number[]) => a + b);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const io = new IntersectionObserver(([entry]) => visible.set(entry.isIntersecting ? 1 : 0), { rootMargin: "80px 0px" });
    io.observe(section);

    let onMove: ((e: PointerEvent) => void) | null = null;
    if (rich && window.matchMedia("(hover: hover)").matches) {
      onMove = (e) => {
        if (!visible.get()) return;
        const r = section.getBoundingClientRect();
        px.set(((e.clientX - r.left) / r.width) * 2 - 1);
        py.set(((e.clientY - r.top) / r.height) * 2 - 1);
      };
      window.addEventListener("pointermove", onMove, { passive: true });
    }
    return () => {
      io.disconnect();
      if (onMove) window.removeEventListener("pointermove", onMove);
    };
  }, [sectionRef, rich, visible, px, py]);

  // No inline transforms in the server's HTML: a reduced-motion or Lite visitor would be left with the
  // sky frozen at its start offsets. They are written once the page is live, and only if it is not calm.
  const hydrated = useHydrated();
  const live = !calm && hydrated;

  return (
    <div className="hiw-sky" aria-hidden="true">
      <m.div className="hiw-layer hiw-layer-far" style={live ? { y: yFarT, x: rich ? xFar : 0, scaleY: rich ? warpFar : 1 } : undefined}>
        <SkyStars layer="dust" />
      </m.div>
      <m.div className="hiw-layer hiw-layer-mid" style={live ? { y: yMidT, x: rich ? xMid : 0, scaleY: rich ? warpMid : 1 } : undefined}>
        <SkyStars layer="mid" />
      </m.div>
      <m.div className="hiw-layer hiw-layer-near" style={live ? { y: yNearT, x: rich ? xNear : 0, scaleY: rich ? warpNear : 1 } : undefined}>
        <SkyStars layer="big" />
        {GLINTS.map((g, i) => (
          <i
            key={i}
            className="hiw-glint"
            style={{ ["--gx" as string]: `${g[0]}%`, ["--gy" as string]: `${g[1]}%`, ["--reach" as string]: `${g[2]}px` }}
          />
        ))}
      </m.div>

      {/* The two planets: orb-a top right, orb-b left with a glowing crescent rim. */}
      <m.i className="hiw-orb hiw-orb-a" style={live ? { y: yOrbA } : undefined} />
      <m.i className="hiw-orb hiw-orb-b" style={live ? { y: yOrbB } : undefined} />
    </div>
  );
}
