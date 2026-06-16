import { create } from "zustand";

interface UserPreferences {
  theme: "light" | "dark" | "system";
  language: string;
  notifications: boolean;
  timezone: string;
}

interface UserState {
  preferences: UserPreferences;
  recentSearches: string[];
  favorites: string[];
  setPreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  addRecentSearch: (search) => void;
  clearRecentSearches: () => void;
  addFavorite: (id) => void;
  removeFavorite: (id) => void;
}

export const useUserStore = create<UserState>()((set) => ({
  preferences: {
    theme: "system",
    language: "en",
    notifications: true,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  },
  recentSearches: [],
  favorites: [],
  setPreference: (key, value) =>
    set((state) => ({ preferences: { ...state.preferences, [key]: value } })),
  addRecentSearch: (search) =>
    set((state) => ({
      recentSearches: [search, ...state.recentSearches.filter((s) => s !== search)].slice(0, 10),
    })),
  clearRecentSearches: () => set({ recentSearches: [] }),
  addFavorite: (id) => set((state) => ({ favorites: [...state.favorites, id] })),
  removeFavorite: (id) => set((state) => ({ favorites: state.favorites.filter((f) => f !== id) })),
}));
