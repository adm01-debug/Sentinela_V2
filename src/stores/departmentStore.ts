// Department Store for Sentinela - Supabase integrated
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
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
  createDepartment: (data: { name: string; description?: string }) => Promise<Department>;
  updateDepartment: (id: string, data: Partial<Department>) => Promise<Department>;
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

      fetchDepartments: async (_filters) => {
        set({ isLoading: true, error: null });
        try {
          // Departments are derived from employees table department column
          const { data, error } = await supabase.from('employees').select('department').not('department', 'is', null);
          if (error) throw error;
          const unique = [...new Set((data || []).map(e: unknown => e.department).filter(Boolean))];
          const depts = unique.map((name, i) => ({ id: String(i), name: name! })) as unknown as Department[];
          set({ departments: depts, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      fetchDepartment: async (id) => {
        const dept = get().departments.find(d => d.id === id) || null;
        set({ currentDepartment: dept });
      },

      fetchHierarchy: async () => {
        set({ hierarchy: [] });
      },

      fetchStats: async () => {
        set({ stats: { total: get().departments.length, active: get().departments.length, totalEmployees: 0 } as DepartmentStats });
      },

      createDepartment: async (data) => {
        const dept = { id: crypto.randomUUID(), ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as unknown as Department;
        set({ departments: [...get().departments, dept] });
        return dept;
      },

      updateDepartment: async (id, data) => {
        const updated = { ...get().departments.find(d => d.id === id)!, ...data } as Department;
        set({ departments: get().departments.map(d => d.id === id ? updated : d) });
        return updated;
      },

      deleteDepartment: async (id) => {
        set({ departments: get().departments.filter(d => d.id !== id) });
      },

      setFilters: (filters) => set({ filters }),
      setCurrentDepartment: (department) => set({ currentDepartment: department }),
      clearError: () => set({ error: null }),
    }),
    { name: 'DepartmentStore' }
  )
);

export default useDepartmentStore;
