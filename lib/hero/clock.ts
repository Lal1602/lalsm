/**
 * The wall clock that appears in the headline's O when the lens is over it: the real time in Surabaya (the same
 * zone as the ledger's WIB), as the three hands of a dial. Pure, so the angles can be tested.
 */

export interface ClockTime {
  h: number;
  m: number;
  s: number;
  /** Milliseconds into the second, so the second hand can start exactly where the real one is. */
  ms: number;
}

const jakarta = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Jakarta",
  hourCycle: "h23",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

/** The time of day in Surabaya (UTC+7, no daylight saving) for a moment. */
export function jakartaTime(date: Date): ClockTime {
  const parts = jakarta.formatToParts(date);
  const read = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return { h: read("hour") % 24, m: read("minute"), s: read("second"), ms: date.getMilliseconds() };
}

export interface HandAngles {
  /** Degrees clockwise from twelve o'clock. */
  hour: number;
  minute: number;
  second: number;
}

/** Where each hand points: the hour hand creeps with the minutes, the minute hand with the seconds. */
export function handAngles(t: ClockTime): HandAngles {
  const second = (t.s + t.ms / 1000) * 6;
  return {
    hour: ((t.h % 12) + t.m / 60 + t.s / 3600) * 30,
    minute: (t.m + t.s / 60) * 6,
    second,
  };
}

const two = (n: number) => String(n).padStart(2, "0");

/** "16:51:30": what the lens's readout says while it is over the O. */
export const formatClock = (t: ClockTime): string => `${two(t.h)}:${two(t.m)}:${two(t.s)}`;
