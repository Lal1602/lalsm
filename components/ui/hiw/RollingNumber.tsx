"use client";
import * as m from "motion/react-m";
import { useTransform, type MotionValue } from "motion/react";
import { rollPosition } from "@/lib/flight/odometer";

/**
 * A number that reads like a mechanical odometer: each place is a column of the
 * digits 0-9 that slides, so 39 rolls into 40 rather than swapping. It is driven by
 * a motion value, so counting costs transforms and no React renders.
 *
 * The column carries an extra 0 at the bottom: rolling from 9 to 0 slides onto it,
 * and when the value wraps the column jumps back to the first 0, which is the same
 * glyph in the same place, so there is no visible seam.
 */

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

function Place({ value, place, hideLeadingZero }: { value: MotionValue<number>; place: number; hideLeadingZero: boolean }) {
  const y = useTransform(value, (v) => `${-rollPosition(v, place)}em`);
  const opacity = useTransform(value, (v) => (hideLeadingZero && Math.max(0, v) < place ? 0 : 1));
  return (
    <m.span className="fd-roll-place" inherit={false} style={{ opacity }} aria-hidden="true">
      <m.span className="fd-roll-col" inherit={false} style={{ y }}>
        {DIGITS.map((d, i) => (
          <i key={i}>{d}</i>
        ))}
      </m.span>
    </m.span>
  );
}

export default function RollingNumber({
  value,
  places = 3,
  label,
}: {
  value: MotionValue<number>;
  places?: number;
  /** Spoken value for screen readers (the columns themselves are hidden from them). */
  label?: string;
}) {
  const cols = Array.from({ length: places }, (_, i) => 10 ** (places - 1 - i));
  return (
    <span className="fd-roll" role={label ? "img" : undefined} aria-label={label}>
      {cols.map((p, i) => (
        <Place key={p} value={value} place={p} hideLeadingZero={i < places - 1} />
      ))}
    </span>
  );
}
