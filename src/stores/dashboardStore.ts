import { create } from 'zustand';
interface Widget { id: string; type: string; position: { x: number; y: number }; size: { w: number; h: number }; config: unknown; }
interface DashboardState {
  widgets: Widget[];
  layout: 'grid' | 'list';
  refreshInterval: number;
  addWidget: (widget: Widget) => void;
  removeWidget: (id: string) => void;
  updateWidget: (id: string, data: Partial<Widget>) => void;
  setLayout: (layout: 'grid' | 'list') => void;
  setRefreshInterval: (interval: any) => void;
}
export const useDashboardStore = create<DashboardState>()((set) => ({
  widgets: [],
  layout: 'grid',
  refreshInterval: 30,
  addWidget: (widget) => set((s) => ({ widgets: [...s.widgets, widget] })),
  removeWidget: (id) => set((s) => ({ widgets: s.widgets.filter((w) => w.id !== id) })),
  updateWidget: (id, data) => set((s) => ({ widgets: s.widgets.map((w) => w.id === id ? { ...w, ...data } : w) })),
  setLayout: (layout) => set({ layout }),
  setRefreshInterval: (refreshInterval) => set({ refreshInterval }),
}));