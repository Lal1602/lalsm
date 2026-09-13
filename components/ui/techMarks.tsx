import type { ReactElement } from "react";

/**
 * techMarks — one vector mark per entry in the bays' stack arrays.
 *
 * Drawn rather than pulled from an icon set, on the same terms as the three
 * subsystem glyphs in AboutSection: viewBox 0 0 64 64, fill: none carried by
 * the parent, strokes classed g-hair / g-arc / g-bracket / g-solid off
 * currentColor so both themes and all three bay tones come for free.
 *
 * These are deliberately not traced brand logos. Where a technology's identity
 * is already geometric it is referenced — React's three-ellipse orbit reads as
 * an atom, Three.js as a wireframe solid, Docker as stacked cargo — and where
 * it is a wordmark the mark draws its function instead: a type annotation for
 * TypeScript, a bezier for GSAP, database cylinders for the two SQL engines.
 * That keeps them legible at 26px, keeps them inside the section's drafting
 * language instead of turning it into a logo wall, and avoids tracing marks
 * that belong to somebody else.
 *
 * Every stroked shape carries pathLength="1" so one --draw channel can stroke
 * any of them on without the runtime knowing their real lengths; filled shapes
 * fade on the same channel instead (see .tech-mark in portfolio.css).
 */

const P = { pathLength: 1 } as const;

/* ── HELM · frontend ──────────────────────────────────────────────────────── */

/** A type annotation: brackets around a colon. */
function TypeScriptMark() {
  return (
    <>
      <path d="M24 14h-8v36h8" className="g-bracket" {...P} />
      <path d="M40 14h8v36h-8" className="g-bracket" {...P} />
      <rect x="30" y="25" width="5" height="5" className="g-solid" />
      <rect x="30" y="35" width="5" height="5" className="g-solid" />
    </>
  );
}

/** Three orbits and a nucleus — the mark already reads as an atom. */
function ReactMark() {
  return (
    <>
      <ellipse cx="32" cy="32" rx="21" ry="8" className="g-hair" {...P} />
      <ellipse cx="32" cy="32" rx="21" ry="8" className="g-hair" transform="rotate(60 32 32)" {...P} />
      <ellipse cx="32" cy="32" rx="21" ry="8" className="g-hair" transform="rotate(120 32 32)" {...P} />
      <circle cx="32" cy="32" r="3.5" className="g-solid" />
    </>
  );
}

/** The circled diagonal, which doubles as a heading indicator. */
function NextMark() {
  return (
    <>
      <circle cx="32" cy="32" r="21" className="g-hair" {...P} />
      <path d="M24 43V21l18 22" className="g-arc" {...P} />
      <path d="M41 21v14" className="g-arc" {...P} />
    </>
  );
}

/** An ease curve with its endpoints — animation drawn as its own graph. */
function GsapMark() {
  return (
    <>
      <path d="M12 48C26 48 24 16 52 16" className="g-arc" {...P} />
      <circle cx="12" cy="48" r="3.5" className="g-solid" />
      <circle cx="52" cy="16" r="3.5" className="g-solid" />
    </>
  );
}

/** A wireframe solid with its hidden edges shown. */
function ThreeMark() {
  return (
    <>
      <path d="M32 10 54 46H10z" className="g-hair" {...P} />
      <path d="M32 10v26M10 46l22-10M54 46l-22-10" className="g-hair" {...P} />
      <circle cx="32" cy="36" r="2.5" className="g-solid" />
    </>
  );
}

/** Two stacked flows. */
function TailwindMark() {
  return (
    <>
      <path d="M12 26c5-11 13-11 18 0s13 11 18 0" className="g-arc" {...P} />
      <path d="M12 42c5-11 13-11 18 0s13 11 18 0" className="g-arc" {...P} />
    </>
  );
}

/* ── REACTOR · backend ────────────────────────────────────────────────────── */

/** A containment hexagon around a live core. */
function NodeMark() {
  return (
    <>
      <path d="M32 8 54 20v24L32 56 10 44V20z" className="g-hair" {...P} />
      <circle cx="32" cy="32" r="4" className="g-solid" />
      <path d="M32 19v8M32 37v8" className="g-hair" {...P} />
    </>
  );
}

/** An arch and its keystone — the framework holding the load. */
function LaravelMark() {
  return (
    <>
      <path d="M12 50V34a20 20 0 0 1 40 0v16" className="g-hair" {...P} />
      <rect x="28" y="10" width="8" height="8" className="g-solid" />
      <path d="M10 54h44" className="g-bracket" {...P} />
    </>
  );
}

/** A request being processed: the round trip and what it carries. */
function PhpMark() {
  return (
    <>
      <ellipse cx="32" cy="32" rx="24" ry="15" className="g-hair" {...P} />
      <path d="M21 27h22M21 32h14M21 37h18" className="g-hair" {...P} />
    </>
  );
}

