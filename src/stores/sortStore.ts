import { create } from "zustand";
interface SortState { field: string; direction: "asc" | "desc"; setSort: (f: string) => void; }
export const useSortStore = create<SortState>((set, get) => ({
  field: "createdAt", direction: "desc",
  setSort: (field) => set((s) => ({ field, direction: s.field === field && s.direction === "asc" ? "desc" : "asc" })),
}));
