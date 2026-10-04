import { describe, expect, it } from "vitest";
import {
  CROP,
  boxBlur,
  localNormalise,
  COLS,
  DOT_MAX,
  clampToDisc,
  dotRadius,
  hexGrid,
  inkOf,
  lensDiameter,
  luma,
  percentiles,
  stretch,
  waveFront,
} from "@/lib/hero/halftone";

describe("hexGrid", () => {
  const g = hexGrid(COLS);

  it("fills the disc and nothing outside it", () => {
    expect(g.n).toBeGreaterThan(4600);
    expect(g.n).toBeLessThan(5600);
    for (let i = 0; i < g.n; i++) expect(Math.hypot(g.x[i], g.y[i])).toBeLessThanOrEqual(1);
  });

  it("keeps every whole dot inside the rim", () => {
    for (let i = 0; i < g.n; i++) expect(Math.hypot(g.x[i], g.y[i]) + g.pitch * DOT_MAX).toBeLessThanOrEqual(1 + 1e-6);
  });

  it("is a staggered lattice: neighbours in a row are a pitch apart, and the next row is half a pitch across", () => {
    // Take the row nearest the centre and the one under it.
    const rowStep = (g.pitch * Math.sqrt(3)) / 2;
    const ys = Array.from(new Set(Array.from(g.y).map((v) => Math.round(v * 1e4) / 1e4))).sort((a, b) => a - b);
    expect(ys.length).toBeGreaterThan(50);
    expect(ys[1] - ys[0]).toBeCloseTo(rowStep, 3);
    const inRow = (y: number) =>
      Array.from(g.x)
        .filter((_, i) => Math.abs(g.y[i] - y) < 1e-4)
        .sort((a, b) => a - b);
    const a = inRow(ys[30]);
    const b = inRow(ys[31]);
    expect(a[1] - a[0]).toBeCloseTo(g.pitch, 4);
    const offset = Math.abs(a[10] - b[10]);
    expect(Math.min(offset, g.pitch - offset)).toBeCloseTo(g.pitch / 2, 3);
  });

  it("is symmetric left to right and top to bottom", () => {
    let sx = 0;
    let sy = 0;
    for (let i = 0; i < g.n; i++) {
      sx += g.x[i];
      sy += g.y[i];
    }
    expect(Math.abs(sx / g.n)).toBeLessThan(0.01);
    expect(Math.abs(sy / g.n)).toBeLessThan(0.01);
  });
});

describe("tone to dot", () => {
  it("luma is 0 for black, 1 for white, and green weighs most", () => {
    expect(luma(0, 0, 0)).toBe(0);
    expect(luma(255, 255, 255)).toBeCloseTo(1, 6);
    expect(luma(0, 255, 0)).toBeGreaterThan(luma(255, 0, 0));
    expect(luma(255, 0, 0)).toBeGreaterThan(luma(0, 0, 255));
  });

  it("stretch maps the photograph's own black and white to 0 and 1, and clamps outside them", () => {
    const lv = { lo: 0.2, hi: 0.8 };
    expect(stretch(0.2, lv)).toBe(0);
    expect(stretch(0.8, lv)).toBe(1);
    expect(stretch(0.5, lv)).toBeCloseTo(0.5, 6);
    expect(stretch(0, lv)).toBe(0);
    expect(stretch(1, lv)).toBe(1);
  });

  it("percentiles ignore the extreme tails and survive a flat image", () => {
    const v = Array.from({ length: 101 }, (_, i) => i / 100);
    const p = percentiles(v, 0.05, 0.95);
    expect(p.lo).toBeCloseTo(0.05, 2);
    expect(p.hi).toBeCloseTo(0.95, 2);
    const flat = percentiles([0.4, 0.4, 0.4], 0.05, 0.95);
    expect(flat.hi).toBeGreaterThan(flat.lo);
  });

  it("dot radius grows with tone, is capped under half a pitch, and drops dots too small to print", () => {
    expect(dotRadius(0)).toBe(0);
    expect(dotRadius(0.001)).toBe(0);
    let last = 0;
    for (let t = 0.1; t <= 1; t += 0.1) {
      const r = dotRadius(t);
      expect(r).toBeGreaterThan(last);
      last = r;
    }
    expect(dotRadius(1)).toBeCloseTo(DOT_MAX, 6);
    expect(dotRadius(2)).toBeCloseTo(DOT_MAX, 6);
    // Area follows tone: half the tone, half the ink.
    expect(dotRadius(0.5) ** 2 / dotRadius(1) ** 2).toBeCloseTo(0.5, 2);
  });

  it("three inks, in order of tone", () => {
    expect([0, 0.2, 0.5, 0.9, 1].map(inkOf)).toEqual([0, 0, 1, 2, 2]);
  });
});

