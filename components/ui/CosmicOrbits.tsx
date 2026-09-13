"use client";
import { memo } from "react";

/**
 * CosmicOrbits — the ecliptic plate the archive cards ride on.
 *
 * Pure static SVG: nested ellipses in forced perspective plus graduation ticks
 * along the primary orbit. `preserveAspectRatio="none"` lets the plate stretch
 * to any stage width while `vector-effect="non-scaling-stroke"` keeps every
 * line a true hairline instead of a smeared 3px band on wide screens.
 */

const VB_W = 1200;
const VB_H = 480;
const CX = 600;
const CY = 268;

/** Graduation marks laid around the primary ellipse. */
const TICKS = Array.from({ length: 48 }, (_, i) => {
  const a = (i / 48) * Math.PI * 2;
  const rx = 552;
  const ry = 128;
  const x = CX + rx * Math.cos(a);
  const y = CY + ry * Math.sin(a);
  // Longer marks every eighth step read as cardinal bearings.
  const major = i % 6 === 0;
  return { key: i, x, y, r: major ? 1.9 : 0.9, o: major ? 0.34 : 0.16 };
});

function CosmicOrbits() {
  return (
    <svg
      className="cosmos-orbits"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="cosmosOrbitFade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="18%" stopColor="#cddcf5" stopOpacity="0.55" />
          <stop offset="50%" stopColor="#ffe6c2" stopOpacity="0.85" />
          <stop offset="82%" stopColor="#cddcf5" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="cosmosCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffd7a3" stopOpacity="0.20" />
          <stop offset="55%" stopColor="#8ea8d8" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Soft light pooling where the focused card sits */}
      <ellipse cx={CX} cy={CY - 18} rx={430} ry={168} fill="url(#cosmosCore)" />

      {/* Primary orbit — the path the archive rides */}
      <ellipse
        cx={CX}
        cy={CY}
        rx={552}
        ry={128}
        fill="none"
        stroke="url(#cosmosOrbitFade)"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />

      {/* Outer sweep, drawn wider than the stage so it bleeds off both edges */}
      <ellipse
        cx={CX}
        cy={CY + 12}
        rx={690}
        ry={186}
        fill="none"
        stroke="rgba(178,200,240,0.10)"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />

      {/* Inner survey rings */}
      <ellipse
        cx={CX}
        cy={CY - 6}
        rx={372}
        ry={84}
        fill="none"
        stroke="rgba(214,228,255,0.12)"
        strokeWidth={1}
        strokeDasharray="3 9"
        vectorEffect="non-scaling-stroke"
      />
      <ellipse
        cx={CX}
        cy={CY - 12}
        rx={196}
        ry={44}
        fill="none"
        stroke="rgba(255,214,166,0.14)"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />

      {/* Ecliptic line */}
      <line
        x1={0}
        y1={CY}
        x2={VB_W}
        y2={CY}
        stroke="rgba(190,210,245,0.06)"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />

      <g className="cosmos-orbit-ticks">
        {TICKS.map((t) => (
          <circle key={t.key} cx={t.x} cy={t.y} r={t.r} fill={`rgba(226,238,255,${t.o})`} />
        ))}
      </g>
    </svg>
  );
}

export default memo(CosmicOrbits);
