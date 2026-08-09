import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Theme {
  type: "light" | "dark";
  color: string;
}

const AvailableThemes: Theme[] = [{
  type: 'light',
  color: '#0690d4'
}, {
  type: 'dark',
  color: '#111'
}];

interface ThemeStore {
  themes: Theme[];
  theme: Theme;
  nextTheme: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      themes: [...AvailableThemes],
      theme: AvailableThemes[0],
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
