import { create } from 'zustand';

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  status: 'active' | 'inactive';
  avatar?: string;
}

interface EmployeeState {
  employees: Employee[];
  selectedEmployee: Employee | null;
  filters: { department: string; status: string; search: string };
  isLoading: boolean;
  setEmployees: (employees: Employee[]) => void;
  addEmployee: (employee: Employee) => void;
  updateEmployee: (id: string, data: Partial<Employee>) => void;
  deleteEmployee: (id) => void;
  selectEmployee: (employee: Employee | null) => void;
  setFilters: (filters: Partial<EmployeeState['filters']>) => void;
  setLoading: (loading: boolean) => void;
}

export const useEmployeeStore = create<EmployeeState>()((set) => ({
  employees: [],
  selectedEmployee: null,
  filters: { department: '', status: '', search: '' },
  isLoading: false,
  setEmployees: (employees) => set({ employees }),
  addEmployee: (employee) => set((state) => ({ employees: [...state.employees, employee] })),
  updateEmployee: (id, data) =>
    set((state) => ({
      employees: state.employees.map((e) => (e.id === id ? { ...e, ...data } : e)),
    })),
  deleteEmployee: (id) =>
    set((state) => ({ employees: state.employees.filter((e) => e.id !== id) })),
  selectEmployee: (employee) => set({ selectedEmployee: employee }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  setLoading: (isLoading) => set({ isLoading }),
}));
