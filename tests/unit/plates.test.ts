import { describe, expect, it } from "vitest";
import {
  SLOTS,
  atlasCell,
  atlasRows,
  hitPlate,
  platePose,
  plateSize,
  projectAt,
  railTarget,
  snapTarget,
  springStep,
  wrapIndex,
} from "@/lib/plates/layout";
import { ATLAS_COLS, cellSizeFor, coverRect, pool } from "@/lib/plates/atlas";

describe("plate pose", () => {
  const { plateW, plateH, pitch } = plateSize(1376);

  it("puts the focused plate at the centre, full size, upright and in focus", () => {
    const p = platePose(0, plateW, plateH, pitch);
    expect(p).toMatchObject({ x: 0, y: 0, scale: 1, tilt: 0, focus: 1 });
  });

  it("shrinks, tilts and defocuses plates further from the centre, symmetrically", () => {
    const a = platePose(1, plateW, plateH, pitch);
    const b = platePose(-1, plateW, plateH, pitch);
    expect(a.scale).toBeCloseTo(0.78);
    expect(a.focus).toBeCloseTo(0);
    expect(a.x).toBe(pitch);
    expect(b.x).toBe(-pitch);
    expect(a.tilt).toBeCloseTo(-b.tilt);
    expect(a.y).toBeCloseTo(b.y);
    expect(platePose(2, plateW, plateH, pitch).scale).toBeCloseTo(0.66);
  });

  it("never lets neighbouring plates overlap, at any point of a move", () => {
    // Two adjacent plates a whole slot apart, sampled across a full transition.
    for (let t = 0; t <= 1; t += 0.05) {
      const left = platePose(t - 1, plateW, plateH, pitch);
      const right = platePose(t, plateW, plateH, pitch);
      const gap = right.x - left.x - (plateW * left.scale) / 2 - (plateW * right.scale) / 2;
      expect(gap).toBeGreaterThan(-4); // a few px of tilt overhang at most
    }
  });

  it("keeps a plate on a 2:1 picture with a frame, at every width", () => {
    for (const w of [320, 390, 700, 1024, 1376, 1920]) {
      const s = plateSize(w);
      expect(s.plateH).toBe(Math.round((s.plateW - 20) / 2 + 20));
      expect(s.stageH).toBeGreaterThan(s.plateH);
      expect(s.plateW).toBeLessThanOrEqual(w); // fits the screen
    }
  });

  it("shows the centre plate plus a sliver of each neighbour on a phone", () => {
    const { plateW: pw, plateH: ph, pitch: pt } = plateSize(358);
    const n = platePose(1, pw, ph, pt);
    const neighbourLeftEdge = n.x - (pw * n.scale) / 2;
    expect(neighbourLeftEdge).toBeLessThan(358 / 2); // starts on screen
    expect(neighbourLeftEdge).toBeGreaterThan(pw / 2 - 20); // but is only a sliver
  });
});

describe("rail positions", () => {
  it("wraps indices both ways", () => {
    expect(wrapIndex(0, 18)).toBe(0);
    expect(wrapIndex(18, 18)).toBe(0);
    expect(wrapIndex(-1, 18)).toBe(17);
    expect(wrapIndex(-19, 18)).toBe(17);
    expect(projectAt(37, 18)).toBe(1);
  });

  it("goes to a project by the shortest way round", () => {
    expect(railTarget(0, 1, 18)).toBe(1);
    expect(railTarget(0, 17, 18)).toBe(-1);
    expect(railTarget(17, 0, 18)).toBe(18);
    expect(railTarget(40, 4, 18)).toBe(40 + (4 - wrapIndex(40, 18)));
    // Never more than half the rail away.
    for (let pos = -30; pos <= 30; pos++) {
      for (let target = 0; target < 18; target++) {
        const t = railTarget(pos, target, 18);
        expect(Math.abs(t - pos)).toBeLessThanOrEqual(9);
        expect(wrapIndex(t, 18)).toBe(target);
      }
    }
  });

  it("settles a released drag on the nearest plate, nudged by momentum", () => {
    expect(snapTarget(2.2, 0)).toBe(2);
    expect(snapTarget(2.45, 0)).toBe(2);
    expect(snapTarget(2.45, 3)).toBe(3);
    expect(snapTarget(2.45, -3)).toBe(2);
  });

  it("springs to its target without overshooting, even after a long frame", () => {
    let s = { pos: 0, vel: 0 };
    let peak = 0;
    for (let i = 0; i < 240; i++) {
      s = springStep(s.pos, s.vel, 3, 1 / 60);
      peak = Math.max(peak, s.pos);
    }
    expect(s.pos).toBeCloseTo(3, 2);
    expect(peak).toBeLessThan(3.05);
    const long = springStep(0, 0, 3, 5); // a stalled tab waking up
    expect(Number.isFinite(long.pos)).toBe(true);
    expect(Math.abs(long.pos)).toBeLessThan(10);
  });
});

