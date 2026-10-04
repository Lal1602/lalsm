/**
 * The skeleton of each headline letter, as the centre line of its strokes: a few points joined by
 * lines, like a constellation. The lens shows these where the letters are. Hand drawn on a 100 x 100
 * grid (x across the letter, y from the top of the capital, 0, to the baseline, 100) and stretched to
 * each letter's box, so a narrow I and a wide D are both drawn on the same grid.
 *
 * Only the letters the headline uses. A letter without an entry has no skeleton and simply stays solid.
 */

export type Point = readonly [number, number];
export type Stroke = readonly Point[];

export const SKELETON: Readonly<Record<string, readonly Stroke[]>> = {
  C: [[[86, 24], [68, 9], [48, 5], [28, 14], [16, 36], [16, 64], [28, 86], [48, 95], [68, 91], [86, 76]]],
  // Every place two strokes meet is a point of both, so it becomes one star.
  R: [
    [[20, 98], [20, 50], [20, 4], [62, 4], [80, 16], [80, 36], [62, 50], [50, 50], [20, 50]],
    [[50, 50], [84, 98]],
  ],
  E: [
    [[84, 4], [20, 4], [20, 50], [20, 98], [84, 98]],
    [[20, 50], [74, 50]],
  ],
  A: [
    [[8, 98], [22, 66], [50, 2], [78, 66], [92, 98]],
    [[22, 66], [78, 66]],
  ],
  T: [
    [[6, 6], [50, 6], [94, 6]],
    [[50, 6], [50, 98]],
  ],
  I: [[[50, 2], [50, 98]]],
  V: [[[6, 2], [50, 98], [94, 2]]],
  D: [[[20, 4], [20, 96], [56, 96], [82, 76], [87, 50], [82, 24], [56, 4], [20, 4]]],
  L: [[[22, 2], [22, 96], [86, 96]]],
  O: [[[50, 3], [74, 10], [89, 32], [89, 68], [74, 90], [50, 97], [26, 90], [11, 68], [11, 32], [26, 10], [50, 3]]],
  P: [[[20, 98], [20, 50], [20, 4], [62, 4], [80, 16], [80, 36], [62, 50], [20, 50]]],
};

/** The strokes for a letter (case-insensitive), or an empty list. */
export function skeletonFor(letter: string): readonly Stroke[] {
  return SKELETON[letter.toUpperCase()] ?? [];
}

/** SVG `points` attribute for a stroke. */
export function pointsAttr(stroke: Stroke): string {
  return stroke.map(([x, y]) => `${x},${y}`).join(" ");
}

/** The distinct points of a letter's strokes: where the stars go. Shared joints get one star, not two. */
export function nodesFor(letter: string): Point[] {
  const seen = new Set<string>();
  const out: Point[] = [];
  for (const stroke of skeletonFor(letter)) {
    for (const p of stroke) {
      const key = `${p[0]},${p[1]}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(p);
    }
  }
  return out;
}