describe("boxBlur and localNormalise", () => {
  it("blurring a flat image changes nothing, and a single bright pixel is spread out and dimmed", () => {
    const flat = new Float32Array(10 * 10).fill(0.3);
    for (const v of boxBlur(flat, 10, 2)) expect(v).toBeCloseTo(0.3, 5);
    const side = 11;
    const one = new Float32Array(side * side);
    one[5 * side + 5] = 1;
    const b = boxBlur(one, side, 2);
    expect(b[5 * side + 5]).toBeCloseTo(1 / 25, 5);
    expect(b[5 * side + 7]).toBeCloseTo(1 / 25, 5);
    expect(b[5 * side + 8]).toBe(0);
  });

  it("brings out a face against a field of the same average: a mid tone next to a mid tone becomes light against dark", () => {
    const side = 40;
    const img = new Float32Array(side * side).fill(0.5);
    // A small feature a little lighter than its surroundings, and one a little darker.
    for (let y = 18; y < 22; y++) for (let x = 8; x < 12; x++) img[y * side + x] = 0.56;
    for (let y = 18; y < 22; y++) for (let x = 28; x < 32; x++) img[y * side + x] = 0.44;
    const out = localNormalise(img, side, 6, 1, 0);
    const light = out[20 * side + 10];
    const dark = out[20 * side + 30];
    expect(light).toBeGreaterThan(0.6);
    expect(dark).toBeLessThan(0.4);
    // Far from either, nothing has moved.
    expect(out[3 * side + 20]).toBeCloseTo(0.5, 2);
  });

  it("keeps a flat image where it was when asked to keep large-scale brightness, and centres it when not", () => {
    const flat = new Float32Array(20 * 20).fill(0.8);
    expect(localNormalise(flat, 20, 4, 1, 0)[210]).toBeCloseTo(0.5, 3);
    expect(localNormalise(flat, 20, 4, 1, 1)[210]).toBeCloseTo(0.8, 3);
  });
});

describe("the wave of light", () => {
  it("has not started at progress 0, and has passed the whole band beyond the far side at 1", () => {
    expect(waveFront(0, 400, 120)).toBe(0);
    expect(waveFront(1, 400, 120)).toBe(520);
    expect(waveFront(2, 400, 120)).toBe(520);
    expect(waveFront(-1, 400, 120)).toBe(0);
  });

  it("is monotone in progress", () => {
    let last = -1;
    for (let p = 0; p <= 1; p += 0.05) {
      const f = waveFront(p, 300, 90);
      expect(f).toBeGreaterThanOrEqual(last);
      last = f;
    }
  });
});

describe("the lens", () => {
  it("is the headline lens's size: 11vw between 124 and 190, and 120 on a phone", () => {
    expect(lensDiameter(1534)).toBeCloseTo(168.74, 1);
    expect(lensDiameter(1000)).toBe(124);
    expect(lensDiameter(2600)).toBe(190);
    expect(lensDiameter(390)).toBe(120);
  });

  it("is held inside the disc", () => {
    expect(clampToDisc(10, 10, 100)).toEqual({ x: 10, y: 10 });
    const c = clampToDisc(300, 400, 100);
    expect(Math.hypot(c.x, c.y)).toBeCloseTo(100, 6);
    expect(c.x / c.y).toBeCloseTo(0.75, 6);
  });
});

describe("the crop", () => {
  it("lies inside the photograph", () => {
    expect(CROP.cx - CROP.s / 2).toBeGreaterThanOrEqual(0);
    expect(CROP.cx + CROP.s / 2).toBeLessThanOrEqual(1);
    expect(CROP.cy - CROP.s / 2).toBeGreaterThanOrEqual(0);
    expect(CROP.cy + CROP.s / 2).toBeLessThanOrEqual(1);
  });
});
