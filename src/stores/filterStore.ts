import { create } from 'zustand';

interface GlobalFilters {
  dateRange: { start: string; end: string } | null;
  departments: string[];
  employees: string[];
  status: string[];
}

interface FilterState {
  filters: GlobalFilters;
  setDateRange: (start: string, end: string) => void;
  clearDateRange: () => void;
  setDepartments: (departments: string[]) => void;
  setEmployees: (employees: string[]) => void;
  setStatus: (status: string[]) => void;
  resetFilters: () => void;
}

const defaultFilters: GlobalFilters = {
  dateRange: null,
  departments: [],
  employees: [],
  status: [],
};

export const useFilterStore = create<FilterState>()((set) => ({
  filters: defaultFilters,
  setDateRange: (start, end) =>
    set((state) => ({ filters: { ...state.filters, dateRange: { start, end } } })),
  clearDateRange: () => set((state) => ({ filters: { ...state.filters, dateRange: null } })),
  setDepartments: (departments) =>
    set((state) => ({ filters: { ...state.filters, departments } })),
  setEmployees: (employees) => set((state) => ({ filters: { ...state.filters, employees } })),
  setStatus: (status) => set((state) => ({ filters: { ...state.filters, status } })),
  resetFilters: () => set({ filters: defaultFilters }),
}));
