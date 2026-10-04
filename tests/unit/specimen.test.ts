import { describe, expect, it } from "vitest";
import { buildGuides, capRatioFrom, nearestGuide } from "@/lib/hero/specimen";

describe("specimen guides", () => {
  it("puts a cap-height guide above a baseline guide for every line, by the font's own ratio", () => {
    const g = buildGuides([363, 552], 176, 0.7);
    expect(g).toHaveLength(4);
    expect(g.map((x) => x.kind)).toEqual(["cap", "base", "cap", "base"]);
    expect(g[1].y).toBe(363);
    expect(g[0].y).toBeCloseTo(363 - 176 * 0.7, 6);
    expect(g[2].y).toBeCloseTo(552 - 176 * 0.7, 6);
  });

  it("labels carry the measured figures, not typed ones", () => {
    const g = buildGuides([363], 176, 0.7);
    expect(g[0].label).toBe("CAP 123");
    expect(g[1].label).toBe("BASE");
    const bigger = buildGuides([363], 200, 0.7);
    expect(bigger[0].label).toBe("CAP 140");
    expect(bigger[1].label).toBe("BASE");
  });

  it("gives nothing for a size or ratio it cannot trust", () => {
    expect(buildGuides([100], 0, 0.7)).toEqual([]);
    expect(buildGuides([100], 176, 0)).toEqual([]);
    expect(buildGuides([100], NaN, 0.7)).toEqual([]);
    expect(buildGuides([NaN, 300], 176, 0.7)).toHaveLength(2);
  });

  it("finds the guide nearest the pointer, only within the threshold", () => {
    const g = buildGuides([363, 552], 176, 0.7);
    expect(nearestGuide(363, g, 44)).toBe(1);
    expect(nearestGuide(235, g, 44)).toBe(0);
    expect(nearestGuide(490, g, 44)).toBe(-1);
    expect(nearestGuide(460, g, 44)).toBe(2);
    expect(nearestGuide(NaN, g)).toBe(-1);
    expect(nearestGuide(100, [])).toBe(-1);
  });

  it("reads a cap ratio from a canvas measurement and refuses nonsense", () => {
    expect(capRatioFrom(123.2, 176)).toBeCloseTo(0.7, 3);
    expect(capRatioFrom(0, 176)).toBe(0);
    expect(capRatioFrom(10, 0)).toBe(0);
    expect(capRatioFrom(NaN, 176)).toBe(0);
  });
});
