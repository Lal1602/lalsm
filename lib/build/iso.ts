/**
 * The geometry of What I Build's exploded view: three plates in axonometric projection, one above the other.
 *
 * A plate is drawn flat, in its own square of side S, and put on the page by one matrix: the standard isometric top
 * face (a rotation and a shear that make a square into a diamond). Everything on a plate is therefore drawn in plain
 * plate coordinates and lands in perspective for free. All lengths here are in the stage's own units (the SVG's
 * viewBox); the stage scales as a whole, in CSS.
 */

const COS30 = Math.cos(Math.PI / 6);

/** Side of a plate's square, in its own coordinates. */
export const S = 220;
/** Thickness of a plate's edge. */
export const T = 12;
/** Width of a plate on screen: the diamond's two corners. */
export const W = Math.round(2 * S * COS30);
/** Height of a plate on screen: the diamond and its edge. */
export const PLATE_H = S + T;
/** Where the diamond's centre line is, on screen. */
export const CX = W / 2;

/** Vertical distance between the tops of two neighbouring plates, at rest. */
export const SPACING = 185;
/** Top of the first plate, leaving room above it for the plates that open upward. */
export const TOP0 = 44;
/** The stage's own height: three plates and the room they move in. */
export const STAGE_H = TOP0 + 2 * SPACING + PLATE_H + 14;

/** How far the plates above the one being inspected move up to uncover it. */
export const OPEN = 34;
/** How far the inspected plate itself rises. */
export const LIFT = 8;

/** A point of a plate's own square, on the plate's screen box. */
export function iso(x: number, y: number): [number, number] {
  return [CX + COS30 * (x - y), 0.5 * (x + y)];
}

/** The SVG matrix that puts a plate's square on its screen box (the same as `iso`, as a transform). */
export const ISO_MATRIX = `matrix(${COS30.toFixed(8)} 0.5 ${(-COS30).toFixed(8)} 0.5 ${CX} 0)`;

const pts = (list: ReadonlyArray<readonly [number, number]>) => list.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

/** The plate's top face, and the two faces of its edge. */
export function plateFaces() {
  const top = iso(0, 0);
  const right = iso(S, 0);
  const bottom = iso(S, S);
  const left = iso(0, S);
  const down = (p: readonly [number, number]): [number, number] => [p[0], p[1] + T];
  return {
    top: pts([top, right, bottom, left]),
    leftEdge: pts([left, bottom, down(bottom), down(left)]),
    rightEdge: pts([bottom, right, down(right), down(bottom)]),
  };
}

/** Where the plates sit at rest: the top of each, from the first. */
export const baseTops = (count: number): number[] => Array.from({ length: count }, (_, i) => TOP0 + i * SPACING);

/**
 * How far each plate is from its resting place when plate `active` is the one being inspected: the plates above it
 * open upward (they are what hides it) and it rises a little. Plates below it stay where they are.
 */
export function offsets(count: number, active: number | null): number[] {
  return Array.from({ length: count }, (_, i) => {
    if (active === null) return 0;
    if (i < active) return -OPEN;
    if (i === active) return -LIFT;
    return 0;
  });
}

/** The plates drawn together, before the stage has opened: each moved toward the middle of the stack. */
export function collapsedOffsets(count: number): number[] {
  const mid = (count - 1) / 2;
  return Array.from({ length: count }, (_, i) => (mid - i) * (SPACING - 52));
}

/**
 * A pole between two plates, at screen x: where it leaves the lower surface of the upper plate and where it meets the
 * upper surface of the lower one, given the top of each. Used for the wires that tie the stack together.
 */
export function poleEnds(x: number, upperTop: number, lowerTop: number): [number, number] {
  const left = x <= CX;
  const edge = (left ? x : W - x) / CX;
  const rise = 0.5 * S * edge;
  return [upperTop + S * 0.5 + rise + T, lowerTop + S * 0.5 - rise];
}
