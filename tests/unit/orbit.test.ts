import { describe, expect, it } from "vitest";
import { OUTER_OVER_DISC, RINGS, circlePath, circumference, nearestRing, ringRadii, ringText, spinFromScroll } from "@/lib/hero/orbit";

describe("orbit ring text", () => {
  it("fills roughly a circle, in whole words, and never splits one", () => {
    for (const spec of RINGS) {
      const c = circumference(480 * spec.scale);
      const text = ringText(spec, c);
      expect(text.length).toBeGreaterThan(0);
      expect(text.endsWith(" · ")).toBe(true);
      // Every piece between the dots is one of the words, whole.
      const pieces = text.split(" · ").filter(Boolean);
      const words = spec.words.map((w) => w.toUpperCase());
      for (const piece of pieces) expect(words).toContain(piece);
    }
  });

  it("is deterministic (the server and the client must draw the same ring)", () => {
    const c = circumference(480);
    expect(ringText(RINGS[0], c)).toBe(ringText(RINGS[0], c));
  });

  it("gives a longer string to a longer circle, and survives nonsense", () => {
    expect(ringText(RINGS[0], 6000).length).toBeGreaterThan(ringText(RINGS[0], 2000).length);
    expect(ringText(RINGS[0], 0)).toBe("");
    expect(ringText(RINGS[0], NaN)).toBe("");
  });

  it("only uses real content: the role, the name, the place, the stack, the coordinates", () => {
    const all = RINGS.flatMap((r) => r.words).join(" ");
    expect(all).toMatch(/Creative Developer/);
    expect(all).toMatch(/Bilal Sanayu Majid/);
    expect(all).toMatch(/Surabaya/);
    expect(all).toMatch(/7\.2756°S 112\.7937°E/);
    expect(all).not.toMatch(/lorem|ipsum/i);
  });
});

describe("orbit geometry", () => {
  it("measures a circle", () => {
    expect(circumference(100)).toBeCloseTo(628.3185, 3);
  });

  it("writes a circle path that starts at the top and closes on itself", () => {
    const d = circlePath(500, 500, 100);
    expect(d.startsWith("M 500 400")).toBe(true);
    expect(d.match(/a 100 100/g)?.length).toBe(2);
  });

  it("finds the ring nearest the pointer", () => {
    expect(nearestRing(480, [480, 300])).toEqual({ index: 0, gap: 0 });
    expect(nearestRing(310, [480, 300])).toEqual({ index: 1, gap: 10 });
    expect(nearestRing(NaN, [480, 300])).toBeNull();
    expect(nearestRing(100, [])).toBeNull();
  });
});

describe("spin from scroll", () => {
  it("adds nothing for a gentle scroll and a lot for a fling", () => {
    expect(Math.abs(spinFromScroll(120))).toBeLessThan(0.05);
    expect(Math.abs(spinFromScroll(6000))).toBeGreaterThan(2);
  });

  it("follows the direction of the scroll, is bounded, and survives nonsense", () => {
    expect(spinFromScroll(2000)).toBeGreaterThan(0);
    expect(spinFromScroll(-2000)).toBeLessThan(0);
    expect(Math.abs(spinFromScroll(1e9))).toBeLessThanOrEqual(2.4);
    expect(spinFromScroll(NaN)).toBe(0);
    expect(spinFromScroll(Infinity)).toBe(0);
  });
});

describe("rings round a disc", () => {
  it("sit outside the disc, in order, with room between the rings", () => {
    const { radii } = ringRadii(161);
    expect(radii).toHaveLength(RINGS.length);
    expect(radii[0]).toBeCloseTo(161 * OUTER_OVER_DISC, 6);
    for (let i = 1; i < radii.length; i++) expect(radii[i]).toBeLessThan(radii[i - 1]);
    // The inner ring clears the disc by a margin, and the two rings are apart by more than the inner ring's letters are tall.
    expect(radii[radii.length - 1]).toBeGreaterThan(161 * 1.2);
    expect(radii[0] - radii[1]).toBeGreaterThan(RINGS[1].fontSize * 0.7 * (radii[0] / 480));
  });

  it("scale with the disc, and the reach is past the outer ring by the height of its letters", () => {
    const a = ringRadii(100);
    const b = ringRadii(200);
    expect(b.radii[0] / a.radii[0]).toBeCloseTo(2, 6);
    expect(b.boxHalf / a.boxHalf).toBeCloseTo(2, 6);
    expect(a.reach).toBeGreaterThan(a.radii[0]);
    expect(a.reach - a.radii[0]).toBeCloseTo(RINGS[0].fontSize * 0.7 * (a.radii[0] / 480), 6);
  });
});
