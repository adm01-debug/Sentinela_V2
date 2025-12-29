import { create } from 'zustand';

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface FilterState {
  search: string;
  status: string | null;
  department: string | null;
  dateRange: DateRange;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

interface FilterActions {
  setSearch: (search: string) => void;
  setStatus: (status: string | null) => void;
  setDepartment: (department: string | null) => void;
  setDateRange: (range: DateRange) => void;
  setSortBy: (sortBy: string) => void;
  setSortOrder: (sortOrder: 'asc' | 'desc') => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  resetFilters: () => void;
}

type FilterStore = FilterState & FilterActions;

const initialState: FilterState = {
  search: '',
  status: null,
  department: null,
  dateRange: { start: null, end: null },
  sortBy: 'createdAt',
  sortOrder: 'desc',
  page: 1,
  pageSize: 10,
};

export const useFilterStore = create<FilterStore>((set) => ({
  ...initialState,

  setSearch: (search) => set({ search, page: 1 }),
  setStatus: (status) => set({ status, page: 1 }),
  setDepartment: (department) => set({ department, page: 1 }),
  setDateRange: (dateRange) => set({ dateRange, page: 1 }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSortOrder: (sortOrder) => set({ sortOrder }),
  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize, page: 1 }),
  resetFilters: () => set(initialState),
}));

export type { FilterState, FilterActions, DateRange };
