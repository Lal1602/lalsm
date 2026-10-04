/**
 * Geometry and text of the typographic rings that circle the portrait. Pure, so the numbers can be
 * tested: the ring component only draws what this returns.
 */

export interface RingSpec {
  id: string;
  /** Radius as a fraction of the outer ring's radius. */
  scale: number;
  /** Seconds for one full turn at rest; negative turns the other way. */
  period: number;
  /** Text to run round the circle; repeated and stretched to fill it exactly. */
  words: readonly string[];
  /** Font size in the ring's own units (the SVG is 1000 units across). */
  fontSize: number;
  style: "outline" | "mono";
}

/** The two rings. Real words only: the role, the name, the place, the stack, the coordinates. */
export const RINGS: readonly RingSpec[] = [
  {
    id: "a",
    scale: 1,
    period: 170,
    words: ["Creative Developer", "Bilal Sanayu Majid", "Surabaya", "Three.js"],
    fontSize: 96,
    style: "outline",
  },
  {
    id: "b",
    scale: 0.84,
    period: -110,
    words: ["07.2756°S 112.7937°E", "WebGL", "Motion", "Systems", "Framer Motion", "PENS Surabaya"],
    fontSize: 26,
    style: "mono",
  },
];

/** The outer ring's text sits this far out from the disc's edge, as a multiple of the disc's radius. */
export const OUTER_OVER_DISC = 1.52;

/** The ring is drawn in a box 1000 units across with its outer circle at 480 units from the centre. */
const BOX_HALF = 500;
const OUTER_UNITS = 480;

/**
 * Sizes for rings round a disc of the given radius (px): the radius of each ring's circle, outermost
 * first, and the half-width of the box the SVGs are drawn in (they are scaled together, so the box is
 * what CSS sizes). The outer ring's text sits outside its circle, so `reach` is how far the outermost
 * glyph gets from the centre: what has to fit in the hero.
 */
export function ringRadii(discRadius: number): { radii: number[]; boxHalf: number; reach: number } {
  const outer = discRadius * OUTER_OVER_DISC;
  const unit = outer / OUTER_UNITS;
  const capHeight = RINGS[0].fontSize * 0.7 * unit;
  return {
    radii: RINGS.map((spec) => outer * spec.scale),
    boxHalf: BOX_HALF * unit,
    reach: outer + capHeight,
  };
}

/** Average advance of a capital in Space Grotesk 700 (measured: CREATIVE is 4.42em for 8 letters). */
const CAPS_ADVANCE = 0.56;
/** Roboto Mono's advance is 0.6em; the ring's letter-spacing adds to it. */
const MONO_ADVANCE = 0.6;

/**
 * The string that goes round a ring: the words joined by a middle dot, repeated whole until its
 * natural length is at least a circle's, then trimmed back to a whole number of words so the join
 * is a gap between words and never a split one. The caller stretches it to the exact circumference
 * (SVG textLength), so a few percent either way only changes the spacing, not the look.
 */
export function ringText(spec: RingSpec, circumference: number): string {
  const advance = spec.style === "outline" ? CAPS_ADVANCE : MONO_ADVANCE + 0.2;
  const perChar = spec.fontSize * advance;
  const target = circumference / perChar;
  const sep = " · ";
  const words = spec.words.map((w) => w.toUpperCase());
  if (words.length === 0 || !(target > 0)) return "";

  let out = "";
  let i = 0;
  // Add whole words while the string is still shorter than a circle (never an infinite loop).
  while (out.length + words[i % words.length].length < target && i < 400) {
    out += words[i % words.length] + sep;
    i++;
  }
  return out.length === 0 ? words[0] + sep : out;
}

export function circumference(radius: number): number {
  return 2 * Math.PI * radius;
}

/** A circle's path as two arcs, starting at the top and running clockwise (what a textPath follows). */
export function circlePath(cx: number, cy: number, r: number): string {
  return `M ${cx} ${cy - r} a ${r} ${r} 0 1 1 0 ${2 * r} a ${r} ${r} 0 1 1 0 ${-2 * r}`;
}

/** Which ring is nearest the pointer, and how far (px) the pointer is from that ring's circle. */
export function nearestRing(distanceFromCentre: number, radii: readonly number[]): { index: number; gap: number } | null {
  if (!Number.isFinite(distanceFromCentre) || radii.length === 0) return null;
  let best = 0;
  let gap = Math.abs(distanceFromCentre - radii[0]);
  for (let i = 1; i < radii.length; i++) {
    const g = Math.abs(distanceFromCentre - radii[i]);
    if (g < gap) {
      best = i;
      gap = g;
    }
  }
  return { index: best, gap };
}

/**
 * Extra turn, in degrees per frame of 1/60 s, from how fast the page is scrolling (px per second).
 * It is signed by the scroll direction, bounded, and shaped so a gentle scroll adds almost nothing
 * and a fling adds a lot.
 */
export function spinFromScroll(pxPerSecond: number): number {
  if (!Number.isFinite(pxPerSecond)) return 0;
  const v = Math.abs(pxPerSecond);
  const eased = Math.min(1, v / 4000) ** 1.5;
  return Math.sign(pxPerSecond) * eased * 2.4;
}
