/**
 * Frame-time bookkeeping for the HELM demo: a fixed-size ring of the last N frame
 * durations, graded against the 60fps budget. Pure and allocation-free after the
 * constructor, so it can be fed from a requestAnimationFrame loop.
 */

/** One frame at 60Hz. */
export const BUDGET_MS = 1000 / 60;

export type Grade = "ok" | "warn" | "bad";

/** A frame inside the budget (with a little slack for timer jitter) is fine; up to two budgets is a visible stutter; beyond that it is a dropped frame. */
export function grade(ms: number, budget: number = BUDGET_MS): Grade {
  if (ms <= budget * 1.25) return "ok";
  if (ms <= budget * 2.1) return "warn";
  return "bad";
}

export interface FrameSummary {
  /** Frames currently in the ring. */
  count: number;
  avg: number;
  p95: number;
  worst: number;
  /** Frames graded "bad". */
  dropped: number;
  /** Frames per second implied by the average. */
  fps: number;
}

export class FrameRing {
  private readonly buf: Float32Array;
  private head = 0;
  private filled = 0;

  constructor(readonly size: number) {
    this.buf = new Float32Array(Math.max(1, Math.floor(size)));
  }

  push(ms: number): void {
    // A tab that was hidden reports one enormous delta: that is not a frame.
    if (!Number.isFinite(ms) || ms <= 0 || ms > 1000) return;
    this.buf[this.head] = ms;
    this.head = (this.head + 1) % this.buf.length;
    if (this.filled < this.buf.length) this.filled++;
  }

  clear(): void {
    this.head = 0;
    this.filled = 0;
  }

  get count(): number {
    return this.filled;
  }

  /** The i-th oldest value, 0 = oldest. */
  at(i: number): number {
    const start = (this.head - this.filled + this.buf.length) % this.buf.length;
    return this.buf[(start + i) % this.buf.length]!;
  }

  summary(budget: number = BUDGET_MS): FrameSummary {
    const n = this.filled;
    if (n === 0) return { count: 0, avg: 0, p95: 0, worst: 0, dropped: 0, fps: 0 };
    const sorted = new Float32Array(n);
    let sum = 0;
    let dropped = 0;
    for (let i = 0; i < n; i++) {
      const v = this.at(i);
      sorted[i] = v;
      sum += v;
      if (grade(v, budget) === "bad") dropped++;
    }
    sorted.sort();
    const avg = sum / n;
    return {
      count: n,
      avg,
      p95: sorted[Math.min(n - 1, Math.ceil(n * 0.95) - 1)]!,
      worst: sorted[n - 1]!,
      dropped,
      fps: 1000 / avg,
    };
  }
}
