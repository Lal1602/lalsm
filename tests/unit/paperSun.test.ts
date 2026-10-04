import { describe, expect, it } from "vitest";
import { NOON_PAPER, paperLight, paperRamp, solarElevation, toHex, toTriple, type Rgb } from "@/lib/paperSun";

const SURABAYA = { lat: -7.2756, lon: 112.7937 };
/** Jakarta time (UTC+7) as a Date. */
const wib = (iso: string) => new Date(`${iso}+07:00`);

const lin = (c: number) => {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const luminance = (c: Rgb) => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
const contrast = (a: Rgb, b: Rgb) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const hex = (h: string): Rgb => ({ r: parseInt(h.slice(1, 3), 16), g: parseInt(h.slice(3, 5), 16), b: parseInt(h.slice(5, 7), 16) });

describe("the sun over Surabaya", () => {
  it("is high at midday, near the horizon at dawn and dusk, and below it at night", () => {
    const noon = solarElevation(wib("2026-10-04T11:30:00"), SURABAYA.lat, SURABAYA.lon);
    const dawn = solarElevation(wib("2026-10-04T05:30:00"), SURABAYA.lat, SURABAYA.lon);
    const dusk = solarElevation(wib("2026-10-04T17:30:00"), SURABAYA.lat, SURABAYA.lon);
    const midnight = solarElevation(wib("2026-10-04T00:00:00"), SURABAYA.lat, SURABAYA.lon);
    expect(noon).toBeGreaterThan(75);
    expect(noon).toBeLessThanOrEqual(90);
    expect(Math.abs(dawn)).toBeLessThan(8);
    expect(Math.abs(dusk)).toBeLessThan(8);
    expect(midnight).toBeLessThan(-40);
  });

  it("rises in the morning and falls in the afternoon", () => {
    const at = (h: string) => solarElevation(wib(`2026-10-04T${h}:00:00`), SURABAYA.lat, SURABAYA.lon);
    expect(at("07")).toBeLessThan(at("09"));
    expect(at("09")).toBeLessThan(at("11"));
    expect(at("14")).toBeGreaterThan(at("16"));
    expect(at("16")).toBeGreaterThan(at("18"));
  });

  it("is lower at noon at a high latitude in winter than on the equator", () => {
    const winter = solarElevation(new Date("2026-12-21T12:00:00Z"), 60, 0);
    const equator = solarElevation(new Date("2026-12-21T12:00:00Z"), 0, 0);
    expect(winter).toBeLessThan(10);
    expect(equator).toBeGreaterThan(60);
  });
});

describe("the paper", () => {
  it("at noon is the stylesheet's own paper", () => {
    const noon = paperRamp(80);
    noon.forEach((c, i) => expect(c).toEqual(NOON_PAPER[i]));
    expect(toHex(noon[1])).toBe("#e4ddcc");
  });

  it("warms toward the horizon and again after dark, and never gets brighter than at noon", () => {
    for (const e of [60, 40, 25, 12, 4, 0, -5, -12, -40]) {
      const ramp = paperRamp(e);
      ramp.forEach((c, i) => {
        expect(c.r).toBeLessThanOrEqual(NOON_PAPER[i].r);
        expect(c.g).toBeLessThanOrEqual(NOON_PAPER[i].g);
        expect(c.b).toBeLessThanOrEqual(NOON_PAPER[i].b);
        // Warmer means blue falls further than red.
        expect(c.r - c.b).toBeGreaterThanOrEqual(NOON_PAPER[i].r - NOON_PAPER[i].b - 1);
      });
    }
    const golden = paperRamp(3)[1];
    expect(golden.b / golden.r).toBeLessThan(NOON_PAPER[1].b / NOON_PAPER[1].r);
  });

  it("is a smooth function of the hour: no step between neighbouring elevations", () => {
    let prev = paperRamp(90)[1];
    for (let e = 89; e >= -30; e--) {
      const c = paperRamp(e)[1];
      expect(Math.abs(c.r - prev.r)).toBeLessThanOrEqual(2);
      expect(Math.abs(c.g - prev.g)).toBeLessThanOrEqual(2);
      expect(Math.abs(c.b - prev.b)).toBeLessThanOrEqual(2);
      prev = c;
    }
  });

  it("is dimmed by night by a few percent only, and the ink on it still reads", () => {
    const day = paperRamp(80);
    const night = paperRamp(-30);
    const drop = 1 - luminance(night[1]) / luminance(day[1]);
    expect(drop).toBeGreaterThan(0.04);
    expect(drop).toBeLessThan(0.2);
    // Text, on the deepest (darkest) paper at night: the worst case for every ink the theme uses as text.
    const deepest = night[3];
    expect(contrast(hex("#1b1d33"), deepest)).toBeGreaterThan(7);
    expect(contrast(hex("#40405a"), deepest)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(hex("#0c5a79"), night[1])).toBeGreaterThanOrEqual(4.5);
    expect(contrast(hex("#4d3bc4"), night[1])).toBeGreaterThanOrEqual(4.5);
    expect(contrast(hex("#80410a"), night[1])).toBeGreaterThanOrEqual(4.5);
    expect(contrast(hex("#982d17"), night[1])).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps the order of the ramp: raised is lighter than the page, which is lighter than sunken and deep", () => {
    for (const e of [90, 20, 0, -30]) {
      const r = paperRamp(e).map(luminance);
      expect(r[0]).toBeGreaterThan(r[1]);
      expect(r[1]).toBeGreaterThan(r[2]);
      expect(r[2]).toBeGreaterThan(r[3]);
    }
  });

  it("formats colours for CSS", () => {
    expect(toHex({ r: 1, g: 2, b: 255 })).toBe("#0102ff");
    expect(toTriple({ r: 228, g: 221, b: 204 })).toBe("228, 221, 204");
  });

  it("warmth and dimness are 0..1 and monotone in elevation", () => {
    let lastWarm = -1;
    let lastDim = 2;
    for (let e = 90; e >= -40; e -= 2) {
      const { warmth, dim } = paperLight(e);
      expect(warmth).toBeGreaterThanOrEqual(0);
      expect(warmth).toBeLessThanOrEqual(1);
      expect(dim).toBeGreaterThanOrEqual(0);
      expect(dim).toBeLessThanOrEqual(1);
      expect(warmth).toBeGreaterThanOrEqual(lastWarm);
      expect(dim).toBeGreaterThanOrEqual(lastDim === 2 ? 0 : 0);
      lastWarm = warmth;
      lastDim = dim;
    }
  });
});