describe("clicking plates", () => {
  const size = plateSize(1376);
  const base = { stageW: 1376, count: 18, ...size };
  const centre = { x: 1376 / 2, y: size.stageH / 2 };

  it("finds the centred plate, and the neighbours either side", () => {
    expect(hitPlate({ ...base, ...centre, pos: 0 })).toEqual({ rail: 0, project: 0 });
    expect(hitPlate({ ...base, x: centre.x + size.pitch, y: centre.y, pos: 0 })).toEqual({ rail: 1, project: 1 });
    expect(hitPlate({ ...base, x: centre.x - size.pitch, y: centre.y, pos: 0 })).toEqual({ rail: -1, project: 17 });
  });

  it("returns nothing for empty space", () => {
    expect(hitPlate({ ...base, x: 4, y: 4, pos: 0 })).toBeNull();
    expect(hitPlate({ ...base, x: centre.x, y: size.stageH - 2, pos: 0 })).toBeNull();
  });

  it("follows the rail as it moves", () => {
    expect(hitPlate({ ...base, ...centre, pos: 5 })?.project).toBe(5);
    expect(hitPlate({ ...base, ...centre, pos: 18 + 3 })?.project).toBe(3);
  });

  it("only ever considers the plates that are drawn", () => {
    expect(SLOTS).toBeGreaterThanOrEqual(5);
  });
});

describe("texture atlas", () => {
  it("gives every project its own cell inside the atlas", () => {
    const rows = atlasRows(18, ATLAS_COLS);
    expect(rows).toBe(5);
    const seen = new Set<string>();
    for (let i = 0; i < 18; i++) {
      const c = atlasCell(i, ATLAS_COLS, rows);
      expect(c.u0).toBeGreaterThanOrEqual(0);
      expect(c.u1).toBeLessThanOrEqual(1);
      expect(c.v1).toBeLessThanOrEqual(1);
      seen.add(`${c.col},${c.row}`);
    }
    expect(seen.size).toBe(18);
  });

  it("sizes cells for the screen and the GPU's texture limit", () => {
    expect(cellSizeFor(1440, 8192)).toEqual({ w: 512, h: 256 });
    expect(cellSizeFor(390, 8192)).toEqual({ w: 384, h: 192 });
    const small = cellSizeFor(1440, 1024);
    expect(small.w * ATLAS_COLS).toBeLessThanOrEqual(1024);
    expect(small.h).toBe(small.w / 2);
  });

  it("crops a picture to cover its cell without stretching it", () => {
    // Wider than 2:1: the sides are cut off.
    const wide = coverRect(1900, 600, 512, 256);
    expect(wide.dh).toBeCloseTo(256);
    expect(wide.dw).toBeGreaterThan(512);
    expect(wide.dx).toBeLessThan(0);
    // Narrower than 2:1: the top and bottom are cut off.
    const tall = coverRect(600, 400, 512, 256);
    expect(tall.dw).toBeCloseTo(512);
    expect(tall.dh).toBeGreaterThan(256);
    // Aspect is preserved either way.
    expect(wide.dw / wide.dh).toBeCloseTo(1900 / 600);
    expect(tall.dw / tall.dh).toBeCloseTo(600 / 400);
  });

  it("loads with a bounded number of requests in flight and survives a failure", async () => {
    let inFlight = 0;
    let peak = 0;
    const done: number[] = [];
    const errors: number[] = [];
    await pool(
      [1, 2, 3, 4, 5, 6, 7, 8],
      3,
      async (n) => {
        inFlight++;
        peak = Math.max(peak, inFlight);
        await new Promise((r) => setTimeout(r, 2));
        inFlight--;
        if (n === 4) throw new Error("boom");
        done.push(n);
      },
      (n) => errors.push(n),
    );
    expect(peak).toBeLessThanOrEqual(3);
    expect(errors).toEqual([4]);
    expect(done.sort()).toEqual([1, 2, 3, 5, 6, 7, 8]);
  });
});
