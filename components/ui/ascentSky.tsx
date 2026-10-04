/**
 * ascentSky — the static art for the "How I Work" sky.
 *
 * The starfield is painted once, as inert SVG, and split into three layers by star
 * size (dust, mid, big). That split is what makes depth possible: the layers are
 * separate elements, so the section can slide them by different amounts as the page
 * scrolls and as the pointer moves, and stretch them by different amounts when the
 * page is thrown (see HiwSky). None of that touches the stars themselves, so after
 * the first paint they cost a composite and nothing else: no canvas, no rAF, no
 * blur and no backdrop-filter.
 *
 * The starfield comes from a seeded LCG rather than Math.random(). The module runs
 * once on the server and once in the browser, so a deterministic sequence is what
 * makes both emit identical markup; coordinates are rounded on the way into the
 * array because an unrounded float can serialise differently between two runtimes
 * and reintroduce the mismatch the seed exists to prevent.
 *
 * Every class here is prefixed `hiw-`. The stylesheet is 9,000 lines deep and a
 * plain `.card-num` further down once silently won on source order; the prefix is
 * the fix, not a convention.
 */

import type { ReactElement } from "react";

function makeRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const round = (n: number, p: number) => Math.round(n * p) / p;

/* The viewBox is the load-bearing decision. A 100x100 box sliced to fill a 1466px
   section scales by ~29x, which turned r="0.385" into an 11px blob and made the
   field read as polka dots. A box sized near the band's real pixel dimensions keeps
   the scale close to 1, so a radius written as 0.8 lands on screen at about 0.8px. */

const STAR_BOX_W = 1600;
const STAR_BOX_H = 640;
const STAR_COUNT = 520;

export type StarLayer = "dust" | "mid" | "big";

type Star = { x: number; y: number; r: number; o: number; tint: number; layer: StarLayer };

const STARS: Star[] = (() => {
  const rand = makeRandom(0x9e3779b9);
  const out: Star[] = [];

  for (let i = 0; i < STAR_COUNT; i += 1) {
    const roll = rand();
    // A field where every star carries the same weight reads as noise. Almost all
    // of these are dust; the handful of big ones do the actual work.
    const big = roll > 0.965;
    const mid = !big && roll > 0.82;

    const starY = round(rand() * STAR_BOX_H, 10);
    // Never place stars near the bottom edge where the section meets the seam.
    if (starY > 575) continue;

    out.push({
      x: round(rand() * STAR_BOX_W, 10),
      y: starY,
      r: round(big ? 1.5 + rand() * 1.1 : mid ? 0.85 + rand() * 0.45 : 0.34 + rand() * 0.42, 100),
      o: round(big ? 0.78 + rand() * 0.22 : mid ? 0.42 + rand() * 0.36 : 0.12 + rand() * 0.42, 100),
      // Real skies are not monochrome: a few stars lean warm, a few cold.
      tint: rand() < 0.16 ? (rand() < 0.5 ? 1 : 2) : 0,
      layer: big ? "big" : mid ? "mid" : "dust",
    });
  }
  return out;
})();

const TINT_CLASS = ["hiw-star", "hiw-star is-warm", "hiw-star is-cold"];

/** One layer of the starfield. `slice` fills the layer from the same box in every layer, so they register. */
export function SkyStars({ layer }: { layer: StarLayer }): ReactElement {
  return (
    <svg
      className="hiw-stars"
      viewBox={`0 0 ${STAR_BOX_W} ${STAR_BOX_H}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      {STARS.filter((s) => s.layer === layer).map((s, i) => (
        <circle key={i} className={TINT_CLASS[s.tint]} cx={s.x} cy={s.y} r={s.r} opacity={s.o} />
      ))}
    </svg>
  );
}

/* ── The constellation ──────────────────────────────────────────────────────
   Placed by hand, not generated: it has to lean up and to the right out of the
   eyebrow without ever crossing the title, and a random walk cannot promise that.

   pathLength lets one dashoffset of 1 draw a stroke of any real length without
   anyone measuring it. */

const P = { pathLength: 1 } as const;

const C_STARS: Array<[number, number, number]> = [
  [8, 40, 2.0],
  [62, 22, 1.4],
  [104, 58, 2.6],
  [150, 34, 1.5],
  [176, 96, 1.6],
  [214, 62, 3.2],
  [262, 30, 1.5],
  [236, 128, 1.7],
  [138, 140, 1.5],
  [88, 112, 1.3],
  [286, 104, 1.4],
];

export function Constellation(): ReactElement {
  return (
    <svg
      className="hiw-constellation"
      viewBox="0 0 300 170"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <polyline className="hiw-c-line" {...P} points="8,40 62,22 104,58 150,34 214,62 262,30" />
      <polyline
        className="hiw-c-line is-faint"
        {...P}
        points="104,58 88,112 138,140 176,96 214,62"
      />
      <polyline className="hiw-c-line is-faint" {...P} points="214,62 236,128 286,104" />

      {C_STARS.map(([cx, cy, r], i) => (
        <circle key={i} className="hiw-c-star" cx={cx} cy={cy} r={r} data-i={i} />
      ))}
    </svg>
  );
}
