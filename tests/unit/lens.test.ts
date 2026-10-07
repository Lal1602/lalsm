import { describe, expect, it } from "vitest";
import { QUALITY_PRESETS } from "@/lib/qualityGovernor";
import { ACTIVE_MS, REACH, SIGMA2, createLens, leaveLens, lensAmplitude, lensNear, moveLens, stepLens, type LensState } from "@/lib/space/lens";

/** Moves the pointer along a path at a given report rate, stepping the lens at a given frame rate. */
function run(lens: LensState, path: (t: number) => [number, number], ms: number, reportEvery: number, frameEvery: number, from = 0) {
  let nextReport = from;
  for (let t = from; t <= from + ms; t += frameEvery) {
    while (nextReport <= t) {
      const [x, y] = path(nextReport);
      moveLens(lens, x, y, nextReport);
      nextReport += reportEvery;
    }
    stepLens(lens, t);
  }
  return from + ms;
}

describe("the pointer's lens on the nebula", () => {
  it("starts under the pointer's first sighting, not flying in from a corner", () => {
    const lens = createLens();
    moveLens(lens, 640, 300, 1000);
    expect([lens.x, lens.y]).toEqual([640, 300]);
    expect(lens.amount).toBe(0);
  });

  it("comes up while the pointer moves and follows it closely", () => {
    const lens = createLens();
    run(lens, (t) => [100 + t * 0.4, 300], 600, 8, 16);
    expect(lens.amount).toBeGreaterThan(0.95);
    // It trails by the length of its short ease and no more.
    expect(Math.abs(lens.tx - lens.x)).toBeLessThan(0.4 * 80);
  });

  it("looks the same whether the mouse reports every 8 ms or every 16 ms, at 60 or 144 frames a second", () => {
    const path = (t: number): [number, number] => [200 + t * 0.5, 300 + 40 * Math.sin(t / 90)];
    const a = createLens();
    const b = createLens();
    run(a, path, 800, 8, 16);
    run(b, path, 800, 16, 7);
    expect(Math.abs(a.x - b.x)).toBeLessThan(12);
    expect(Math.abs(a.y - b.y)).toBeLessThan(6);
    expect(Math.abs(a.amount - b.amount)).toBeLessThan(0.02);
  });

  it("asks for frames of its own while the pointer moves and for a while after, then leaves the rest to the slow tick", () => {
    const lens = createLens();
    let end = run(lens, (t) => [100 + t, 300], 500, 8, 16);
    expect(stepLens(lens, end + 16)).toBe(true);
    // Just short of the active window after the last move: still asking; past it: not (the fade is slow and tiny).
    end = end + ACTIVE_MS - 40;
    for (let t = end - 400; t <= end; t += 16) stepLens(lens, t);
    expect(stepLens(lens, end)).toBe(true);
    for (let t = end; t <= end + 200; t += 16) stepLens(lens, t);
    expect(stepLens(lens, end + 220)).toBe(false);
    expect(lens.amount).toBeGreaterThan(0.2); // it has not gone: it is fading slowly
  });

  it("fades slowly while the pointer rests on the page and quickly when it leaves", () => {
    const rest = createLens();
    const gone = createLens();
    for (const l of [rest, gone]) {
      const end = run(l, (t) => [100 + t * 0.3, 300], 400, 8, 16);
      for (let t = end; t <= end + 600; t += 16) stepLens(l, t);
    }
    leaveLens(gone, 1000);
    const from = 1000;
    for (let t = from; t <= from + 1200; t += 16) {
      stepLens(rest, t);
      stepLens(gone, t);
    }
    expect(rest.amount).toBeGreaterThan(0.2);
    expect(gone.amount).toBeLessThan(0.05);
  });

  it("is gone entirely, not a flicker, once it has faded", () => {
    const lens = createLens();
    moveLens(lens, 300, 300, 0);
    for (let t = 16; t < 400; t += 16) {
      moveLens(lens, 300 + t, 300, t);
      stepLens(lens, t);
    }
    leaveLens(lens, 400);
    for (let t = 400; t < 6000; t += 16) stepLens(lens, t);
    expect(lens.amount).toBe(0);
    expect(stepLens(lens, 6016)).toBe(false);
  });

  it("only reaches the slots it can be seen in", () => {
    const slot = { left: 0, right: 1440, top: 200, bottom: 520 };
    expect(lensNear(slot, 700, 360)).toBe(true);
    expect(lensNear(slot, 700, 520 + REACH - 5)).toBe(true);
    expect(lensNear(slot, 700, 520 + REACH + 5)).toBe(false);
    expect(lensNear(slot, 700, 200 - REACH - 5)).toBe(false);
    // Past the reach the push is under a pixel (x is the larger of its two amplitudes).
    expect(Math.exp(-(REACH * REACH) / SIGMA2) * lensAmplitude(1440).x).toBeLessThan(1.1);
  });

  it("pushes as far as the old shader did: 0.07 of noise space, in pixels, more gently on a narrow page", () => {
    const wide = lensAmplitude(1440);
    expect(wide.x).toBeCloseTo(0.07 / 0.0022, 5);
    expect(wide.y).toBeCloseTo(0.07 / 0.0034, 5);
    expect(lensAmplitude(390).x).toBeLessThan(wide.x);
    expect(lensAmplitude(2560)).toEqual(wide);
  });

  it("gets cheaper with the quality tier, never absent", () => {
    const fps = [0, 1, 2, 3].map((t) => QUALITY_PRESETS[t as 0 | 1 | 2 | 3].lensFps);
    for (let i = 1; i < fps.length; i++) expect(fps[i]).toBeLessThanOrEqual(fps[i - 1]);
    expect(Math.min(...fps)).toBeGreaterThanOrEqual(24);
    // Always faster than the slow tick it replaces between draws.
    for (const t of [0, 1, 2, 3] as const) expect(QUALITY_PRESETS[t].lensFps).toBeGreaterThan(QUALITY_PRESETS[t].idleFps * 2);
  });
});
