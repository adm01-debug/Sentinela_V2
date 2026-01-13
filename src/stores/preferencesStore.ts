import { create } from "zustand";
import { persist } from "zustand/middleware";
interface PreferencesState { theme: "light" | "dark"; language: string; setTheme: (t: "light" | "dark") => void; setLanguage: (l: string) => void; }
export const usePreferencesStore = create<PreferencesState>()(persist((set) => ({
  theme: "light", language: "pt-BR",
  setTheme: (theme) => set({ theme }), setLanguage: (language) => set({ language }),
}), { name: "preferences" }));
