/**
 * The trajectory the ship flies, as pure maths.
 *
 * The map is a fixed 1000 x 150 box that the page scales uniformly, so a point
 * here is the same fraction of the map at every width and angles never distort.
 * The route is a smooth curve (a Catmull-Rom spline turned into cubic Béziers)
 * through the launch pad, the four stations and an exit beyond the last one,
 * because launch is not the end of the work.
 *
 * Everything the page needs is derived from one sampled table of the curve:
 *   - `pointAt(u)`   where the ship is for a progress `u` (0..1 by ARC LENGTH, which
 *                    is also what an SVG `pathLength` of 1 means, so the lit trail
 *                    behind the ship lines up with it exactly);
 *   - `STATION_U`    the progress at which each station sits;
 *   - `uAtX(x)`      the inverse along x, for dragging the ship;
 *   - `nearestStation(u)`.
 * No DOM is touched, so it is identical on the server and the client.
 */

export const MAP_W = 1000;
export const MAP_H = 150;

type Pt = [number, number];

const LAUNCH_PAD: Pt = [0, 138];
/** Stations sit at the centres of four equal columns, so each is above its bay. */
export const STATION_PTS: Pt[] = [
  [125, 112],
  [375, 63],
  [625, 87],
  [875, 45],
];
const EXIT: Pt = [1000, 17];

const ROUTE: Pt[] = [LAUNCH_PAD, ...STATION_PTS, EXIT];

/** Cubic Bézier control points for each segment of the route (uniform Catmull-Rom). */
function segments(): Array<[Pt, Pt, Pt, Pt]> {
  const out: Array<[Pt, Pt, Pt, Pt]> = [];
  for (let i = 0; i < ROUTE.length - 1; i++) {
    const p0 = ROUTE[Math.max(0, i - 1)]!;
    const p1 = ROUTE[i]!;
    const p2 = ROUTE[i + 1]!;
    const p3 = ROUTE[Math.min(ROUTE.length - 1, i + 2)]!;
    out.push([
      p1,
      [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6],
      [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6],
      p2,
    ]);
  }
  return out;
}

const SEGMENTS = segments();

const r2 = (n: number) => Math.round(n * 100) / 100;

/** The route as an SVG path, in map units. */
export const PATH_D = (() => {
  let d = `M ${r2(SEGMENTS[0]![0][0])} ${r2(SEGMENTS[0]![0][1])}`;
  for (const [, c1, c2, p2] of SEGMENTS) {
    d += ` C ${r2(c1[0])} ${r2(c1[1])}, ${r2(c2[0])} ${r2(c2[1])}, ${r2(p2[0])} ${r2(p2[1])}`;
  }
  return d;
})();

const bezier = (s: [Pt, Pt, Pt, Pt], t: number): Pt => {
  const k = 1 - t;
  const a = k * k * k;
  const b = 3 * k * k * t;
  const c = 3 * k * t * t;
  const d = t * t * t;
  return [
    a * s[0][0] + b * s[1][0] + c * s[2][0] + d * s[3][0],
    a * s[0][1] + b * s[1][1] + c * s[2][1] + d * s[3][1],
  ];
};

const STEPS = 90;

/** Sample table: positions, and the cumulative length at each. */
const XS: number[] = [];
const YS: number[] = [];
const LEN: number[] = [];
/** Index in the table where each segment ends (so where each station / the exit is). */
const SEG_END: number[] = [];

(() => {
  let total = 0;
  SEGMENTS.forEach((seg, si) => {
    for (let k = si === 0 ? 0 : 1; k <= STEPS; k++) {
      const [x, y] = bezier(seg, k / STEPS);
      if (XS.length) total += Math.hypot(x - XS[XS.length - 1]!, y - YS[YS.length - 1]!);
      XS.push(x);
      YS.push(y);
      LEN.push(total);
    }
    SEG_END.push(XS.length - 1);
  });
})();

export const PATH_LENGTH = LEN[LEN.length - 1]!;

/** Progress (0..1 by arc length) at which each station sits. */
export const STATION_U: number[] = SEG_END.slice(0, STATION_PTS.length).map((i) => LEN[i]! / PATH_LENGTH);

/** Clamps to 0..1; a non-finite input (an unmeasured scroll container reports NaN) is 0, so it can never reach a transform. */
const clamp01 = (n: number) => (Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0);

/** Index of the last sample at or before length `len`. */
function indexForLength(len: number): number {
  let lo = 0;
  let hi = LEN.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (LEN[mid]! <= len) lo = mid;
    else hi = mid - 1;
  }
  return Math.min(lo, LEN.length - 2);
}

export type Pose = { x: number; y: number; /** radians, 0 = pointing right, y down */ angle: number };

export function pointAt(u: number): Pose {
  const len = clamp01(u) * PATH_LENGTH;
  const i = indexForLength(len);
  const span = LEN[i + 1]! - LEN[i]! || 1;
  const t = (len - LEN[i]!) / span;
  const x = XS[i]! + (XS[i + 1]! - XS[i]!) * t;
  const y = YS[i]! + (YS[i + 1]! - YS[i]!) * t;
  // Heading from a short window either side, so the nose does not jitter at a sample joint.
  const a = Math.max(0, i - 2);
  const b = Math.min(XS.length - 1, i + 3);
  return { x, y, angle: Math.atan2(YS[b]! - YS[a]!, XS[b]! - XS[a]!) };
}

/** The progress whose point is at map x (the route only ever moves right). */
export function uAtX(x: number): number {
  const target = Math.min(MAP_W, Math.max(0, x));
  let lo = 0;
  let hi = XS.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (XS[mid]! <= target) lo = mid;
    else hi = mid;
  }
  const dx = XS[hi]! - XS[lo]! || 1;
  const t = (target - XS[lo]!) / dx;
  return clamp01((LEN[lo]! + (LEN[hi]! - LEN[lo]!) * t) / PATH_LENGTH);
}

/** Index of the station nearest to progress `u`. */
export function nearestStation(u: number): number {
  let best = 0;
  let bestD = Infinity;
  STATION_U.forEach((s, i) => {
    const d = Math.abs(s - u);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  });
  return best;
}

/**
 * Station position as a fraction (0 = launch pad, 1..4 = stations) for a progress
 * `u`; between two stations it is linear in arc length. Feeds the elapsed readout.
 */
export function stagePosition(u: number): number {
  const stops = [0, ...STATION_U];
  if (u <= 0) return 0;
  for (let i = 1; i < stops.length; i++) {
    if (u <= stops[i]!) {
      const from = stops[i - 1]!;
      return i - 1 + (u - from) / (stops[i]! - from);
    }
  }
  return STATION_U.length;
}

/**
 * Where the ship is for a scroll progress through the section (0..1): from the
 * launch pad to a little past the last station. Fixed endpoints, so reaching the
 * end of the section always means reaching stage four.
 */
export function autoProgress(scroll: number): number {
  const end = Math.min(1, STATION_U[STATION_U.length - 1]! + 0.04);
  const eased = clamp01(scroll);
  return eased * end;
}
