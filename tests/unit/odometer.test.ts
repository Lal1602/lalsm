import { describe, expect, it } from "vitest";
import { rollPosition } from "@/lib/flight/odometer";

const digitOf = (n: number, place: number) => Math.floor(n / place) % 10;

describe("odometer", () => {
  it("rests every wheel exactly on its digit at a whole number", () => {
    for (let n = 0; n <= 999; n++) {
      for (const place of [1, 10, 100]) expect(rollPosition(n, place)).toBeCloseTo(digitOf(n, place), 9);
    }
  });

  it("turns the tens wheel only while the ones wheel carries", () => {
    expect(rollPosition(41.5, 10)).toBe(4); // mid-roll of the ones: tens does not move
    expect(rollPosition(38.5, 10)).toBe(3);
    expect(rollPosition(39.5, 10)).toBeCloseTo(3.5, 9); // the ones is carrying 9 -> 0: tens turns with it
    expect(rollPosition(99.5, 100)).toBeCloseTo(0.5, 9); // and the hundreds with that
  });

  it("never jumps: the visible position is continuous as the value rises (modulo a full turn)", () => {
    const circular = (a: number, b: number) => {
      const d = Math.abs(a - b) % 10;
      return Math.min(d, 10 - d);
    };
    for (const place of [1, 10, 100]) {
      let prev = rollPosition(0, place);
      for (let n = 0.05; n <= 1000; n += 0.05) {
        const pos = rollPosition(n, place);
        expect(circular(pos, prev)).toBeLessThan(0.05 / (place > 1 ? 1 : 0.1) + 0.2);
        prev = pos;
      }
    }
  });

  it("copes with values that are not numbers", () => {
    expect(rollPosition(NaN, 1)).toBe(0);
    expect(rollPosition(-5, 10)).toBe(0);
    expect(rollPosition(Infinity, 100)).toBe(0);
  });
});
