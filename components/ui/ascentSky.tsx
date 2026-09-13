/**
 * ascentSky — the static art for the "How I Work" orbital deck.
 *
 * Everything exported here is drawn once and never animates. This page's frame
 * budget is spent on compositing, not JavaScript, so the sky is a painted layer
 * rather than a canvas: no rAF, no per-tick texture upload, and no blur or
 * backdrop-filter anywhere in the section. What moves — the packet, the drift,
 * the stations on hover — is a handful of <i> elements sitting on top of this
 * art and transformed on the compositor.
 *
 * The starfield comes from a seeded LCG rather than Math.random(). The module
 * runs once on the server and once in the browser, so a deterministic sequence
 * is what makes both emit identical markup; coordinates are rounded on the way
 * into the array because an unrounded float can serialise differently between
 * two runtimes and reintroduce the mismatch the seed exists to prevent.
 *
 * Every class here is prefixed `hiw-`. This stylesheet is 9,000 lines deep and
 * already owns .card-num, .cv-card-desc, .marquee-card-meta and friends, and a
 * plain .card-num further down the file silently won on source order and shrank
 * the stage numerals to 0.72rem. The prefix is the fix, not a convention.
 */

import type { ReactElement } from "react";

/* ── The orbit ──────────────────────────────────────────────────────────────
   Two separate things, because that is what the reference actually draws:

     1. an orbital PLANE — one long hairline straight across the band, which is
        what the four stations sit on, so they stay level with each other and
        with the row of cards beneath them; and
     2. an orbital RING — a single ellipse seen almost edge-on, overlapping the
        right-hand half of that plane.

   An earlier version tried to make one bowed ellipse do both jobs. It cannot:
   any ellipse wide enough to hold four level stations is too flat to read as an
   orbit, and any ellipse curved enough to read as one drags its outer stations
   visibly off the line. Splitting them buys both properties at once. */

export const ORBIT_VIEWBOX = "0 0 1000 150";

/** Height of the plane inside the band, as a share of it. */
export const PLANE_Y = 62;

/* The ring sits over the right of the plane and crosses it at its two vertices,
   which is what makes it read as a ring lying IN the plane rather than as a
   shape floating above it. */
export const RING = { cx: 560, cy: PLANE_Y, rx: 306, ry: 47 };

/* ── The stations ───────────────────────────────────────────────────────────
   The cards are a grid with a fixed gap, so a card centre is not at a clean
   eighth of the row: the gaps push the outer cards outward and pull the inner
   ones in. Solving it gives a percentage plus a fixed pixel nudge, exact at
   every width instead of only at the one it was eyeballed at.

     centre(i) = W·(2i+1)/8 + gap·(i/4 − 3/8)

   Kept in step with the gap in .hiw-cards. */

const CARD_GAP = 13;

export type Station = { x: number; nudge: number };

export const STATIONS: Station[] = [12.5, 37.5, 62.5, 87.5].map((x, i) => ({
  x,
  nudge: Math.round(CARD_GAP * (i / 4 - 3 / 8) * 100) / 100,
}));

/** Where the trajectory leaves — just past the ring's right vertex. */
export const ORBIT_END = { x: 97.5, nudge: 0 };

/* ── Seeded randomness ──────────────────────────────────────────────────── */

function makeRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const round = (n: number, p: number) => Math.round(n * p) / p;

/* ── The starfield ──────────────────────────────────────────────────────────
   The viewBox is the load-bearing decision here. A 100×100 box sliced to fill a
   1466px-wide section scales by ~29×, which turned r="0.385" into an 11px blob
   — the field read as polka dots rather than as stars. A box sized near the
   band's real pixel dimensions keeps the scale close to 1, so a radius written
   as 0.8 lands on screen at roughly 0.8px and the field reads as depth. */

const STAR_BOX_W = 1600;
const STAR_BOX_H = 640;
const STAR_COUNT = 520;

type Star = { x: number; y: number; r: number; o: number; tint: number };

const STARS: Star[] = (() => {
  const rand = makeRandom(0x9e3779b9);
  const out: Star[] = [];

  for (let i = 0; i < STAR_COUNT; i += 1) {
    const roll = rand();
    // A field where every star carries the same weight reads as noise. Almost
    // all of these are dust; the handful of big ones do the actual work.
    const big = roll > 0.965;
    const mid = !big && roll > 0.82;

    const starY = round(rand() * STAR_BOX_H, 10);
    // Never place stars near the bottom edge where the section meets the seam
    if (starY > 575) continue;

    out.push({
      x: round(rand() * STAR_BOX_W, 10),
      y: starY,
      r: round(big ? 1.5 + rand() * 1.1 : mid ? 0.85 + rand() * 0.45 : 0.34 + rand() * 0.42, 100),
      o: round(big ? 0.78 + rand() * 0.22 : mid ? 0.42 + rand() * 0.36 : 0.12 + rand() * 0.42, 100),
      // Real skies are not monochrome. A few stars lean warm, a few lean cold.
      tint: rand() < 0.16 ? (rand() < 0.5 ? 1 : 2) : 0,
    });
  }
  return out;
})();

const TINT_CLASS = ["hiw-star", "hiw-star is-warm", "hiw-star is-cold"];

