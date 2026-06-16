// Selection Store for Sentinela v17
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface SelectionState<T = string> {
  selectedIds: Set<T>;
  lastSelectedId: T | null;
  anchorId: T | null;
  isSelectMode: boolean;

  select: (id: T) => void;
  deselect: (id: T) => void;
  toggle: (id: T) => void;
  selectMultiple: (ids: T[]) => void;
  deselectMultiple: (ids: T[]) => void;
  selectAll: (ids: T[]) => void;
  deselectAll: () => void;
  selectRange: (startId: T, endId: T, allIds: T[]) => void;
  shiftSelect: (id: T, allIds: T[]) => void;
  isSelected: (id: T) => boolean;
  getSelectedArray: () => T[];
  getSelectedCount: () => number;
  setSelectMode: (enabled: boolean) => void;
  reset: () => void;
}

export const createSelectionStore = <T = string>() =>
  create<SelectionState<T>>()(
    devtools(
      (set, get) => ({
        selectedIds: new Set<T>(),
        lastSelectedId: null,
        anchorId: null,
        isSelectMode: false,

        select: (id) =>
          set((state) => ({
            selectedIds: new Set([...state.selectedIds, id]),
            lastSelectedId: id,
            anchorId: state.anchorId ?? id,
          })),

        deselect: (id) =>
          set((state) => {
            const newSet = new Set(state.selectedIds);
            newSet.delete(id);
            return {
              selectedIds: newSet,
              lastSelectedId: state.lastSelectedId === id ? null : state.lastSelectedId,
            };
          }),

        toggle: (id) => {
          const { selectedIds, select, deselect } = get();
          if (selectedIds.has(id)) {
            deselect(id);
          } else {
            select(id);
          }
        },

        selectMultiple: (ids) =>
          set((state) => ({
            selectedIds: new Set([...state.selectedIds, ...ids]),
            lastSelectedId: ids[ids.length - 1] ?? state.lastSelectedId,
          })),

        deselectMultiple: (ids) =>
          set((state) => {
            const newSet = new Set(state.selectedIds);
            ids.forEach((id) => newSet.delete(id));
            return { selectedIds: newSet };
          }),

        selectAll: (ids) =>
          set({
            selectedIds: new Set(ids),
            lastSelectedId: ids[ids.length - 1] ?? null,
          }),

        deselectAll: () =>
          set({
            selectedIds: new Set<T>(),
            lastSelectedId: null,
            anchorId: null,
          }),

        selectRange: (startId, endId, allIds) => {
          const startIndex = allIds.indexOf(startId);
          const endIndex = allIds.indexOf(endId);
          if (startIndex === -1 || endIndex === -1) return;

          const [from, to] =
            startIndex < endIndex ? [startIndex, endIndex] : [endIndex, startIndex];
          const rangeIds = allIds.slice(from, to + 1);

          set((state) => ({
            selectedIds: new Set([...state.selectedIds, ...rangeIds]),
            lastSelectedId: endId,
          }));
        },

        shiftSelect: (id, allIds) => {
          const { anchorId, selectRange, select } = get();
          if (anchorId && allIds.includes(anchorId)) {
            selectRange(anchorId, id, allIds);
          } else {
            select(id);
          }
        },

        isSelected: (id) => get().selectedIds.has(id),

        getSelectedArray: () => Array.from(get().selectedIds),

        getSelectedCount: () => get().selectedIds.size,

        setSelectMode: (isSelectMode) => set({ isSelectMode }),

        reset: () =>
          set({
            selectedIds: new Set<T>(),
            lastSelectedId: null,
            anchorId: null,
            isSelectMode: false,
          }),
      }),
      { name: "SelectionStore" }
    )
  );

// Default string-based selection store
export const useSelectionStore = createSelectionStore<string>();

// Helper hook for table/list selection
export function useSelection<T = string>(
  store = useSelectionStore as unknown as ReturnType<typeof createSelectionStore<T>>
) {
  const selectedIds = store((state) => state.selectedIds);
  const toggle = store((state) => state.toggle);
  const selectAll = store((state) => state.selectAll);
  const deselectAll = store((state) => state.deselectAll);
  const isSelected = store((state) => state.isSelected);
  const getSelectedArray = store((state) => state.getSelectedArray);
  const getSelectedCount = store((state) => state.getSelectedCount);

  return {
    selectedIds,
    toggle,
    selectAll,
    deselectAll,
    isSelected,
    getSelectedArray,
    getSelectedCount,
    hasSelection: selectedIds.size > 0,
  };
}
