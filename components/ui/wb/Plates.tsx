"use client";
import { memo, useEffect, useMemo, useRef, type PointerEvent } from "react";
import * as m from "motion/react-m";
import { animate, motionValue, useSpring, useTransform, type MotionValue } from "motion/react";
import { BAYS } from "@/lib/build/stack";
import { ISO_MATRIX, PLATE_H, S, STAGE_H, W, baseTops, collapsedOffsets, offsets, plateFaces, poleEnds } from "@/lib/build/iso";
import { FEATURES } from "./features";

/**
 * The exploded view: the three disciplines as three plates, one above the other, tied by wires.
 *
 * The plate that is being inspected rises and the plates above it open upward, which is what uncovers it (in a
 * view like this a plate is hidden by the one above it). That, the entrance (the plates come out of a stack) and the
 * pointer's small parallax are the only things that move on a spring, and every one of them is a transform on a
 * plate's own element: three composited layers moved from JS with no React render in between. What moves inside a
 * plate (a curve being ridden, containers lighting, a ship dodging) is CSS, only on the active plate, only on screen,
 * and only on a device that is not struggling (the quality governor's two best tiers): the rest keeps the plates, the
 * pointing and the picking, and loses the idle motion.
 *
 * It holds no text: the names are in the legend beside it. A plate is sized in percent of the stage, so the whole
 * thing scales with CSS alone.
 */

export type Phase = "ready" | "armed" | "in";

interface Props {
  active: number;
  hot: string | null;
  phase: Phase;
  run: boolean;
  calm: boolean;
  rich: boolean;
  onPick: (i: number) => void;
  onHot: (id: string | null) => void;
}

const COUNT = BAYS.length;
const TOPS = baseTops(COUNT);
const FACES = plateFaces();
const GRID = Array.from({ length: 9 }, (_, i) => {
  const v = (i + 1) * 22;
  return `M${v} 0V${S}M0 ${v}H${S}`;
}).join("");
const POLE_X = [62, W - 62] as const;
const SPRING = { type: "spring", stiffness: 130, damping: 19, mass: 0.9 } as const;

const Plate = memo(function Plate({
  i,
  y,
  px,
  py,
  active,
  hot,
  onPick,
  onHot,
}: {
  i: number;
  y: MotionValue<number>;
  px: MotionValue<number>;
  py: MotionValue<number>;
  active: boolean;
  hot: string | null;
  onPick: (i: number) => void;
  onHot: (id: string | null) => void;
}) {
  const bay = BAYS[i]!;
  // Nearer plates (lower on the stack) move more with the pointer: the stack has depth.
  const depth = 3 + i * 3;
  const ty = useTransform([y, py], ([a, b]) => `${(((a as number) + (b as number) * depth * 0.6) / PLATE_H) * 100}%`);
  const tx = useTransform(px, (v) => v * depth);

  return (
    <m.div
      className="wb-plate"
      data-active={active}
      data-lit={hot !== null || undefined}
      data-tone={bay.tone}
      aria-hidden="true"
      style={{ top: `${(TOPS[i]! / STAGE_H) * 100}%`, x: tx, y: ty }}
      onClick={() => onPick(i)}
    >
      <svg viewBox={`0 0 ${W} ${PLATE_H}`} focusable="false">
        <g className="wb-plate-in">
          <polygon points={FACES.leftEdge} className="wb-edge" />
          <polygon points={FACES.rightEdge} className="wb-edge wb-edge-r" />
          <polygon points={FACES.top} className="wb-face" />
          <g transform={ISO_MATRIX}>
            <path d={GRID} className="wb-grid" />
            <rect x="8" y="8" width={S - 16} height={S - 16} className="wb-frame" />
            {bay.tools.map((tool, k) => {
              const f = FEATURES[tool.id];
              if (!f) return null;
              return (
                <g
                  key={tool.id}
                  className="wb-ft"
                  data-tool={tool.id}
                  data-hot={hot === tool.id || undefined}
                  transform={`translate(${f.at[0]} ${f.at[1]}) scale(1.2)`}
                  style={{ ["--k" as string]: k }}
                  onPointerEnter={(e) => active && e.pointerType === "mouse" && onHot(tool.id)}
                  onPointerLeave={(e) => active && e.pointerType === "mouse" && onHot(null)}
                  onClick={(e) => {
                    if (!active) return;
                    e.stopPropagation();
                    // A mouse has hover. A touch screen has none: a tap on a mark holds it lit, and a second tap lets go.
                    if ((e.nativeEvent as unknown as { pointerType?: string }).pointerType === "mouse") return;
                    onHot(hot === tool.id ? null : tool.id);
                  }}
                >
                  <g className="wb-ft-in">
                    <circle r="26" className="wb-hit" />
                    {f.draw}
                    <circle cx="-27" cy="-27" r="2.2" className="wb-pin" />
                    <circle cx="-27" cy="-27" r="2.2" className="wb-pin-ring" />
                  </g>
                </g>
              );
            })}
          </g>
        </g>
      </svg>
    </m.div>
  );
});

