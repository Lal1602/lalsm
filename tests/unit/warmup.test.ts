import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getWarmupSnapshot,
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
