import { create } from "zustand";
interface PaginationState { page: number; pageSize: number; total: number; setPage: (p: number) => void; setPageSize: (s: number) => void; setTotal: (t: number) => void; }
export const usePaginationStore = create<PaginationState>((set) => ({
  page: 1, pageSize: 10, total: 0,
  setPage: (page) => set({ page }), setPageSize: (pageSize) => set({ pageSize, page: 1 }), setTotal: (total) => set({ total }),
}));
