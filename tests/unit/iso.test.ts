import { describe, expect, it } from "vitest";
import { CX, ISO_MATRIX, LIFT, OPEN, PLATE_H, S, SPACING, STAGE_H, T, TOP0, W, baseTops, collapsedOffsets, iso, offsets, plateFaces, poleEnds } from "@/lib/build/iso";

describe("the isometric plate", () => {
  it("puts the square's four corners on a diamond, centred on the plate", () => {
    expect(iso(0, 0)).toEqual([CX, 0]);
    const [rx, ry] = iso(S, 0);
    const [lx, ly] = iso(0, S);
    const [bx, by] = iso(S, S);
    expect(rx - CX).toBeCloseTo(CX - lx, 6);
    expect(ry).toBeCloseTo(S / 2, 6);
    expect(ly).toBeCloseTo(S / 2, 6);
    expect(bx).toBeCloseTo(CX, 6);
    expect(by).toBeCloseTo(S, 6);
    expect(rx).toBeCloseTo(W, 0);
    expect(lx).toBeCloseTo(0, 0);
  });

  it("agrees with the matrix the plate is drawn through", () => {
    const m = /matrix\(([\d.-]+) ([\d.-]+) ([\d.-]+) ([\d.-]+) ([\d.-]+) ([\d.-]+)\)/.exec(ISO_MATRIX)!.slice(1).map(Number);
    for (const [x, y] of [
      [0, 0],
      [S, 0],
      [37, 151],
      [S, S],
    ] as const) {
      const [px, py] = iso(x, y);
      expect(m[0]! * x + m[2]! * y + m[4]!).toBeCloseTo(px, 3);
      expect(m[1]! * x + m[3]! * y + m[5]!).toBeCloseTo(py, 3);
    }
  });

  it("is as tall as a diamond and its edge, and the stage holds three of them with room to move", () => {
    expect(PLATE_H).toBe(S + T);
    expect(STAGE_H).toBeGreaterThanOrEqual(baseTops(3)[2]! + PLATE_H);
    // The top plate can open upward by the most any plate does, and stay inside the stage.
    expect(TOP0 - OPEN - LIFT).toBeGreaterThanOrEqual(0);
  });

  it("makes three polygons of a plate: the top and the two faces of its edge", () => {
    const f = plateFaces();
    expect(f.top.split(" ")).toHaveLength(4);
    expect(f.leftEdge.split(" ")).toHaveLength(4);
    expect(f.rightEdge.split(" ")).toHaveLength(4);
  });
});

describe("where the plates are", () => {
  it("rests the plates one spacing apart, from the first", () => {
    expect(baseTops(3)).toEqual([TOP0, TOP0 + SPACING, TOP0 + 2 * SPACING]);
  });

  it("opens the plates above the inspected one and lifts it; the ones below stay", () => {
    expect(offsets(3, 0)).toEqual([-LIFT, 0, 0]);
    expect(offsets(3, 1)).toEqual([-OPEN, -LIFT, 0]);
    expect(offsets(3, 2)).toEqual([-OPEN, -OPEN, -LIFT]);
    expect(offsets(3, null)).toEqual([0, 0, 0]);
  });

  it("keeps every plate inside the stage, whichever is open", () => {
    for (let a = 0; a < 3; a++) {
      const o = offsets(3, a);
      baseTops(3).forEach((top, i) => {
        expect(top + o[i]!).toBeGreaterThanOrEqual(0);
        expect(top + o[i]! + PLATE_H).toBeLessThanOrEqual(STAGE_H);
      });
    }
  });

  it("collapses the stack toward its middle, with the middle plate where it is", () => {
    const c = collapsedOffsets(3);
    expect(c[1]).toBe(0);
    expect(c[0]).toBeGreaterThan(0);
    expect(c[2]).toBeLessThan(0);
    expect(c[0]).toBeCloseTo(-c[2]!, 6);
    // Collapsed, the plates are closer together than at rest.
    const tops = baseTops(3).map((t, i) => t + c[i]!);
    expect(tops[1]! - tops[0]!).toBeLessThan(SPACING);
    expect(tops[2]! - tops[1]!).toBeLessThan(SPACING);
  });
});

describe("the wires between plates", () => {
  it("run from under the plate above to the face of the plate below, mirrored left and right", () => {
    const l = poleEnds(62, 0, SPACING);
    const r = poleEnds(W - 62, 0, SPACING);
    expect(l[0]).toBeCloseTo(r[0], 6);
    expect(l[1]).toBeCloseTo(r[1], 6);
    expect(l[1]).toBeGreaterThan(l[0]);
  });

  it("are longer when the plates are further apart and follow them", () => {
    const rest = poleEnds(62, 0, SPACING);
    const open = poleEnds(62, -OPEN, SPACING);
    expect(open[1] - open[0]).toBeGreaterThan(rest[1] - rest[0]);
    expect(poleEnds(62, 10, SPACING + 10)[0] - rest[0]).toBe(10);
  });

  it("meet the corner of the diamond nearer the middle higher up, as the edge of a diamond does", () => {
    // Near the left corner the lower plate's upper edge is low; nearer the centre line it is higher.
    expect(poleEnds(20, 0, SPACING)[1]).toBeGreaterThan(poleEnds(120, 0, SPACING)[1]);
  });
});
