import { describe, expect, it } from "vitest";
import { DIAL_TICKS, SPLASH_BOOT_SCRIPT, SPLASH_TASKS, elapsedLabel, lockLabel, odometer, taskLabel, taskWeight } from "@/lib/splash";

describe("the splash's systems", () => {
  it("are eight, each named once, with a label and a weight", () => {
    expect(SPLASH_TASKS).toHaveLength(8);
    expect(new Set(SPLASH_TASKS.map((t) => t.name)).size).toBe(8);
    for (const t of SPLASH_TASKS) {
      expect(t.label).toMatch(/^[A-Z ]+$/);
      expect(t.weight).toBeGreaterThan(0);
    }
  });

  it("are exactly the tasks the warm-up registers", async () => {
    const names: string[] = [];
    const warmup = await import("@/lib/warmup");
    warmup.resetWarmupForTests();
    // registerWarmupTasks touches `document` only inside a task's run, so registering is safe here.
    const { registerWarmupTasks } = await import("@/lib/warmupTasks");
    registerWarmupTasks();
    for (const name of Object.keys(warmup.getWarmupStatuses())) names.push(name);
    expect(names.sort()).toEqual(SPLASH_TASKS.map((t) => t.name).sort());
    warmup.resetWarmupForTests();
  });

  it("look up by name, with a sensible fallback", () => {
    expect(taskLabel("seams")).toBe("NEBULA SEAMS");
    expect(taskLabel("unknown")).toBe("UNKNOWN");
    expect(taskWeight("plates")).toBe(3);
    expect(taskWeight("unknown")).toBe(1);
  });

  it("say what really happened: locked, or fallback", () => {
    expect(lockLabel("ok", "space")).toBe("LOCKED · SKY SHADERS");
    expect(lockLabel("timeout", "space")).toBe("FALLBACK · SKY SHADERS");
    expect(lockLabel("error", "plates")).toBe("FALLBACK · PROJECT PLATES");
  });
});

describe("the odometer", () => {
  it("rests on whole digits at whole values", () => {
    expect(odometer(0)).toEqual([0, 0, 0]);
    expect(odometer(7)).toEqual([0, 0, 7]);
    expect(odometer(42)).toEqual([0, 4, 2]);
    expect(odometer(90)).toEqual([0, 9, 0]);
  });

  it("rolls the ones continuously, and the tens only while the ones go from 9 to 0", () => {
    expect(odometer(42.5)[2]).toBeCloseTo(2.5, 5);
    expect(odometer(42.5)[1]).toBe(4);
    expect(odometer(49.5)[1]).toBeCloseTo(4.5, 5);
    expect(odometer(49.5)[2]).toBeCloseTo(9.5, 5);
  });

  it("ends 99 -> 100 on the cell that looks like zero, so no reel ever jumps back", () => {
    // Tens: cell 10 is a 0 again; hundreds: cell 1 is the 1; ones: wraps to cell 0, a 0.
    expect(odometer(100)).toEqual([1, 10, 0]);
    // The 9 -> 0 roll of the ones ends on cell 10 (a 0) just before 100: continuous with the reset to 0 above.
    expect(odometer(99.999)[2]).toBeCloseTo(9.999, 3);
    expect(odometer(99.5)[0]).toBeCloseTo(0.5, 5);
    expect(odometer(99.5)[1]).toBeCloseTo(9.5, 5);
  });

  it("is monotone in every column except where a column resets onto an identical picture", () => {
    let [pH, pT] = odometer(0);
    for (let v = 0.25; v <= 100; v += 0.25) {
      const [h, t] = odometer(v);
      expect(h).toBeGreaterThanOrEqual(pH);
      expect(t).toBeGreaterThanOrEqual(pT);
      [pH, pT] = [h, t];
    }
  });

  it("clamps to 0..100", () => {
    expect(odometer(-5)).toEqual([0, 0, 0]);
    expect(odometer(250)).toEqual([1, 10, 0]);
  });
});

describe("the dial and the boot script", () => {
  it("has ticks that divide the circle evenly, a long one every fifth", () => {
    expect(DIAL_TICKS % 5).toBe(0);
    expect(360 % DIAL_TICKS).toBe(0);
  });

  it("formats the corner clock", () => {
    expect(elapsedLabel(0)).toBe("0.0s");
    expect(elapsedLabel(1234)).toBe("1.2s");
    expect(elapsedLabel(-10)).toBe("0.0s");
  });

  it("flags the page, keeps the browser from restoring a scroll, and starts at the top", () => {
    expect(SPLASH_BOOT_SCRIPT).toContain("data-splash");
    expect(SPLASH_BOOT_SCRIPT).toContain("scrollRestoration");
    expect(SPLASH_BOOT_SCRIPT).toContain("scrollTo(0,0)");
    // It is inlined into <head>: it must be one self-contained expression that cannot throw.
    expect(() => new Function(SPLASH_BOOT_SCRIPT)).not.toThrow();
  });
});