export function SkyStars(): ReactElement {
  return (
    <svg
      className="hiw-stars"
      viewBox={`0 0 ${STAR_BOX_W} ${STAR_BOX_H}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      {STARS.map((s, i) => (
        <circle key={i} className={TINT_CLASS[s.tint]} cx={s.x} cy={s.y} r={s.r} opacity={s.o} />
      ))}
    </svg>
  );
}

/* ── The nebula ─────────────────────────────────────────────────────────────
   A diagonal band of cloud running from the lower left up to the right, the way
   the Milky Way sits in the reference. Each cloud is one <i> with an elliptical
   radial gradient and its own rotation, and it costs one paint rather than a
   filter.

   Two failure modes were worked through to land on these numbers. Too few and
   too faint, and the band is a smooth purple wash with no structure. Too many
   at high alpha and each ellipse becomes legible as an ellipse — the sky turned
   into a pile of overlapping lozenges. What fixes it is spread rather than
   count: no two clouds here share a size band, a rotation within 20 degrees, or
   a centre within 12% of each other, so no repeat is available to read as a
   pattern. The gradient in .hiw-cloud carries the rest, feathering to nothing
   by 88% so an edge never lands anywhere the eye can catch it.

   [x%, y%, w%, h%, rotation, colour, inner alpha] */

export type Cloud = [number, number, number, number, number, string, number];

export const CLOUDS: Cloud[] = [
  // Three broad washes place the band and nothing else.
  [18, 80, 78, 54, -27, "116, 170, 204", 0.15],
  [37, 42, 82, 52, -14, "92, 104, 196", 0.15],
  [69, 60, 74, 46, 14, "170, 108, 74", 0.13],

  // Mid scale: the body of the cloud. Rotations deliberately far apart.
  [13, 88, 40, 24, -52, "182, 226, 234", 0.2],
  [26, 62, 34, 30, 8, "112, 170, 214", 0.19],
  [22, 28, 38, 22, -38, "138, 172, 248", 0.17],
  [45, 34, 30, 26, 34, "120, 96, 208", 0.17],
  [58, 70, 36, 22, -8, "208, 132, 84", 0.19],
  [78, 46, 32, 26, 26, "150, 128, 206", 0.14],
  [48, 88, 34, 20, -20, "84, 172, 194", 0.18],

  // A few small hot knots. These are the only places the band is really lit.
  [10, 92, 18, 14, -64, "214, 242, 246", 0.3],
  [31, 16, 15, 19, 48, "158, 188, 255", 0.22],
  [64, 54, 16, 12, 4, "236, 172, 110", 0.26],
  [88, 80, 17, 13, -44, "112, 146, 216", 0.16],
];

/* ── The constellation ──────────────────────────────────────────────────────
   Placed by hand, not generated: it has to lean up and to the right out of the
   eyebrow without ever crossing the title, and a random walk cannot promise
   that.

   pathLength is the same trick techMarks.tsx uses — it lets one dashoffset of 1
   draw a stroke of any real length without anyone measuring it. */

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

/* ── Planet Submersion Nebula ──────────────────────────────────────────────
   Drawn specifically over and around the lower perimeter of orb-b on the
   bottom-left so the planet naturally submerges into dense cosmic fog
   without any straight horizontal cut. */
export const PLANET_SUBMERSION_CLOUDS: Cloud[] = [
  // Deep Indigo base smoke hugging the planet's lower limb
  [2, 84, 54, 40, -22, "79, 70, 229", 0.38],
  // Rich Royal Purple plume billowing across the bottom-left
  [-4, 91, 58, 44, 18, "147, 51, 234", 0.42],
  // Vibrant Electric Magenta tendril rising across the terminator
  [14, 88, 46, 34, -34, "217, 70, 239", 0.36],
  // Cosmic Cyan starlight reflection wrapping the planet
  [7, 78, 40, 30, 14, "56, 189, 248", 0.3],
  // Lavender / Indigo mist smoothing into the middle
  [20, 94, 48, 36, -12, "129, 140, 248", 0.34],
  // Hot magenta core puff
  [6, 92, 24, 18, -48, "236, 72, 153", 0.45],
];

/* ── Seam Nebula Bridge ───────────────────────────────────────────────────
   Voluminous cosmic nebula band sweeping continuously across the entire
   bottom junction between HIW and Horizon Showcase (Creative Playground). */
export const SEAM_NEBULA_CLOUDS: Cloud[] = [
  // Center-left violet/purple cloud
  [34, 92, 60, 38, -8, "139, 92, 246", 0.32],
  // Center magenta/fuchsia cloud
  [50, 96, 54, 36, 12, "192, 38, 211", 0.3],
  // Center-right deep cosmic blue
  [66, 90, 58, 40, -16, "59, 130, 246", 0.3],
  // Right purple/indigo cloud
  [82, 94, 52, 34, 22, "168, 85, 247", 0.28],
  // Far-right cyan starlight puff
  [96, 88, 44, 30, -25, "56, 189, 248", 0.24],
  // Luminous hot knots
  [28, 89, 22, 16, 28, "167, 139, 250", 0.38],
  [58, 94, 24, 16, -10, "96, 165, 250", 0.36],
  [76, 91, 20, 14, 15, "217, 70, 239", 0.34],
];