/** A banded store. */
function MySqlMark() {
  return (
    <>
      <ellipse cx="32" cy="18" rx="18" ry="6" className="g-hair" {...P} />
      <path d="M14 18v28c0 3.3 8.1 6 18 6s18-2.7 18-6V18" className="g-hair" {...P} />
      <path d="M14 30c0 3.3 8.1 6 18 6s18-2.7 18-6" className="g-hair" {...P} />
    </>
  );
}

/** The same store under a ring, so the two engines read apart at 26px. */
function PostgresMark() {
  return (
    <>
      <ellipse cx="32" cy="19" rx="15" ry="5" className="g-hair" {...P} />
      <path d="M17 19v23c0 2.8 6.7 5 15 5s15-2.2 15-5V19" className="g-hair" {...P} />
      <ellipse cx="32" cy="34" rx="26" ry="9" className="g-hair" transform="rotate(-18 32 34)" {...P} />
    </>
  );
}

/** Stacked cargo above a waterline. */
function DockerMark() {
  return (
    <>
      <rect x="14" y="30" width="9" height="9" className="g-hair" {...P} />
      <rect x="25" y="30" width="9" height="9" className="g-hair" {...P} />
      <rect x="36" y="30" width="9" height="9" className="g-hair" {...P} />
      <rect x="25" y="19" width="9" height="9" className="g-hair" {...P} />
      <path d="M8 47h48" className="g-arc" {...P} />
    </>
  );
}

/* ── PROBE · mobile and games ─────────────────────────────────────────────── */

/** The same orbit, boxed into a handset. */
function ReactNativeMark() {
  return (
    <>
      <rect x="19" y="7" width="26" height="50" rx="4" className="g-hair" {...P} />
      <path d="M28 13h8" className="g-hair" {...P} />
      <ellipse cx="32" cy="33" rx="10" ry="4" className="g-hair" {...P} />
      <ellipse cx="32" cy="33" rx="10" ry="4" className="g-hair" transform="rotate(60 32 33)" {...P} />
      <ellipse cx="32" cy="33" rx="10" ry="4" className="g-hair" transform="rotate(120 32 33)" {...P} />
      <circle cx="32" cy="33" r="2.5" className="g-solid" />
    </>
  );
}

/** A folded ribbon. */
function FlutterMark() {
  return (
    <>
      <path d="M44 10 16 38l7 7 28-28z" className="g-hair" {...P} />
      <path d="M30 45l7 7 14-14-7-7z" className="g-hair" {...P} />
    </>
  );
}

/** The loop, and the frame it runs. */
function PhaserMark() {
  return (
    <>
      <path d="M46 17A20 20 0 1 0 52 32" className="g-arc" {...P} />
      <path d="M52 21v11H41" className="g-hair" {...P} />
      <path d="M26 23l16 9-16 9z" className="g-solid" />
    </>
  );
}

/** A raster surface: the frame, and pixels being laid into it. */
function CanvasMark() {
  return (
    <>
      <path d="M10 20V10h10M44 10h10v10M54 44v10H44M20 54H10V44" className="g-bracket" {...P} />
      <rect x="19" y="19" width="6" height="6" className="g-solid" />
      <rect x="28" y="28" width="6" height="6" className="g-solid" />
      <rect x="37" y="37" width="6" height="6" className="g-solid" />
    </>
  );
}

/** Stacked quadrants. */
function FigmaMark() {
  return (
    <>
      <path d="M32 10h-8a8 8 0 0 0 0 16h8z" className="g-hair" {...P} />
      <path d="M32 10h8a8 8 0 0 1 0 16h-8z" className="g-hair" {...P} />
      <path d="M32 26h-8a8 8 0 0 0 0 16h8z" className="g-hair" {...P} />
      <circle cx="40" cy="34" r="8" className="g-hair" {...P} />
      <circle cx="24" cy="50" r="8" className="g-hair" {...P} />
    </>
  );
}

/**
 * Keyed by the exact strings in the bays' stack arrays, so that data stays the
 * single source of truth. A name with no mark simply renders nothing.
 */
export const TECH_MARKS: Record<string, () => ReactElement> = {
  TypeScript: TypeScriptMark,
  React: ReactMark,
  "Next.js": NextMark,
  GSAP: GsapMark,
  "Three.js": ThreeMark,
  Tailwind: TailwindMark,

  "Node.js": NodeMark,
  Laravel: LaravelMark,
  PHP: PhpMark,
  MySQL: MySqlMark,
  PostgreSQL: PostgresMark,
  Docker: DockerMark,

  "React Native": ReactNativeMark,
  Flutter: FlutterMark,
  "Phaser.js": PhaserMark,
  "Canvas API": CanvasMark,
  Figma: FigmaMark,
};

/** One mark, positioned by .bay-glyph and revealed by the --draw channel. */
export function TechMark({ name, index }: { name: string; index: number }) {
  const Mark = TECH_MARKS[name];
  if (!Mark) return null;
  return (
    <svg className="bay-glyph tech-mark" viewBox="0 0 64 64" data-i={index} aria-hidden="true">
      <Mark />
    </svg>
  );
}
