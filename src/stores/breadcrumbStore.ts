// Breadcrumb Store for Sentinela v17
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface BreadcrumbItem {
  id: string;
  label: string;
  href?: string;
  icon?: string;
  isActive?: boolean;
  meta?: unknown;
}

interface BreadcrumbState {
  items: BreadcrumbItem[];
  separator: string;
  maxItems: number;
  showHome: boolean;
  homeItem: BreadcrumbItem;

  setItems: (items: BreadcrumbItem[]) => void;
  push: (item: BreadcrumbItem) => void;
  pop: () => void;
  clear: () => void;
  replaceAt: (index, item: BreadcrumbItem) => void;
  updateItem: (id: string, updates: Partial<BreadcrumbItem>) => void;
  setSeparator: (separator: string) => void;
  setMaxItems: (max) => void;
  setShowHome: (show: boolean) => void;
  setHomeItem: (item: BreadcrumbItem) => void;
  navigateTo: (index) => void;
}

const defaultHomeItem: BreadcrumbItem = {
  id: 'home',
  label: 'Home',
  href: '/',
  icon: 'Home',
};

export const useBreadcrumbStore = create<BreadcrumbState>()(
  devtools(
    (set) => ({
      items: [],
      separator: '/',
      maxItems: 5,
      showHome: true,
      homeItem: defaultHomeItem,

      setItems: (items) =>
        set({
          items: items.map((item, index, arr) => ({
            ...item,
            isActive: index === arr.length - 1,
          })),
        }),

      push: (item) =>
        set((state) => ({
          items: [
            ...state.items.map((i) => ({ ...i, isActive: false })),
            { ...item, isActive: true },
          ].slice(-state.maxItems),
        })),

      pop: () =>
        set((state) => {
          const newItems = state.items.slice(0, -1);
          if (newItems.length > 0) {
            newItems[newItems.length - 1].isActive = true;
          }
          return { items: newItems };
        }),

      clear: () => set({ items: [] }),

      replaceAt: (index, item) =>
        set((state) => ({
          items: state.items.map((i, idx) =>
            idx === index ? { ...item, isActive: idx === state.items.length - 1 } : i
          ),
        })),

      updateItem: (id, updates) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        })),

      setSeparator: (separator) => set({ separator }),

      setMaxItems: (maxItems) => set({ maxItems }),

      setShowHome: (showHome) => set({ showHome }),

      setHomeItem: (homeItem) => set({ homeItem }),

      navigateTo: (index) =>
        set((state) => ({
          items: state.items.slice(0, index + 1).map((item, idx, arr) => ({
            ...item,
            isActive: idx === arr.length - 1,
          })),
        })),
    }),
    { name: 'BreadcrumbStore' }
  )
);
