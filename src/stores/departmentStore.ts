// Department Store for Sentinela v17
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { departmentService } from '@/services/departmentService';
import type { Department, DepartmentFilters, DepartmentStats, DepartmentHierarchy } from '@/types/department';

interface DepartmentState {
  departments: Department[];
  currentDepartment: Department | null;
  hierarchy: DepartmentHierarchy[];
  stats: DepartmentStats | null;
  filters: DepartmentFilters;
  isLoading: boolean;
  error: string | null;
}

interface DepartmentActions {
  fetchDepartments: (filters?: DepartmentFilters) => Promise<void>;
  fetchDepartment: (id: string) => Promise<void>;
  fetchHierarchy: () => Promise<void>;
  fetchStats: () => Promise<void>;
  createDepartment: (data: Parameters<typeof departmentService.create>[0]) => Promise<Department>;
  updateDepartment: (id: string, data: Parameters<typeof departmentService.update>[1]) => Promise<Department>;
  deleteDepartment: (id: string) => Promise<void>;
  setFilters: (filters: DepartmentFilters) => void;
  setCurrentDepartment: (department: Department | null) => void;
  clearError: () => void;
}

const initialState: DepartmentState = {
  departments: [],
  currentDepartment: null,
  hierarchy: [],
  stats: null,
  filters: {},
  isLoading: false,
  error: null,
};

export const useDepartmentStore = create<DepartmentState & DepartmentActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      fetchDepartments: async (filters) => {
        set({ isLoading: true, error: null });
        try {
          const response = await departmentService.getAll(filters || get().filters);
          set({ departments: response.data, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      fetchDepartment: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const department = await departmentService.getById(id);
          set({ currentDepartment: department, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      fetchHierarchy: async () => {
        try {
          const hierarchy = await departmentService.getHierarchy();
          set({ hierarchy });
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      fetchStats: async () => {
        try {
          const stats = await departmentService.getStats();
          set({ stats });
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      createDepartment: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const department = await departmentService.create(data);
          set({ departments: [...get().departments, department], isLoading: false });
          return department;
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      updateDepartment: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
          const department = await departmentService.update(id, data);
          set({ departments: get().departments.map(d => d.id === id ? department : d), currentDepartment: get().currentDepartment?.id === id ? department : get().currentDepartment, isLoading: false });
          return department;
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      deleteDepartment: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await departmentService.delete(id);
          set({ departments: get().departments.filter(d => d.id !== id), isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      setFilters: (filters) => set({ filters }),
      setCurrentDepartment: (department) => set({ currentDepartment: department }),
      clearError: () => set({ error: null }),
    }),
    { name: 'DepartmentStore' }
  )
);

export default useDepartmentStore;
