"use client";
import * as m from "motion/react-m";
import { useMotionValue, useSpring } from "motion/react";
import type { PointerEvent } from "react";
import { MAP_H, MAP_W, STATION_PTS } from "@/lib/flight/path";
import { CUMULATIVE, STAGES, pct } from "@/lib/flight/stages";

/**
 * A waypoint on the map. A real button, so it is reachable and operable from the
 * keyboard, and a magnet: the marker leans toward the pointer as it nears, then
 * settles back on a spring when the pointer leaves.
 */
export default function Station({
  i,
  active,
  engaged,
  pulse,
  rich,
  onSelect,
}: {
  i: number;
  active: boolean;
  engaged: boolean;
  /** Changes every time this station is engaged, to replay the ping. */
  pulse: number;
  rich: boolean;
  onSelect: (i: number) => void;
}) {
  const stage = STAGES[i]!;
  const [px, py] = STATION_PTS[i]!;
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 240, damping: 16, mass: 0.6 });
  const y = useSpring(my, { stiffness: 240, damping: 16, mass: 0.6 });

  const lean = (e: PointerEvent<HTMLButtonElement>) => {
    if (!rich || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const clamp = (n: number) => Math.max(-7, Math.min(7, n));
    mx.set(clamp((e.clientX - (r.left + r.width / 2)) * 0.3));
    my.set(clamp((e.clientY - (r.top + r.height / 2)) * 0.3));
  };
  const settle = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <m.button
      type="button"
      className="fd-st"
      data-i={i}
      data-active={active || undefined}
      data-engaged={engaged || undefined}
      aria-current={active ? "step" : undefined}
      aria-label={`Stage ${stage.num}: ${stage.name}, ${stage.time}, ${pct(CUMULATIVE[i]!)} of the way through`}
      style={{
        left: `${(px / MAP_W) * 100}%`,
        top: `${(py / MAP_H) * 100}%`,
        ["--tone" as string]: `var(--stage-tone-${i})`,
        ["--tone-rgb" as string]: `var(--stage-tone-${i}-rgb)`,
        x,
        y,
      }}
      variants={{
        hidden: { opacity: 0, scale: 0.4 },
        show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 260, damping: 14, delay: 0.55 + i * 0.12 } },
      }}
      onClick={() => onSelect(i)}
      onPointerMove={lean}
      onPointerLeave={settle}
      onBlur={settle}
    >
      {pulse > 0 && <i key={pulse} className="fd-st-ping" aria-hidden="true" />}
      <i className="fd-st-bloom" aria-hidden="true" />
      <i className="fd-st-spike fd-st-spike-h" aria-hidden="true" />
      <i className="fd-st-spike fd-st-spike-v" aria-hidden="true" />
      <i className="fd-st-ring" aria-hidden="true" />
      <i className="fd-st-core" aria-hidden="true" />
      <span className="fd-st-label" aria-hidden="true">
        <b>{stage.num}</b> {stage.name}
        <i>{pct(CUMULATIVE[i]!)}</i>
      </span>
    </m.button>
  );
}
