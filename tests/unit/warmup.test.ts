import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getWarmupSnapshot,
  getWarmupStatuses,
  registerWarmup,
  resetWarmupForTests,
  startWarmup,
  warmValue,
  whenWarm,
} from "@/lib/warmup";

beforeEach(() => {
  resetWarmupForTests();
  vi.useFakeTimers();
});
afterEach(() => vi.useRealTimers());

describe("warm-up pipeline", () => {
  it("runs tasks in parallel and keeps their values", async () => {
    registerWarmup({ name: "a", run: async () => 1 });
    registerWarmup({ name: "b", run: () => new Promise((r) => setTimeout(() => r("two"), 100)) });

    const done = startWarmup();
    await vi.advanceTimersByTimeAsync(100);
    await done;

    expect(getWarmupSnapshot()).toMatchObject({ total: 2, settled: 2, finished: true, progress: 1 });
    expect(warmValue<number>("a")).toBe(1);
    expect(warmValue<string>("b")).toBe("two");
  });

  it("gives up on a slow task instead of blocking forever", async () => {
    registerWarmup({ name: "slow", run: () => new Promise(() => {}), timeoutMs: 500 });
    registerWarmup({ name: "fast", run: async () => "ok" });

    const done = startWarmup();
    await vi.advanceTimersByTimeAsync(500);
    await done;

    expect(getWarmupSnapshot().finished).toBe(true);
    expect(warmValue("slow")).toBeUndefined();
    expect(warmValue("fast")).toBe("ok");
  });

  it("survives a task that throws", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    registerWarmup({
      name: "boom",
      run: async () => {
        throw new Error("nope");
      },
    });
    await startWarmup();
    expect(warmValue("boom")).toBeUndefined();
    expect(getWarmupSnapshot().finished).toBe(true);
    warn.mockRestore();
  });

  it("whenWarm resolves with the value, or undefined on failure", async () => {
    registerWarmup({ name: "v", run: async () => 42 });
    registerWarmup({ name: "x", run: () => new Promise(() => {}), timeoutMs: 10 });
    const v = whenWarm<number>("v");
    const x = whenWarm("x");
    const done = startWarmup();
    await vi.advanceTimersByTimeAsync(10);
    await done;
    expect(await v).toBe(42);
    expect(await x).toBeUndefined();
  });

  it("counts progress by weight, so a heavy task moves the readout further than a light one", async () => {
    registerWarmup({ name: "light", weight: 1, run: async () => 1 });
    registerWarmup({ name: "heavy", weight: 3, run: () => new Promise((r) => setTimeout(() => r(2), 100)) });

    const done = startWarmup();
    await vi.advanceTimersByTimeAsync(0);
    // The light one is done, the heavy one is not: a quarter of the work, not half.
    expect(getWarmupSnapshot().progress).toBeCloseTo(0.25, 5);
    expect(getWarmupSnapshot().last).toEqual({ name: "light", status: "ok" });
    await vi.advanceTimersByTimeAsync(100);
    await done;
    expect(getWarmupSnapshot().progress).toBe(1);
  });

  it("runs the gpu lane one task at a time, in order, with the others in parallel", async () => {
    const log: string[] = [];
    const slow = (name: string, ms: number) => () =>
      new Promise<string>((resolve) => {
        log.push(`${name}:start`);
        setTimeout(() => {
          log.push(`${name}:end`);
          resolve(name);
        }, ms);
      });
    registerWarmup({ name: "g1", lane: "gpu", run: slow("g1", 50) });
    registerWarmup({ name: "g2", lane: "gpu", run: slow("g2", 50) });
    registerWarmup({ name: "net", run: slow("net", 80) });

    const done = startWarmup();
    await vi.advanceTimersByTimeAsync(0);
    // g1 and the parallel task have started; g2 waits its turn.
    expect(log).toEqual(expect.arrayContaining(["g1:start", "net:start"]));
    expect(log).not.toContain("g2:start");
    await vi.advanceTimersByTimeAsync(400);
    await done;
    expect(log.indexOf("g1:end")).toBeLessThan(log.indexOf("g2:start"));
    expect(getWarmupSnapshot()).toMatchObject({ total: 3, settled: 3, finished: true });
  });

  it("starts the timeout of a lane task when it starts, not while it waits in the queue", async () => {
    registerWarmup({ name: "first", lane: "gpu", run: () => new Promise((r) => setTimeout(() => r(1), 300)), timeoutMs: 1000 });
    registerWarmup({ name: "second", lane: "gpu", run: () => new Promise((r) => setTimeout(() => r(2), 300)), timeoutMs: 400 });

    const done = startWarmup();
    await vi.advanceTimersByTimeAsync(1000);
    await done;
    // 600ms after the run began, past its own 400ms budget if that had been counted from the start.
    expect(warmValue("second")).toBe(2);
  });

  it("reports how every task ended", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    registerWarmup({ name: "fine", run: async () => 1 });
    registerWarmup({ name: "late", run: () => new Promise(() => {}), timeoutMs: 20 });
    registerWarmup({
      name: "broken",
      run: async () => {
        throw new Error("no");
      },
    });
    const done = startWarmup();
    expect(getWarmupStatuses().late).toBe("pending");
    await vi.advanceTimersByTimeAsync(20);
    await done;
    expect(getWarmupStatuses()).toEqual({ fine: "ok", late: "timeout", broken: "error" });
    warn.mockRestore();
  });

  it("starts a task that registers after the run began", async () => {
    registerWarmup({ name: "early", run: async () => 1 });
    const done = startWarmup();
    registerWarmup({ name: "late", run: async () => 2 });
    await vi.advanceTimersByTimeAsync(0);
    await done;
    await vi.advanceTimersByTimeAsync(0);
    expect(warmValue("late")).toBe(2);
  });
});
