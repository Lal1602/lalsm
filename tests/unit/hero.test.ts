import { describe, expect, it } from "vitest";
import { formatLat, formatLon } from "@/lib/hero/format";
import { kernBefore } from "@/lib/hero/kerning";

describe("hero ledger formatting", () => {
  it("writes the hemisphere instead of a sign", () => {
    expect(formatLat(-7.2756)).toBe("7.2756°S");
    expect(formatLat(7.2756)).toBe("7.2756°N");
    expect(formatLon(112.7937)).toBe("112.7937°E");
    expect(formatLon(-112.7937)).toBe("112.7937°W");
  });

  it("pads to four decimals and survives nonsense", () => {
    expect(formatLat(-7.2)).toBe("7.2000°S");
    expect(formatLat(NaN)).toBe("");
  });
});

describe("headline kerning", () => {
  it("restores the pairs the font kerns, and nothing else", () => {
    expect(kernBefore("a", "t")).toBeLessThan(0);
    expect(kernBefore("L", "O")).toBeLessThan(0);
    expect(kernBefore("r", "e")).toBe(0);
    expect(kernBefore(undefined, "C")).toBe(0);
  });
});

import { falloff, letterOffset, rulerScale } from "@/lib/hero/proximity";
import { atRest, stepSpring, type SpringState } from "@/lib/hero/spring";

describe("letter proximity", () => {
  it("falls from 1 at the pointer to 0 at the radius, and stays 0 beyond", () => {
    expect(falloff(0, 200)).toBe(1);
    expect(falloff(200, 200)).toBe(0);
    expect(falloff(900, 200)).toBe(0);
    expect(falloff(100, 200)).toBeGreaterThan(0);
    expect(falloff(100, 200)).toBeLessThan(1);
  });

  it("never rises with distance", () => {
    let last = 2;
    for (let d = 0; d <= 260; d += 5) {
      const f = falloff(d, 260);
      expect(f).toBeLessThanOrEqual(last);
      last = f;
    }
  });

  it("lifts the letter and leans it toward the pointer", () => {
    const right = letterOffset(80, 10);
    expect(right.y).toBeLessThan(0);
    expect(right.x).toBeGreaterThan(0);
    expect(right.r).toBeGreaterThan(0);
    const left = letterOffset(-80, 10);
    expect(left.x).toBeLessThan(0);
    expect(left.r).toBeLessThan(0);
  });

  it("does nothing outside the radius, and is bounded inside it", () => {
    expect(letterOffset(500, 0)).toEqual({ x: 0, y: 0, r: 0 });
    const o = letterOffset(1, 0, { lift: 7, pull: 3.5, lean: 2.2 });
    expect(Math.abs(o.y)).toBeLessThanOrEqual(7);
    expect(Math.abs(o.x)).toBeLessThanOrEqual(3.5);
    expect(Math.abs(o.r)).toBeLessThanOrEqual(2.2);
  });

  it("survives nonsense", () => {
    expect(letterOffset(NaN, 0)).toEqual({ x: 0, y: 0, r: 0 });
    expect(letterOffset(Infinity, 0)).toEqual({ x: 0, y: 0, r: 0 });
    expect(rulerScale(NaN)).toBe(1);
  });

  it("grows a ruler tick toward the pointer", () => {
    expect(rulerScale(0, 90, 2.2)).toBeCloseTo(2.2, 6);
    expect(rulerScale(90, 90, 2.2)).toBe(1);
    expect(rulerScale(30)).toBeGreaterThan(rulerScale(60));
  });
});

describe("spring", () => {
  const cfg = { stiffness: 170, damping: 17, mass: 0.7 };

  it("settles on its target", () => {
    let s: SpringState = { x: 0, v: 0 };
    for (let i = 0; i < 240; i++) s = stepSpring(s, 100, 1 / 60, cfg);
    expect(s.x).toBeCloseTo(100, 1);
    expect(atRest(s, 100)).toBe(true);
  });

  it("is not thrown by a long frame (a hitch or a returning tab)", () => {
    let s: SpringState = { x: 0, v: 0 };
    s = stepSpring(s, 100, 5, cfg);
    expect(Number.isFinite(s.x)).toBe(true);
    expect(Math.abs(s.x)).toBeLessThan(200);
  });

  it("ignores a non-positive or non-finite step", () => {
    const s: SpringState = { x: 3, v: 1 };
    expect(stepSpring(s, 9, 0, cfg)).toEqual(s);
    expect(stepSpring(s, 9, -1, cfg)).toEqual(s);
    expect(stepSpring(s, 9, NaN, cfg)).toEqual(s);
  });

  it("overshoots a lightly damped spring and not a heavily damped one", () => {
    const run = (damping: number) => {
      let s: SpringState = { x: 0, v: 0 };
      let peak = 0;
      for (let i = 0; i < 300; i++) {
        s = stepSpring(s, 100, 1 / 60, { stiffness: 170, damping, mass: 1 });
        peak = Math.max(peak, s.x);
      }
      return peak;
    };
    expect(run(6)).toBeGreaterThan(100);
    expect(run(60)).toBeLessThanOrEqual(100.001);
  });
});