/** A wire between two plates, ending on the one above and the one below wherever they are. */
function Pole({ x, upper, ys }: { x: number; upper: number; ys: MotionValue<number>[] }) {
  const a = ys[upper]!;
  const b = ys[upper + 1]!;
  const span = (u: number, l: number) => poleEnds(x, TOPS[upper]! + u, TOPS[upper + 1]! + l);
  // The wire is 100 units tall at rest, placed and stretched with transforms (percent of its own height = units).
  const top = useTransform([a, b], ([u, l]) => `${span(u as number, l as number)[0]}%`);
  const stretch = useTransform([a, b], ([u, l]) => {
    const [p, q] = span(u as number, l as number);
    return Math.max(0, q - p) / 100;
  });
  return (
    <m.i className="wb-pole" aria-hidden="true" style={{ left: `${(x / W) * 100}%`, y: top, scaleY: stretch, originY: 0 }}>
      <b />
    </m.i>
  );
}

export default function Plates({ active, hot, phase, run, calm, rich, onPick, onHot }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const ys = useMemo(() => offsets(COUNT, 0).map((v) => motionValue(v)), []);
  const px = useSpring(0, { stiffness: 90, damping: 18, mass: 0.6 });
  const py = useSpring(0, { stiffness: 90, damping: 18, mass: 0.6 });
  const was = useRef<Phase>(phase);

  // Where each plate is going: out of the stack when the stage opens, then up and down as the inspected plate changes.
  useEffect(() => {
    const entering = was.current === "armed" && phase === "in";
    was.current = phase;
    const target = phase === "armed" ? collapsedOffsets(COUNT) : offsets(COUNT, active);
    const controls = ys.map((mv, i) => {
      const to = target[i]!;
      if (calm || phase === "armed") {
        mv.set(to);
        return null;
      }
      return animate(mv, to, { ...SPRING, delay: entering ? i * 0.11 : 0 });
    });
    return () => controls.forEach((c) => c?.stop());
  }, [active, phase, calm, ys]);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!rich || calm || e.pointerType === "touch") return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    px.set(((e.clientX - r.left) / r.width) * 2 - 1);
    py.set(((e.clientY - r.top) / r.height) * 2 - 1);
  };
  const onLeave = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <div
      ref={ref}
      className="wb-canvas"
      data-phase={phase}
      data-run={run && rich && !calm ? "" : undefined}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      role="img"
      aria-label="An exploded view of three plates, one for each discipline: the interface, the services and the runtime."
    >
      {Array.from({ length: COUNT - 1 }, (_, g) => POLE_X.map((x) => <Pole key={`${g}-${x}`} x={x} upper={g} ys={ys} />))}
      {/* Painted from the bottom up: a plate hides the one below it, not the one above. */}
      {Array.from({ length: COUNT }, (_, k) => COUNT - 1 - k).map((i) => (
        <Plate key={i} i={i} y={ys[i]!} px={px} py={py} active={active === i} hot={active === i ? hot : null} onPick={onPick} onHot={onHot} />
      ))}
    </div>
  );
}
