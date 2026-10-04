import { describe, expect, it } from "vitest";
import { QualityGovernor, QUALITY_PRESETS } from "@/lib/qualityGovernor";

/** Feeds `seconds` of frames at a fixed frame time; returns tier changes seen. */
function run(g: QualityGovernor, startMs: number, seconds: number, frameMs: number) {
  const changes: number[] = [];
  let now = startMs;
  const end = startMs + seconds * 1000;
  while (now < end) {
    now += frameMs;
    const next = g.push(frameMs, now);
    if (next !== null) changes.push(next);
  }
  return { changes, now };
}

describe("QualityGovernor", () => {
  it("stays put on a smooth page", () => {
    const g = new QualityGovernor();
    expect(run(g, 0, 30, 16.7).changes).toEqual([]);
    expect(g.tier).toBe(0);
  });

  it("steps down under sustained jank, one tier per cooldown", () => {
    const g = new QualityGovernor();
    const { changes } = run(g, 0, 20, 40);
    expect(changes[0]).toBe(1);
    expect(changes.length).toBeGreaterThanOrEqual(2);
    expect(changes).toEqual([...changes].sort());
    expect(g.tier).toBeLessThanOrEqual(3);
  });

  it("ignores tab-switch gaps and a single hitch", () => {
    const g = new QualityGovernor();
    let now = 0;
    for (let i = 0; i < 400; i++) {
      now += 16.7;
      g.push(16.7, now);
    }
    now += 3000;
    expect(g.push(3000, now)).toBeNull();
    now += 80;
    expect(g.push(80, now)).toBeNull();
    expect(g.tier).toBe(0);
  });

  it("recovers slowly once the page is clean again, and not past a failed tier quickly", () => {
    const g = new QualityGovernor();
    const bad = run(g, 0, 8, 40);
    expect(g.tier).toBeGreaterThanOrEqual(1);
    const tierAfterBad = g.tier;

    // 6 seconds of clean frames is not enough evidence to climb back.
    const shortClean = run(g, bad.now, 6, 16.7);
    expect(shortClean.changes).toEqual([]);
    expect(g.tier).toBe(tierAfterBad);

    // A long clean stretch is.
    const longClean = run(g, shortClean.now, 60, 16.7);
    expect(longClean.changes.length).toBeGreaterThan(0);
    expect(g.tier).toBeLessThan(tierAfterBad);
  });

  it("never leaves the 0..3 range", () => {
    const g = new QualityGovernor();
    run(g, 0, 200, 60);
    expect(g.tier).toBe(3);
    run(g, 200_000, 600, 8);
    expect(g.tier).toBeGreaterThanOrEqual(0);
  });
});

describe("QUALITY_PRESETS", () => {
  it("only ever gets cheaper as the tier rises", () => {
    for (let t = 1; t <= 3; t++) {
      const a = QUALITY_PRESETS[(t - 1) as 0 | 1 | 2];
      const b = QUALITY_PRESETS[t as 1 | 2 | 3];
      expect(b.dpr).toBeLessThanOrEqual(a.dpr);
      expect(b.nebulaScale).toBeLessThanOrEqual(a.nebulaScale);
      expect(b.nebulaOctaves).toBeLessThanOrEqual(a.nebulaOctaves);
      expect(b.particles).toBeLessThanOrEqual(a.particles);
      expect(b.tubeScale).toBeLessThanOrEqual(a.tubeScale);
    }
  });
});
