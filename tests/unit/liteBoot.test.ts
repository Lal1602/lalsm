import { describe, expect, it } from "vitest";
import vm from "node:vm";
import { LITE_BOOT_SCRIPT } from "@/lib/liteBoot";

interface Env {
  stored?: string | null;
  reducedMotion?: boolean;
  deviceMemory?: number;
  cores?: number;
  saveData?: boolean;
}

/** Runs the inline boot script against a fake browser and returns the <html> attributes it sets. */
function run(env: Env) {
  const attrs: Record<string, string> = {};
  const sandbox = {
    localStorage: { getItem: () => env.stored ?? null },
    navigator: {
      deviceMemory: env.deviceMemory,
      hardwareConcurrency: env.cores ?? 8,
      connection: { saveData: !!env.saveData },
    },
    window: { matchMedia: () => ({ matches: !!env.reducedMotion }) },
    document: {
      documentElement: {
        setAttribute: (key: string, value: string) => {
          attrs[key] = value;
        },
      },
    },
  };
  vm.runInNewContext(LITE_BOOT_SCRIPT, sandbox);
  return attrs;
}

describe("lite boot script", () => {
  it("stays full on a capable device", () => {
    expect(run({})).toEqual({ "data-lite": "0", "data-lite-mode": "auto" });
  });

  it("goes lite automatically for reduced motion, Save-Data, low memory or few cores", () => {
    expect(run({ reducedMotion: true })["data-lite"]).toBe("1");
    expect(run({ saveData: true })["data-lite"]).toBe("1");
    expect(run({ deviceMemory: 2 })["data-lite"]).toBe("1");
    expect(run({ cores: 2 })["data-lite"]).toBe("1");
  });

  it("an explicit choice beats the device", () => {
    expect(run({ stored: "off", reducedMotion: true })).toEqual({ "data-lite": "0", "data-lite-mode": "off" });
    expect(run({ stored: "on" })).toEqual({ "data-lite": "1", "data-lite-mode": "on" });
  });
});
