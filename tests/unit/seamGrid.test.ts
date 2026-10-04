import { describe, expect, it } from "vitest";
import { SEAM_GRID, gridPad } from "@/lib/seamGrid";

describe("seam grid", () => {
  it("pads to the next multiple of the grid, and not at all when already on it", () => {
    expect(gridPad(0)).toBe(0);
    expect(gridPad(SEAM_GRID * 7)).toBe(0);
    expect(gridPad(2867.84375)).toBeCloseTo(SEAM_GRID - (2867.84375 % SEAM_GRID), 6);
    expect(gridPad(1)).toBe(SEAM_GRID - 1);
    expect(gridPad(SEAM_GRID - 0.001)).toBe(0); // within rounding of the line
    expect(gridPad(SEAM_GRID * 3 + 0.001)).toBe(0);
  });

  it("always lands the boundary on a whole device pixel at the common scale factors", () => {
    for (const dpr of [1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.625, 2.75, 3, 1.1, 1.2, 1.5625, 1.375, 1.65, 1.875, 1.925, 0.9375, 1.125, 0.9, 0.8]) {
      for (const y of [1996.31, 2867.84375, 5724.84375, 123.456, 9999.99]) {
        const end = y + gridPad(y);
        expect(Math.abs(end * dpr - Math.round(end * dpr))).toBeLessThan(1e-6);
        expect(gridPad(y)).toBeLessThan(SEAM_GRID);
        expect(gridPad(y)).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("is safe with nonsense", () => {
    expect(gridPad(NaN)).toBe(0);
    expect(gridPad(Infinity)).toBe(0);
    expect(gridPad(100, 0)).toBe(0);
    expect(gridPad(-3)).toBe(3); // -3 is 37 past a line: 3 to the next
  });
});
