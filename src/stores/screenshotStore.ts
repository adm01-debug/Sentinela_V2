// Screenshot Store for Sentinela v17
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Screenshot, ScreenshotFilters, ScreenshotStats } from "@/types";

interface ScreenshotState {
  screenshots: Screenshot[];
  currentScreenshot: Screenshot | null;
  selectedIds: string[];
  filters: ScreenshotFilters;
  stats: ScreenshotStats | null;
  viewMode: "grid" | "list" | "timeline";
  isLoading: boolean;
  error: string | null;

  setScreenshots: (screenshots: Screenshot[]) => void;
  addScreenshot: (screenshot: Screenshot) => void;
  updateScreenshot: (id: string, data: Partial<Screenshot>) => void;
  removeScreenshot: (id) => void;
  setCurrentScreenshot: (screenshot: Screenshot | null) => void;
  setSelectedIds: (ids: string[]) => void;
  toggleSelection: (id) => void;
  selectAll: () => void;
  clearSelection: () => void;
  setFilters: (filters: Partial<ScreenshotFilters>) => void;
  clearFilters: () => void;
  setStats: (stats: ScreenshotStats) => void;
  setViewMode: (mode: "grid" | "list" | "timeline") => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  screenshots: [],
  currentScreenshot: null,
  selectedIds: [],
  filters: {},
  stats: null,
  viewMode: "grid" as const,
  isLoading: false,
  error: null,
};

export const useScreenshotStore = create<ScreenshotState>()(
  devtools(
    (set, _get) => ({
      ...initialState,

      setScreenshots: (screenshots) => set({ screenshots }),

      addScreenshot: (screenshot) =>
        set((state) => ({
          screenshots: [screenshot, ...state.screenshots],
        })),

      updateScreenshot: (id, data) =>
        set((state) => ({
          screenshots: state.screenshots.map((s) => (s.id === id ? { ...s, ...data } : s)),
        })),

      removeScreenshot: (id) =>
        set((state) => ({
          screenshots: state.screenshots.filter((s) => s.id !== id),
          selectedIds: state.selectedIds.filter((sid) => sid !== id),
        })),

      setCurrentScreenshot: (screenshot) => set({ currentScreenshot: screenshot }),

      setSelectedIds: (ids) => set({ selectedIds: ids }),

      toggleSelection: (id) =>
        set((state) => ({
          selectedIds: state.selectedIds.includes(id)
            ? state.selectedIds.filter((sid) => sid !== id)
            : [...state.selectedIds, id],
        })),

      selectAll: () =>
        set((state) => ({
          selectedIds: state.screenshots.map((s) => s.id),
        })),

      clearSelection: () => set({ selectedIds: [] }),

      setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),

      clearFilters: () => set({ filters: {} }),

      setStats: (stats) => set({ stats }),

      setViewMode: (viewMode) => set({ viewMode }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      reset: () => set(initialState),
    }),
    { name: "ScreenshotStore" }
  )
);
