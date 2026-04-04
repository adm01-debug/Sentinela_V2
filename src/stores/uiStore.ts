import { create } from 'zustand';

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

export const useUIStore = create<UIState>()((set) => ({
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
      toasts: [...state.toasts, { id, message, type }],
    }));
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
