/**
 * The grid the section boundaries around a nebula seam are snapped to.
 *
 * Each half of a seam is its own canvas, and the two meet at the boundary between two
 * sections. When that boundary lands inside a device pixel (it does at every fractional
 * pixel ratio: Windows scaling of 125% / 150%, browser zoom, most phones) one canvas
 * covers only part of that row of pixels and the other starts on the next, so a hairline
 * of the dark page shows through across the screen. Nothing can overlap to hide it (each
 * half is clipped by its own section, and overlaying a second layer only doubles the glow
 * into a visible line), so the boundary itself is moved onto a whole device pixel.
 *
 * 80 css px is a whole number of device pixels at every ratio with a denominator of 2, 4, 5,
 * 8, 10 or 16: Windows scaling of 125/150/175/225%, phones (2.625), browser zoom of 110/125/150/175%
 * and the products of the two (1.5625 = 125% x 125%, 1.375, 1.875, 0.9375 ...), and of course 1 and 2.
 * One grid serves them all; the section above the boundary grows by less than 80px to get there.
 */
export const SEAM_GRID = 80;

/** Extra css px that make something ending at document position `y` end on the grid (0 if it already does). */
export function gridPad(y: number, grid: number = SEAM_GRID): number {
  if (!Number.isFinite(y) || grid <= 0) return 0;
  const r = ((y % grid) + grid) % grid;
  return r < 0.01 || r > grid - 0.01 ? 0 : grid - r;
}
