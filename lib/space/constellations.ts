import type { SeamKind } from "./SpaceRenderer";

/**
 * Hand-placed constellations for the seams. Positions are in the same world space
 * the nebula shader uses: x is a fraction of the page width, y is css px from the
 * seam line (negative = above it). Both halves of a seam draw from the same list,
 * so a figure that crosses the seam is simply continued by the other half.
 */

export interface Star {
  x: number;
  y: number;
  /** Size, roughly the radius of the core in css px. */
  s: number;
}

export interface Constellation {
  stars: Star[];
  /** Pairs of indices into `stars`. */
  lines: Array<[number, number]>;
}

const NEBULA: Constellation[] = [
  // Left, above the seam: a small kite, like Lyra.
  {
    stars: [
      { x: 0.085, y: -250, s: 2.8 },
      { x: 0.12, y: -205, s: 1.6 },
      { x: 0.155, y: -255, s: 1.9 },
      { x: 0.14, y: -150, s: 1.5 },
      { x: 0.098, y: -130, s: 1.4 },
    ],
    lines: [[0, 1], [1, 2], [1, 3], [3, 4], [4, 1]],
  },
  // Centre-right, crossing the seam: a long zig-zag that ties the two sections together.
  {
    stars: [
      { x: 0.56, y: -190, s: 1.6 },
      { x: 0.6, y: -120, s: 2.2 },
      { x: 0.645, y: -45, s: 1.5 },
      { x: 0.68, y: 40, s: 3.0 },
      { x: 0.655, y: 120, s: 1.6 },
      { x: 0.72, y: 85, s: 1.8 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [3, 5]],
  },
  // Right, below the seam.
  {
    stars: [
      { x: 0.86, y: 200, s: 2.0 },
      { x: 0.9, y: 160, s: 1.5 },
      { x: 0.935, y: 215, s: 1.7 },
      { x: 0.955, y: 140, s: 2.6 },
      { x: 0.885, y: 265, s: 1.4 },
    ],
    lines: [[0, 1], [1, 2], [1, 3], [0, 4]],
  },
  // Left, below the seam: the W of Cassiopeia.
  {
    stars: [
      { x: 0.17, y: 240, s: 1.5 },
      { x: 0.205, y: 190, s: 2.2 },
      { x: 0.245, y: 235, s: 1.6 },
      { x: 0.285, y: 180, s: 2.4 },
      { x: 0.325, y: 225, s: 1.5 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4]],
  },
];

const ACCRETION: Constellation[] = [
  // Left: a triangle with a tail.
  {
    stars: [
      { x: 0.07, y: -165, s: 2.4 },
      { x: 0.115, y: -120, s: 1.6 },
      { x: 0.045, y: -100, s: 1.5 },
      { x: 0.15, y: -190, s: 1.4 },
    ],
    lines: [[0, 1], [1, 2], [2, 0], [0, 3]],
  },
  // Centre, crossing the seam.
  {
    stars: [
      { x: 0.47, y: -150, s: 1.7 },
      { x: 0.505, y: -85, s: 2.6 },
      { x: 0.54, y: -20, s: 1.5 },
      { x: 0.52, y: 60, s: 2.0 },
      { x: 0.575, y: 105, s: 1.5 },
      { x: 0.46, y: 120, s: 1.4 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [3, 5]],
  },
  // Right, below.
  {
    stars: [
      { x: 0.82, y: 150, s: 2.2 },
      { x: 0.865, y: 190, s: 1.5 },
      { x: 0.915, y: 150, s: 1.8 },
      { x: 0.89, y: 105, s: 1.4 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 0]],
  },
];

export const CONSTELLATIONS: Record<SeamKind, Constellation[]> = {
  nebula: NEBULA,
  accretion: ACCRETION,
};
