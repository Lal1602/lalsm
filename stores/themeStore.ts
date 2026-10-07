import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Theme {
  type: "light" | "dark";
  color: string;
}

const AvailableThemes: Theme[] = [{
  type: 'light',
  color: '#e4ddcc'
}, {
  type: 'dark',
  color: '#111'
}];

/**
 * The theme the page is already showing. The boot script in <head> (app/layout.tsx) sets <html data-theme> before
 * first paint, from the saved choice and otherwise dark; the store must start from that, not from its own default,
 * or a first-time visitor (nothing saved, page dark) would have to press the toggle twice: the first press would
 * "switch" the store to the theme the page was already in.
 */
function shownTheme(): Theme {
  const shown = typeof document === "undefined" ? "dark" : document.documentElement.getAttribute("data-theme");
  return AvailableThemes.find((t) => t.type === shown) ?? AvailableThemes[1];
}

interface ThemeStore {
  themes: Theme[];
  theme: Theme;
  nextTheme: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      themes: [...AvailableThemes],
      theme: shownTheme(),
      nextTheme: () => {
        const themes = get().themes;
        const activeThemeIndex = themes.findIndex(theme => theme.type === get().theme.type);
        const nextThemeIndex = (activeThemeIndex + 1) % themes.length;
        set(() => ({ theme: themes[nextThemeIndex] }));
      },
    }),
    {
      name: "theme-storage",
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);

if (typeof document !== "undefined") {
  useThemeStore.subscribe((state) => {
    document.documentElement.setAttribute("data-theme", state.theme.type);
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", state.theme.color);
    }
  });
}
