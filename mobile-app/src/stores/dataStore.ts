import { create } from 'zustand';

interface DataState {
  employees: any[];
  violations: any[];
  setEmployees: (employees: any[]) => void;
  setViolations: (violations: any[]) => void;
}

export const useDataStore = create<DataState>((set) => ({
  employees: [],
  violations: [],
  setEmployees: (employees) => set({ employees }),
  setViolations: (violations) => set({ violations }),
}));
