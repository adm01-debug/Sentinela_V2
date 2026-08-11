// Sidebar Store for Sentinela v17
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface SidebarState {
  isOpen: boolean;
  isCollapsed: boolean;
  isPinned: boolean;
  activeSection: string | null;
  expandedItems: string[];
  width: number;
  minWidth: number;
  maxWidth: number;
  isMobileOpen: boolean;

  toggle: () => void;
  open: () => void;
  close: () => void;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
  setPinned: (pinned: boolean) => void;
  togglePinned: () => void;
  setActiveSection: (section: string | null) => void;
  toggleExpanded: (itemId) => void;
  setExpandedItems: (items: string[]) => void;
  expandAll: () => void;
  collapseAll: () => void;
  setWidth: (width) => void;
  toggleMobile: () => void;
  openMobile: () => void;
  closeMobile: () => void;
  reset: () => void;
}

const initialState = {
  isOpen: true,
  isCollapsed: false,
  isPinned: true,
  activeSection: null,
  expandedItems: [],
  width: 260,
  minWidth: 200,
  maxWidth: 400,
  isMobileOpen: false,
};

export const useSidebarStore = create<SidebarState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        toggle: () => set((state) => ({ isOpen: !state.isOpen })),

        open: () => set({ isOpen: true }),

        close: () => set({ isOpen: false }),

        setCollapsed: (isCollapsed) => set({ isCollapsed }),

        toggleCollapsed: () => set((state) => ({ isCollapsed: !state.isCollapsed })),

        setPinned: (isPinned) => set({ isPinned }),

        togglePinned: () => set((state) => ({ isPinned: !state.isPinned })),

        setActiveSection: (activeSection) => set({ activeSection }),

        toggleExpanded: (itemId) =>
          set((state) => ({
            expandedItems: state.expandedItems.includes(itemId)
              ? state.expandedItems.filter((id) => id !== itemId)
              : [...state.expandedItems, itemId],
          })),

        setExpandedItems: (expandedItems) => set({ expandedItems }),

        expandAll: () => set({ expandedItems: ['all'] }),

        collapseAll: () => set({ expandedItems: [] }),

        setWidth: (width) =>
          set((state) => ({
            width: Math.min(Math.max(width, state.minWidth), state.maxWidth),
          })),

        toggleMobile: () => set((state) => ({ isMobileOpen: !state.isMobileOpen })),

        openMobile: () => set({ isMobileOpen: true }),

        closeMobile: () => set({ isMobileOpen: false }),

        reset: () => set(initialState),
      }),
      {
        name: 'sidebar-store',
        partialize: (state) => ({
          isCollapsed: state.isCollapsed,
          isPinned: state.isPinned,
          expandedItems: state.expandedItems,
          width: state.width,
        }),
      }
    ),
    { name: 'SidebarStore' }
  )
);
