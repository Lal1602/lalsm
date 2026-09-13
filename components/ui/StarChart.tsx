"use client";
import { memo } from "react";

/**
 * StarChart — the navigational instrument behind the Horizon section's first slide.
 *
 * Built as three stacked layers rather than one animated <svg> on purpose: rotating
 * an SVG <g> re-rasterises the whole drawing every frame, while rotating a plain
 * wrapper <div> stays on the compositor. Two of the three layers spin; the static
 * layer carries every piece of text so labels never turn upside down.
 *
 * CSS pauses both rotations whenever the section is not showing waypoint 01
 * (see `.horizon-container[data-waypoint] .starchart-ring`), so the layers cost
 * nothing while the career slide is on screen.
 */

const C = 300; // viewBox centre

/**
 * Polar to cartesian, angle in degrees measured clockwise from 12 o'clock.
 *
 * Coordinates are rounded to three decimals because Math.cos/Math.sin are
 * implementation-defined: Node and the browser can be on different V8 builds
 * and return doubles that differ in the last bit, which React reports as a
 * hydration mismatch on every attribute this feeds.
 */
function polar(angle: number, radius: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  const round = (v: number) => Math.round(v * 1000) / 1000;
  return { x: round(C + radius * Math.cos(rad)), y: round(C + radius * Math.sin(rad)) };
}

// ── Outer bezel: 120 graduations, every 10th cut long ────────────────────────
const BEZEL_TICKS = Array.from({ length: 120 }, (_, i) => {
  const angle = i * 3;
  const major = i % 10 === 0;
  const outer = 288;
  const inner = major ? 270 : 281;
  const a = polar(angle, outer);
  const b = polar(angle, inner);
  return { key: i, x1: a.x, y1: a.y, x2: b.x, y2: b.y, major };
});

// ── Declination numerals on the bezel, every 90° ─────────────────────────────
// The east/west pair is pushed out past the bezel: at the inner radius it lands
// straight on the middle of the centred headline.
const BEZEL_MARKS = [0, 90, 180, 270].map((angle) => ({
  angle,
  label: String(angle).padStart(3, "0"),
  ...polar(angle, angle % 180 === 0 ? 255 : 318),
}));

// ── Constellation nodes: the actual stack this site runs on ──────────────────
const NODES = [
  { angle: 46, label: "THREE.JS", tone: "cyan" },
  { angle: 132, label: "GSAP", tone: "gold" },
  { angle: 224, label: "NEXT.JS", tone: "cyan" },
  { angle: 310, label: "WEBGL", tone: "violet" },
] as const;

/** Chords drawn between adjacent nodes — the "constellation" itself. */
const CHORDS = NODES.map((node, i) => {
  const next = NODES[(i + 1) % NODES.length]!;
  const a = polar(node.angle, 168);
  const b = polar(next.angle, 168);
  return { key: i, x1: a.x, y1: a.y, x2: b.x, y2: b.y };
});

function StarChart() {
  return (
    <div className="starchart" aria-hidden="true">
      {/* Soft core light — a radial-gradient, deliberately not a blur filter */}
      <div className="starchart-core" />

      {/* Layer 1 — outer bezel, slow clockwise drift */}
      <div className="starchart-ring starchart-ring--bezel">
        <svg viewBox="0 0 600 600" fill="none">
          <circle cx={C} cy={C} r={288} className="sc-hairline" />
          <circle cx={C} cy={C} r={270} className="sc-hairline sc-faint" />
          {BEZEL_TICKS.map((t) => (
            <line
              key={t.key}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              className={t.major ? "sc-tick sc-tick--major" : "sc-tick"}
            />
          ))}
        </svg>
      </div>

      {/* Layer 2 — inner orbit, counter-rotating, carries the transit marker */}
      <div className="starchart-ring starchart-ring--orbit">
        <svg viewBox="0 0 600 600" fill="none">
          <circle cx={C} cy={C} r={216} className="sc-orbit-path" />
          {/* Three arc segments break the ring so the rotation is legible */}
          <circle
            cx={C}
            cy={C}
            r={232}
            className="sc-orbit-arc"
            strokeDasharray="150 214"
            strokeDashoffset={0}
          />
          {/* Transit marker riding the orbit at 12 o'clock */}
          <circle cx={C} cy={C - 216} r={11} className="sc-marker-halo" />
          <rect x={C - 3.5} y={C - 216 - 3.5} width={7} height={7} className="sc-marker" />
        </svg>
      </div>

      {/* Layer 3 — fixed frame: reticle, constellation, labels */}
      <div className="starchart-static">
        <svg viewBox="0 0 600 600" fill="none">
          {/* Crosshair with a gap through the middle so it never crosses the title */}
          <line x1={C} y1={18} x2={C} y2={128} className="sc-hairline sc-faint" />
          <line x1={C} y1={472} x2={C} y2={582} className="sc-hairline sc-faint" />
          <line x1={18} y1={C} x2={128} y2={C} className="sc-hairline sc-faint" />
          <line x1={472} y1={C} x2={582} y2={C} className="sc-hairline sc-faint" />

          <circle cx={C} cy={C} r={168} className="sc-hairline sc-faint" />
          <circle cx={C} cy={C} r={96} className="sc-hairline sc-faint" />

          {CHORDS.map((c) => (
            <line key={c.key} x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2} className="sc-chord" />
          ))}

          {BEZEL_MARKS.map((m) => (
            <text key={m.angle} x={m.x} y={m.y + 4} className="sc-numeral" textAnchor="middle">
              {m.label}
            </text>
          ))}

          {NODES.map((n) => {
            const node = polar(n.angle, 168);
            const leadIn = polar(n.angle, 182);
            const leadOut = polar(n.angle, 226);
            const text = polar(n.angle, 238);
            const onRight = n.angle < 180;
            return (
              <g key={n.label} className={`sc-node sc-node--${n.tone}`}>
                <line x1={leadIn.x} y1={leadIn.y} x2={leadOut.x} y2={leadOut.y} className="sc-lead" />
                <circle cx={node.x} cy={node.y} r={9} className="sc-node-halo" />
                <circle cx={node.x} cy={node.y} r={3.5} className="sc-node-dot" />
                <text
                  x={text.x}
                  y={text.y + 4}
                  className="sc-label"
                  textAnchor={onRight ? "start" : "end"}
                >
                  {n.label}
                </text>
              </g>
            );
          })}

          {/* Centre reticle */}
          <path d={`M ${C - 26} ${C} h 16 M ${C + 10} ${C} h 16`} className="sc-reticle" />
          <path d={`M ${C} ${C - 26} v 16 M ${C} ${C + 10} v 16`} className="sc-reticle" />
        </svg>
      </div>
    </div>
  );
}

export default memo(StarChart);
