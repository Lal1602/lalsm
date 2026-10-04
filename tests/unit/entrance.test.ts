import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getEntrance, resetEntranceForTests, setEntrance, subscribeEntrance } from "@/lib/entrance";

/** The one thing the store reads from the page: the attribute the boot script puts on <html>. */
function page(hero: string | null) {
  vi.stubGlobal("document", {
    documentElement: { getAttribute: (name: string) => (name === "data-hero" ? hero : null) },
  });
}

beforeEach(() => resetEntranceForTests());
afterEach(() => {
  resetEntranceForTests();
  vi.unstubAllGlobals();
});

describe("hero entrance state", () => {
  it("starts at done when the boot script did not ask the hero to wait (calm visitors, other pages)", () => {
    page(null);
    expect(getEntrance()).toBe("done");
  });

  it("starts at waiting when the boot script marked the page", () => {
    page("wait");
    expect(getEntrance()).toBe("waiting");
  });

  it("only moves forward", () => {
    page("wait");
    setEntrance("entering");
    expect(getEntrance()).toBe("entering");
    setEntrance("waiting");
    expect(getEntrance()).toBe("entering");
    setEntrance("done");
    expect(getEntrance()).toBe("done");
    setEntrance("entering");
    expect(getEntrance()).toBe("done");
  });

  it("notifies subscribers once per change, and not when nothing changes", () => {
    page("wait");
    const spy = vi.fn();
    const off = subscribeEntrance(spy);
    setEntrance("entering");
    setEntrance("entering");
    setEntrance("done");
    expect(spy).toHaveBeenCalledTimes(2);
    off();
  });

  it("stops notifying after unsubscribe", () => {
    page("wait");
    const spy = vi.fn();
    subscribeEntrance(spy)();
    setEntrance("entering");
    expect(spy).not.toHaveBeenCalled();
  });
});
