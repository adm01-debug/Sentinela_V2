import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Settings {
  general: { companyName: string; timezone: string; dateFormat: string };
  security: { twoFactorEnabled: boolean; sessionTimeout: number; passwordPolicy: string };
  notifications: { email: boolean; push: boolean; slack: boolean };
  monitoring: { screenshotInterval: number; activityTracking: boolean; idleTimeout: number };
}

interface SettingsState {
  settings: Settings;
  isLoading: boolean;
  updateSettings: <K extends keyof Settings>(section: K, values: Partial<Settings[K]>) => void;
  resetSettings: () => void;
}

const defaultSettings: Settings = {
  general: { companyName: "", timezone: "UTC", dateFormat: "YYYY-MM-DD" },
  security: { twoFactorEnabled: false, sessionTimeout: 30, passwordPolicy: "medium" },
  notifications: { email: true, push: true, slack: false },
  monitoring: { screenshotInterval: 5, activityTracking: true, idleTimeout: 5 },
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      isLoading: false,
      updateSettings: (section, values) =>
        set((state) => ({
          settings: { ...state.settings, [section]: { ...state.settings[section], ...values } },
        })),
      resetSettings: () => set({ settings: defaultSettings }),
    }),
    { name: "settings-storage" }
  )
);
