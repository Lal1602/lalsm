/**
 * The four stages of the "How I Work" flight plan, and every number derived from
 * them. The bar on a bay, the readout on a station and the figure in the mission
 * clock are all computed from `range` here, so none of them can disagree with the
 * duration printed beside it (an earlier version carried hand-written figures that
 * summed to 128% while claiming to be a share of the whole).
 */

export type Stage = {
  num: string;
  name: string;
  desc: string;
  /** As printed. */
  time: string;
  gives: string;
  /** The range named in `time`, in `unit`. */
  range: [number, number];
  unit: "weeks" | "days";
};

export const STAGES: Stage[] = [
  {
    num: "01",
    name: "Discover",
    desc: "We agree on what we are building and why — before a single line of code exists.",
    time: "1–2 weeks",
    gives: "Brief + sitemap",
    range: [1, 2],
    unit: "weeks",
  },
  {
    num: "02",
    name: "Design",
    desc: "Rough layouts first, then the real look: colour, type, spacing, motion.",
    time: "2–3 weeks",
    gives: "Clickable design",
    range: [2, 3],
    unit: "weeks",
  },
  {
    num: "03",
    name: "Build",
    desc: "Clean, fast code. Tested on a mid-range phone, not just on my laptop.",
    time: "3–6 weeks",
    gives: "Staging site",
    range: [3, 6],
    unit: "weeks",
  },
  {
    num: "04",
    name: "Launch",
    desc: "Ship it, watch the numbers, and fix whatever real traffic turns up.",
    time: "3–5 days",
    gives: "Live + monitored",
    range: [3, 5],
    unit: "days",
  },
];

/** A stage's range in weeks, whatever unit it is printed in. */
export const weeksOf = (stage: Stage): [number, number] =>
  stage.unit === "days" ? [stage.range[0] / 7, stage.range[1] / 7] : stage.range;

/** The one real number per stage: the middle of its range, in weeks. */
export const midWeeks = (stage: Stage) => {
  const [lo, hi] = weeksOf(stage);
  return (lo + hi) / 2;
};

export const TOTAL_WEEKS = STAGES.reduce((sum, s) => sum + midWeeks(s), 0);

/** End to end, as a range in weeks (rounded outward-ish for display). */
export const TOTAL_RANGE: [number, number] = [
  STAGES.reduce((sum, s) => sum + weeksOf(s)[0], 0),
  STAGES.reduce((sum, s) => sum + weeksOf(s)[1], 0),
];

/** This stage's slice of the engagement (0..1). Drawn as the bar on its bay. */
export const SHARE = STAGES.map((s) => midWeeks(s) / TOTAL_WEEKS);

/** How far along the whole job you are when this stage ends (0..1). */
export const CUMULATIVE = STAGES.map((_, i) => {
  const done = STAGES.slice(0, i + 1).reduce((sum, s) => sum + midWeeks(s), 0);
  return done / TOTAL_WEEKS;
});

/** Elapsed share at a fractional position along the stations (0 = launch pad, 1 = stage 1, ... 4 = stage 4). */
export function elapsedAtStage(position: number): number {
  const n = STAGES.length;
  const p = Math.min(n, Math.max(0, position));
  if (p <= 1) return p * CUMULATIVE[0]!;
  const i = Math.min(n - 1, Math.floor(p) - 1);
  const from = CUMULATIVE[i]!;
  const to = CUMULATIVE[Math.min(n - 1, i + 1)]!;
  return from + (to - from) * (p - 1 - i);
}

export const pct = (n: number) => `${Math.round(n * 100)}%`;
