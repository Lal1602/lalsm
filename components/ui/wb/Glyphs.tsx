/**
 * One drawn mark per discipline, in the hairline weight of the rest of the site.
 * Each says something about its own bay: HELM is a viewfinder, REACTOR a containment
 * vessel, PROBE a body with its terminator and an orbit. Strokes carry pathLength 1,
 * so CSS can draw them on (stroke-dashoffset) when their bay becomes the active one.
 */

export type GlyphName = "helm" | "reactor" | "probe";

export default function Glyph({ name }: { name: GlyphName }) {
  return (
    <svg viewBox="0 0 64 64" className="wb-glyph" aria-hidden="true" focusable="false">
      {name === "helm" ? (
        <>
          <path d="M6 19V6h13M45 6h13v13M58 45v13H45M19 58H6V45" className="g-line" pathLength={1} />
          <circle cx="32" cy="32" r="13" className="g-line" pathLength={1} />
          <path d="M32 14v6M32 44v6M14 32h6M44 32h6" className="g-line" pathLength={1} />
          <rect x="29.5" y="29.5" width="5" height="5" className="g-solid" />
        </>
      ) : name === "reactor" ? (
        <>
          <path d="M52 32 42 49.3H22L12 32l10-17.3h20z" className="g-line" pathLength={1} />
          <path d="M42 32 37 40.7H27L22 32l5-8.7h10z" className="g-line" pathLength={1} />
          <path d="M42 32h10M27 23.3 22 14.7M37 40.7l5 8.6" className="g-line" pathLength={1} />
          <circle cx="32" cy="32" r="3" className="g-solid" />
        </>
      ) : (
        <>
          <circle cx="32" cy="32" r="11" className="g-line" pathLength={1} />
          <path d="M32 21a11 11 0 0 1 0 22" className="g-arc" pathLength={1} />
          <ellipse cx="32" cy="32" rx="25" ry="10" className="g-line" pathLength={1} transform="rotate(-24 32 32)" />
          <rect x="51.5" y="19.5" width="5" height="5" className="g-solid" transform="rotate(-24 54 22)" />
        </>
      )}
    </svg>
  );
}
