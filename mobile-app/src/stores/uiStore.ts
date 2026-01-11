import { create } from 'zustand';

interface UIState {
  loading: boolean;
  theme: 'light' | 'dark';
  setLoading: (loading: boolean) => void;
  toggleTheme: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  loading: false,
  theme: 'light',
  setLoading: (loading) => set({ loading }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
}));
