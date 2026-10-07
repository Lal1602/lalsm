import type { ReactNode } from "react";

/**
 * The marks on the plates: one small drawing for each tool, in plate coordinates (a flat square; the plate's matrix
 * turns it into the diamond). Each is drawn in about 48 units around its own origin, in the same hairline as the
 * rest of the site, and each says something about its tool: React is an atom, GSAP is an easing curve with the
 * value riding it, Docker is containers on water, Phaser is a ship and what falls on it.
 *
 * No text: a drawing at the stage's smallest size would make the letters unreadable. The names are in the legend,
 * and the two are joined by pointing: the tool the pointer is on lights its mark, and the mark the pointer is on
 * lights its row.
 *
 * Class names: wb-ln (a line), wb-fill (a solid), and the few that move (wb-spin, wb-blink, wb-flow, wb-rise,
 * wb-fall, wb-sway, wb-scroll, wb-dotx and wb-doty). They only move while the plate is the active one and on screen.
 */

export interface Feature {
  /** Centre, in plate coordinates (the plate is a 220 square; the back corner, near 0,0, is the one the plate above hides). */
  at: readonly [number, number];
  draw: ReactNode;
}

const hex = (r: number) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`;
  }).join(" ");

const cylinder = (bands: number) => (
  <>
    <ellipse cx="0" cy="-14" rx="15" ry="5" className="wb-ln" />
    <path d="M-15 -14V12M15 -14V12M-15 12A15 5 0 0 0 15 12" className="wb-ln" />
    {Array.from({ length: bands }, (_, i) => {
      const y = -14 + ((i + 1) * 26) / (bands + 1);
      return <path key={i} d={`M-15 ${y.toFixed(1)}A15 5 0 0 0 15 ${y.toFixed(1)}`} className="wb-ln wb-faint" />;
    })}
    <rect x="-13" y="-4" width="26" height="14" className="wb-fill wb-rise" />
  </>
);

export const FEATURES: Record<string, Feature> = {
  // ── HELM: the interface ──────────────────────────────────────────────────
  typescript: {
    at: [44, 96],
    draw: (
      <>
        <path d="M-5 -17C-12 -17 -13 -13 -13 -9V-5C-13 -2 -17 0 -19 0C-17 0 -13 2 -13 5V9C-13 13 -12 17 -5 17" className="wb-ln" />
        <path d="M5 -17C12 -17 13 -13 13 -9V-5C13 -2 17 0 19 0C17 0 13 2 13 5V9C13 13 12 17 5 17" className="wb-ln" />
        <rect x="-1" y="-6" width="2" height="12" className="wb-fill wb-blink" />
      </>
    ),
  },
  react: {
    at: [110, 96],
    draw: (
      <g className="wb-spin wb-slow">
        <ellipse rx="22" ry="8" className="wb-ln" />
        <ellipse rx="22" ry="8" transform="rotate(60)" className="wb-ln" />
        <ellipse rx="22" ry="8" transform="rotate(120)" className="wb-ln" />
        <circle r="3.5" className="wb-fill" />
      </g>
    ),
  },
  next: {
    at: [176, 96],
    draw: (
      <>
        <path d="M-16 -18V18M-16 -8H3M-16 4H11M-16 14H-1" className="wb-ln" />
        <rect x="3" y="-12" width="7" height="7" className="wb-ln" />
        <rect x="11" y="0" width="7" height="7" className="wb-ln" />
        <rect x="-1" y="10" width="7" height="7" className="wb-fill wb-blink" />
      </>
    ),
  },
  gsap: {
    at: [44, 164],
    draw: (
      <>
        <path d="M-22 20H22M-22 20V-20" className="wb-ln wb-faint" />
        <path d="M-22 16C-8 16 -6 -16 22 -16" className="wb-ln" />
        <g className="wb-dotx">
          <g className="wb-doty">
            <circle cx="-22" cy="16" r="3" className="wb-fill" />
          </g>
        </g>
      </>
    ),
  },
  three: {
    at: [110, 164],
    draw: (
      <g className="wb-spin wb-slow">
        <polygon points={hex(20)} className="wb-ln" />
        <path d="M0 0L-17.3 -10M0 0L17.3 -10M0 0V20" className="wb-ln" />
      </g>
    ),
  },
  tailwind: {
    at: [176, 164],
    draw: (
      <>
        {Array.from({ length: 9 }, (_, i) => {
          const x = -19 + (i % 3) * 14;
          const y = -19 + Math.floor(i / 3) * 14;
          const lit = [0, 4, 5, 7].includes(i);
          return <rect key={i} x={x} y={y} width="10" height="10" className={lit ? "wb-fill wb-blink" : "wb-ln"} style={lit ? { animationDelay: `${i * 0.25}s` } : undefined} />;
        })}
      </>
    ),
  },

  // ── REACTOR: the services ────────────────────────────────────────────────
  node: {
    at: [44, 96],
    draw: (
      <>
        <polygon points={hex(21)} className="wb-ln" />
        <circle r="8" className="wb-ln wb-spin wb-flow-ring" />
        <circle r="2" className="wb-fill" />
      </>
    ),
  },
  laravel: {
    at: [110, 96],
    draw: (
      <>
        <path d="M-22 -10H8M-22 0H8M-22 10H8" className="wb-ln wb-flow" />
        <path d="M5 -13L9 -10L5 -7M5 -3L9 0L5 3M5 7L9 10L5 13" className="wb-ln" />
        <rect x="13" y="-14" width="10" height="28" className="wb-ln" />
      </>
    ),
  },
  php: {
    at: [176, 96],
    draw: (
      <>
        <ellipse rx="23" ry="13" className="wb-ln" />
        <path d="M-10 -6L-15 0L-10 6" className="wb-ln" />
        <path d="M-1 -6C5 -7 7 -2 2 0C1 1 1 2 1 3" className="wb-ln" />
        <circle cx="1" cy="7" r="1.2" className="wb-fill wb-blink" />
      </>
    ),
  },
  mysql: {
    at: [110, 164],
    draw: cylinder(2),
  },
  postgres: {
    at: [176, 164],
    draw: cylinder(3),
  },
  docker: {
    at: [44, 164],
    draw: (
      <>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const x = -20 + (i % 3) * 14;
          const y = -12 + Math.floor(i / 3) * 11;
          return <rect key={i} x={x} y={y} width="12" height="9" className={i % 2 === 0 ? "wb-fill wb-blink" : "wb-ln"} style={{ animationDelay: `${i * 0.3}s` }} />;
        })}
        <path d="M-24 15q6 -5 12 0t12 0t12 0" className="wb-ln wb-faint" />
      </>
    ),
  },

  // ── PROBE: the runtime ───────────────────────────────────────────────────
  rn: {
    at: [44, 96],
    draw: (
      <>
        <rect x="-10" y="-21" width="20" height="42" rx="3" className="wb-ln" />
        <path d="M-3 -18H3" className="wb-ln" />
        <g className="wb-scroll">
          <path d="M-5 -8H5M-5 -2H5M-5 4H1M-5 10H4" className="wb-ln" />
        </g>
      </>
    ),
  },
  flutter: {
    at: [106, 96],
    draw: (
      <g transform="rotate(-10)">
        <rect x="-10" y="-21" width="20" height="42" rx="3" className="wb-ln" />
        <rect x="-6" y="-14" width="12" height="7" className="wb-ln wb-sway" />
        <rect x="-6" y="-4" width="12" height="7" className="wb-fill wb-sway wb-late" />
        <rect x="-6" y="6" width="12" height="7" className="wb-ln wb-sway wb-later" />
      </g>
    ),
  },
  phaser: {
    at: [172, 104],
    draw: (
      <>
        <rect x="-28" y="-24" width="56" height="48" className="wb-ln" />
        <path d="M0 10V-20" className="wb-ln wb-faint" strokeDasharray="2 3" />
        <path d="M-15 -19l3 4 -3 4 -3 -4z" className="wb-fill wb-fall" />
        <path d="M11 -19l3 4 -3 4 -3 -4z" className="wb-ln wb-fall wb-late" />
        <path d="M0 8L5 19H-5z" className="wb-fill wb-bob" />
      </>
    ),
  },
  canvas: {
    at: [72, 168],
    draw: (
      <>
        {Array.from({ length: 25 }, (_, i) => (
          <circle key={i} cx={-18 + (i % 5) * 9} cy={-18 + Math.floor(i / 5) * 9} r="1" className="wb-fill wb-faint" />
        ))}
        <path d="M-18 14C-6 -22 14 -22 18 6" className="wb-ln wb-draw" pathLength={1} />
      </>
    ),
  },
  figma: {
    at: [150, 168],
    draw: (
      <>
        <rect x="-20" y="-16" width="40" height="32" className="wb-ln" strokeDasharray="3 2" />
        {(
          [
            [-20, -16],
            [20, -16],
            [-20, 16],
            [20, 16],
          ] as const
        ).map(([x, y]) => (
          <rect key={`${x}${y}`} x={x - 2.5} y={y - 2.5} width="5" height="5" className="wb-fill wb-blink" />
        ))}
        <path d="M6 3V15L9 12L12 18L14 17L11 11H15Z" className="wb-fill wb-sway" />
      </>
    ),
  },
};
