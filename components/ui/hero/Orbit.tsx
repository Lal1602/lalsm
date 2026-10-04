"use client";
import { RINGS, circlePath, circumference, ringText, type RingSpec } from "@/lib/hero/orbit";

/** The ring is drawn in a box 1000 units across; the CSS sizes the box. */
const BOX = 1000;
const OUTER_RADIUS = 480;

function Ring({ spec }: { spec: RingSpec }) {
  const r = OUTER_RADIUS * spec.scale;
  const c = circumference(r);
  const id = `hx-ring-${spec.id}`;
  const text = ringText(spec, c);
  return (
    <svg
      className="hx-ring"
      data-ring={spec.id}
      data-style={spec.style}
      viewBox={`0 0 ${BOX} ${BOX}`}
      style={{ ["--ring-scale" as string]: spec.scale, ["--ring-period" as string]: `${Math.abs(spec.period)}s`, ["--ring-dir" as string]: spec.period < 0 ? "reverse" : "normal" } as React.CSSProperties}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <path id={id} d={circlePath(BOX / 2, BOX / 2, r)} />
      </defs>
      <text fontSize={spec.fontSize}>
        <textPath href={`#${id}`} textLength={c} lengthAdjust="spacing">
          {text}
        </textPath>
      </text>
    </svg>
  );
}

/**
 * The rings round the portrait's disc. Decorative: hidden from assistive tech, no pointer events, and
 * not rendered at all in Lite. Their centre and size are set from the page by orbitField.ts (the
 * disc's place depends on the window).
 */
export default function Orbit() {
  return (
    <div className="hx-orbit" aria-hidden="true">
      {RINGS.map((spec) => (
        <Ring key={spec.id} spec={spec} />
      ))}
    </div>
  );
}
