import { afterEach, describe, expect, it, vi } from "vitest";

/** The store starts from the theme the page is already showing, so the first press of the toggle changes it. */

function fakePage(shown: string | null) {
  const attrs: Record<string, string> = shown ? { "data-theme": shown } : {};
  const memory = new Map<string, string>();
  vi.stubGlobal("document", {
    documentElement: {
      getAttribute: (k: string) => attrs[k] ?? null,
      setAttribute: (k: string, v: string) => {
        attrs[k] = v;
      },
    },
    querySelector: () => null,
  });
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => memory.get(k) ?? null,
    setItem: (k: string, v: string) => void memory.set(k, v),
    removeItem: (k: string) => void memory.delete(k),
  });
  return attrs;
}

async function freshStore() {
  vi.resetModules();
  return (await import("@/stores/themeStore")).useThemeStore;
}

afterEach(() => vi.unstubAllGlobals());

describe("the theme store", () => {
  it("starts from the theme the boot script put on the page", async () => {
    fakePage("light");
    expect((await freshStore()).getState().theme.type).toBe("light");
    fakePage("dark");
    expect((await freshStore()).getState().theme.type).toBe("dark");
  });

  it("with nothing there at all, starts dark, like the boot script", async () => {
    fakePage(null);
    expect((await freshStore()).getState().theme.type).toBe("dark");
  });

  it("changes the page on the first press, from either theme", async () => {
    for (const [from, to] of [["dark", "light"], ["light", "dark"]] as const) {
      const attrs = fakePage(from);
      const store = await freshStore();
      store.getState().nextTheme();
      expect(store.getState().theme.type).toBe(to);
      expect(attrs["data-theme"]).toBe(to);
    }
  });
});
