import { describe, expect, it } from "vitest";
import { formatClock, handAngles, jakartaTime } from "@/lib/hero/clock";

describe("the O's clock", () => {
  it("reads Surabaya's time (UTC+7) from any moment", () => {
    // 09:30:15 UTC is 16:30:15 in Surabaya.
    expect(jakartaTime(new Date("2026-10-06T09:30:15.250Z"))).toEqual({ h: 16, m: 30, s: 15, ms: 250 });
    // The day rolls over there before it does in UTC: 18:00 UTC is 01:00 the next day.
    expect(jakartaTime(new Date("2026-10-06T18:00:00.000Z")).h).toBe(1);
    // Midnight is 0, never 24.
    expect(jakartaTime(new Date("2026-10-05T17:00:00.000Z")).h).toBe(0);
  });

  it("points the hands: three o'clock, twelve o'clock, half past", () => {
    expect(handAngles({ h: 3, m: 0, s: 0, ms: 0 })).toEqual({ hour: 90, minute: 0, second: 0 });
    expect(handAngles({ h: 0, m: 0, s: 0, ms: 0 })).toEqual({ hour: 0, minute: 0, second: 0 });
    expect(handAngles({ h: 12, m: 0, s: 0, ms: 0 }).hour).toBe(0);
    // Half past six: the hour hand is half way between six and seven, the minute hand points at six.
    const half = handAngles({ h: 6, m: 30, s: 0, ms: 0 });
    expect(half.hour).toBeCloseTo(195, 6);
    expect(half.minute).toBeCloseTo(180, 6);
  });

  it("makes the hour hand creep with the minutes and the minute hand with the seconds", () => {
    const a = handAngles({ h: 10, m: 0, s: 0, ms: 0 });
    const b = handAngles({ h: 10, m: 30, s: 0, ms: 0 });
    expect(b.hour - a.hour).toBeCloseTo(15, 6);
    const c = handAngles({ h: 10, m: 10, s: 30, ms: 0 });
    expect(c.minute).toBeCloseTo(63, 6);
  });

  it("starts the second hand where the real one is, to the millisecond", () => {
    expect(handAngles({ h: 1, m: 2, s: 15, ms: 500 }).second).toBeCloseTo(15.5 * 6, 6);
    expect(handAngles({ h: 1, m: 2, s: 59, ms: 999 }).second).toBeLessThan(360);
  });

  it("is monotone through a whole hour: no hand ever goes back, except at a wrap", () => {
    let prev = handAngles({ h: 4, m: 0, s: 0, ms: 0 });
    for (let sec = 1; sec < 3600; sec += 7) {
      const t = { h: 4, m: Math.floor(sec / 60), s: sec % 60, ms: 0 };
      const a = handAngles(t);
      expect(a.hour).toBeGreaterThanOrEqual(prev.hour);
      expect(a.minute).toBeGreaterThanOrEqual(prev.minute);
      prev = a;
    }
  });

  it("formats the readout with two digits each", () => {
    expect(formatClock({ h: 4, m: 5, s: 9, ms: 0 })).toBe("04:05:09");
    expect(formatClock({ h: 23, m: 59, s: 59, ms: 999 })).toBe("23:59:59");
  });
});
