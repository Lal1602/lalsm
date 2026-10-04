"use client";

const GUIDES = [
  { line: 0, kind: "cap" },
  { line: 0, kind: "base" },
  { line: 1, kind: "cap" },
  { line: 1, kind: "base" },
] as const;

/**
 * The type-specimen sheet behind the headline: a cap-height and a baseline hairline per line, and the
 * margin the whole column hangs from. Their positions and the figures in their labels are measured
 * from the page by specimenField.ts (the font size depends on the window), so this only holds the
 * elements. Decorative: hidden from assistive tech, no pointer events, not rendered in Lite.
 */
export default function Specimen() {
  return (
    <div className="hx-spec" aria-hidden="true">
      <i className="hx-margin" />
      {GUIDES.map((g) => (
        <i key={`${g.line}-${g.kind}`} className="hx-guide" data-kind={g.kind} data-line={g.line}>
          <span className="hx-guide-label" />
        </i>
      ))}
    </div>
  );
}
