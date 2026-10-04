import { describe, expect, it } from "vitest";
import { HEADLINE_LINES } from "@/components/ui/hero/Headline";
import { SKELETON, nodesFor, pointsAttr, skeletonFor } from "@/lib/hero/skeleton";

const letters = Array.from(new Set(HEADLINE_LINES.join("").toUpperCase().split("")));

describe("letter skeletons", () => {
  it("has a skeleton for every letter the headline uses", () => {
    for (const ch of letters) expect(skeletonFor(ch).length, ch).toBeGreaterThan(0);
  });

  it("keeps every point on the 100 x 100 grid, and every stroke at least a line", () => {
    for (const [letter, strokes] of Object.entries(SKELETON)) {
      for (const stroke of strokes) {
        expect(stroke.length, letter).toBeGreaterThanOrEqual(2);
        for (const [x, y] of stroke) {
          expect(x, letter).toBeGreaterThanOrEqual(0);
          expect(x, letter).toBeLessThanOrEqual(100);
          expect(y, letter).toBeGreaterThanOrEqual(0);
          expect(y, letter).toBeLessThanOrEqual(100);
        }
      }
    }
  });

  it("looks letters up without regard to case, and gives nothing for others", () => {
    expect(skeletonFor("c")).toEqual(skeletonFor("C"));
    expect(skeletonFor("1")).toEqual([]);
    expect(skeletonFor(".")).toEqual([]);
  });

  it("puts one star on a joint shared by two strokes, not two", () => {
    // The R's leg starts on the bowl's lowest point: that point is one star.
    const nodes = nodesFor("R");
    const keys = nodes.map(([x, y]) => `${x},${y}`);
    expect(new Set(keys).size).toBe(keys.length);
    expect(nodes.length).toBeLessThan(skeletonFor("R").flat().length);
  });

  it("writes an SVG points attribute", () => {
    expect(pointsAttr([[1, 2], [3, 4]])).toBe("1,2 3,4");
  });

  it("closes the round letters on themselves", () => {
    for (const ch of ["O", "D"]) {
      const s = skeletonFor(ch)[0];
      expect(s[0]).toEqual(s[s.length - 1]);
    }
  });
});
