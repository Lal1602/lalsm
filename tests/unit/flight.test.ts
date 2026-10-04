import { describe, expect, it } from "vitest";
import {
  MAP_H,
  MAP_W,
  PATH_D,
  STATION_PTS,
  STATION_U,
  autoProgress,
  nearestStation,
  pointAt,
  stagePosition,
  uAtX,
} from "@/lib/flight/path";
import { CUMULATIVE, SHARE, STAGES, TOTAL_RANGE, elapsedAtStage, midWeeks, weeksOf } from "@/lib/flight/stages";

describe("flight path", () => {
  it("is a real SVG path inside the map", () => {
    expect(PATH_D.startsWith("M ")).toBe(true);
    expect(PATH_D.match(/C/g)?.length).toBe(STATION_PTS.length + 1);
    for (let u = 0; u <= 1; u += 0.01) {
      const p = pointAt(u);
      expect(p.x).toBeGreaterThanOrEqual(-0.5);
      expect(p.x).toBeLessThanOrEqual(MAP_W + 0.5);
      expect(p.y).toBeGreaterThan(0);
      expect(p.y).toBeLessThan(MAP_H);
    }
  });

  it("runs from the launch pad to the exit, passing through every station in order", () => {
    expect(pointAt(0).x).toBeCloseTo(0, 0);
    expect(pointAt(1).x).toBeCloseTo(MAP_W, 0);
    for (let i = 1; i < STATION_U.length; i++) expect(STATION_U[i]).toBeGreaterThan(STATION_U[i - 1]!);
    expect(STATION_U[0]).toBeGreaterThan(0);
    expect(STATION_U[STATION_U.length - 1]).toBeLessThan(1);
    STATION_PTS.forEach(([x, y], i) => {
      const p = pointAt(STATION_U[i]!);
      expect(Math.abs(p.x - x)).toBeLessThan(0.6);
      expect(Math.abs(p.y - y)).toBeLessThan(0.6);
    });
  });

  it("only ever moves to the right, so dragging along x is unambiguous", () => {
    let last = -1;
    for (let u = 0; u <= 1; u += 0.002) {
      const x = pointAt(u).x;
      expect(x).toBeGreaterThanOrEqual(last - 1e-9);
      last = x;
    }
  });

  it("maps an x back to the progress that is at it", () => {
    for (let x = 0; x <= MAP_W; x += 37) {
      expect(pointAt(uAtX(x)).x).toBeCloseTo(x, 0);
    }
    expect(uAtX(-50)).toBe(0);
    expect(uAtX(5000)).toBeCloseTo(1, 5);
  });

  it("turns smoothly: the heading never jumps between neighbouring points", () => {
    let prev = pointAt(0).angle;
    for (let u = 0.002; u <= 1; u += 0.002) {
      const a = pointAt(u).angle;
      expect(Math.abs(a - prev)).toBeLessThan(0.12);
      prev = a;
    }
  });

  it("finds the nearest station and the fractional position between them", () => {
    STATION_U.forEach((u, i) => {
      expect(nearestStation(u)).toBe(i);
      expect(stagePosition(u)).toBeCloseTo(i + 1, 6);
    });
    expect(nearestStation(0)).toBe(0);
    expect(nearestStation(1)).toBe(STATION_U.length - 1);
    expect(stagePosition(0)).toBe(0);
    expect(stagePosition(1)).toBe(STATION_U.length);
    let last = -1;
    for (let u = 0; u <= 1; u += 0.01) {
      const p = stagePosition(u);
      expect(p).toBeGreaterThanOrEqual(last);
      last = p;
    }
  });

  it("flies from the pad to a little past the last station over the section, never beyond the exit", () => {
    expect(autoProgress(0)).toBe(0);
    expect(autoProgress(-3)).toBe(0);
    expect(autoProgress(1)).toBeGreaterThan(STATION_U[STATION_U.length - 1]!);
    expect(autoProgress(1)).toBeLessThanOrEqual(1);
    expect(autoProgress(9)).toBe(autoProgress(1));
    expect(nearestStation(autoProgress(1))).toBe(STATION_U.length - 1);
    // An unmeasured scroll container reports NaN: the ship must stay on the pad, not vanish.
    expect(autoProgress(NaN)).toBe(0);
    expect(pointAt(NaN).x).toBeCloseTo(0, 0);
    expect(Number.isFinite(pointAt(NaN).y)).toBe(true);
  });
});

describe("stages", () => {
  it("derives every figure from the printed ranges", () => {
    expect(STAGES.map((s) => s.time)).toEqual(["1–2 weeks", "2–3 weeks", "3–6 weeks", "3–5 days"]);
    // The printed text and the numbers agree.
    for (const s of STAGES) expect(s.time).toBe(`${s.range[0]}–${s.range[1]} ${s.unit}`);
    expect(weeksOf(STAGES[3]!)[0]).toBeCloseTo(3 / 7);
    expect(midWeeks(STAGES[0]!)).toBe(1.5);
  });

  it("splits the job into shares that add up to the whole", () => {
    expect(SHARE.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 10);
    expect(CUMULATIVE[CUMULATIVE.length - 1]).toBeCloseTo(1, 10);
    for (let i = 1; i < CUMULATIVE.length; i++) expect(CUMULATIVE[i]).toBeGreaterThan(CUMULATIVE[i - 1]!);
    // Build is the longest stage and Launch the shortest.
    expect(SHARE[2]).toBeGreaterThan(SHARE[0]!);
    expect(SHARE[3]).toBeLessThan(SHARE[1]!);
  });

  it("reports an end-to-end range that matches the stages", () => {
    expect(TOTAL_RANGE[0]).toBeCloseTo(1 + 2 + 3 + 3 / 7);
    expect(TOTAL_RANGE[1]).toBeCloseTo(2 + 3 + 6 + 5 / 7);
  });

  it("reads elapsed time continuously along the stations", () => {
    expect(elapsedAtStage(0)).toBe(0);
    CUMULATIVE.forEach((c, i) => expect(elapsedAtStage(i + 1)).toBeCloseTo(c, 10));
    expect(elapsedAtStage(99)).toBeCloseTo(1, 10);
    let last = -1;
    for (let p = 0; p <= 4; p += 0.05) {
      const e = elapsedAtStage(p);
      expect(e).toBeGreaterThanOrEqual(last);
      last = e;
    }
  });
});
