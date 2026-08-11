import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ModalConfig {
  id: string;
  component: string;
  props?: unknown;
}

interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  activeModal: ModalConfig | null;
  commandPaletteOpen: boolean;
  globalLoading: boolean;
  toasts: Array<{ id: string; message: string; type: string }>;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapse: () => void;
  openModal: (config: ModalConfig) => void;
  closeModal: () => void;
  toggleCommandPalette: () => void;
  setGlobalLoading: (loading: boolean) => void;
  addToast: (message: string, type: string) => void;
  removeToast: (id) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
  sidebarOpen: true,
  sidebarCollapsed: false,
  activeModal: null,
  commandPaletteOpen: false,
  globalLoading: false,
  toasts: [],
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebarCollapse: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  openModal: (config) => set({ activeModal: config }),
  closeModal: () => set({ activeModal: null }),
  toggleCommandPalette: () => set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
  setGlobalLoading: (loading) => set({ globalLoading: loading }),
  addToast: (message, type) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }].slice(-5), // Keep only last 5
    }));
    // Auto remove after 5s
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 5000);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
    }),
    {
      name: 'sentinela-ui-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        sidebarCollapsed: state.sidebarCollapsed,
        sidebarOpen: state.sidebarOpen 
      }),
    }
  )
);
