import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DisplaySettings {
  density: 'comfortable' | 'compact' | 'spacious';
  fontSize: 'small' | 'medium' | 'large';
  showSidebar: boolean;
  sidebarCollapsed: boolean;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  desktopNotifications: boolean;
  soundEnabled: boolean;
}

interface PrivacySettings {
  shareUsageData: boolean;
  showOnlineStatus: boolean;
}

interface SettingsState {
  display: DisplaySettings;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  language: string;
  timezone: string;
}

interface SettingsActions {
  updateDisplay: (settings: Partial<DisplaySettings>) => void;
  updateNotifications: (settings: Partial<NotificationSettings>) => void;
  updatePrivacy: (settings: Partial<PrivacySettings>) => void;
  setLanguage: (language: string) => void;
  setTimezone: (timezone: string) => void;
  resetSettings: () => void;
}

type SettingsStore = SettingsState & SettingsActions;

const initialState: SettingsState = {
  display: {
    density: 'comfortable',
    fontSize: 'medium',
    showSidebar: true,
    sidebarCollapsed: false,
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    desktopNotifications: false,
    soundEnabled: true,
  },
  privacy: {
    shareUsageData: false,
    showOnlineStatus: true,
  },
  language: 'pt-BR',
  timezone: 'America/Sao_Paulo',
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...initialState,

      updateDisplay: (settings) =>
        set((state) => ({
          display: { ...state.display, ...settings },
        })),

      updateNotifications: (settings) =>
        set((state) => ({
          notifications: { ...state.notifications, ...settings },
        })),

      updatePrivacy: (settings) =>
        set((state) => ({
          privacy: { ...state.privacy, ...settings },
        })),

      setLanguage: (language) => set({ language }),

      setTimezone: (timezone) => set({ timezone }),

      resetSettings: () => set(initialState),
    }),
    {
      name: 'sentinela-settings',
      partialize: (state) => ({
        display: state.display,
        notifications: state.notifications,
        privacy: state.privacy,
        language: state.language,
        timezone: state.timezone,
      }),
    }
  )
);

export type { SettingsState, DisplaySettings, NotificationSettings, PrivacySettings };
