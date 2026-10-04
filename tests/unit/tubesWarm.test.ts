import { beforeEach, describe, expect, it, vi } from "vitest";

// The module holds one promise for the page's lifetime, so each test gets a fresh copy.
beforeEach(() => vi.resetModules());

describe("tube warm-up signal", () => {
  it("stays pending until the tubes have drawn their first frame", async () => {
    const { whenTubesWarmed, markTubesWarmed } = await import("@/lib/tubesWarm");
    let settled = false;
    void whenTubesWarmed().then(() => (settled = true));

    await Promise.resolve();
    expect(settled).toBe(false);

    markTubesWarmed();
    await whenTubesWarmed();
    expect(settled).toBe(true);
  });

  it("can be marked more than once (unmount after a failed load) without harm", async () => {
    const { whenTubesWarmed, markTubesWarmed } = await import("@/lib/tubesWarm");
    markTubesWarmed();
    markTubesWarmed();
    await expect(whenTubesWarmed()).resolves.toBeUndefined();
  });
});
