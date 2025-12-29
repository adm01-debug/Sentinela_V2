import { create } from 'zustand';

type ViolationSeverity = 'low' | 'medium' | 'high' | 'critical';
type ViolationStatus = 'open' | 'acknowledged' | 'resolved' | 'dismissed';

interface Violation {
  id: string;
  employeeId: string;
  type: string;
  description: string;
  severity: ViolationSeverity;
  status: ViolationStatus;
  evidence?: Record<string, unknown>;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
}

interface ViolationState {
  violations: Violation[];
  selectedViolation: Violation | null;
  loading: boolean;
  error: string | null;
}

interface ViolationActions {
  setViolations: (violations: Violation[]) => void;
  addViolation: (violation: Violation) => void;
  updateViolation: (id: string, updates: Partial<Violation>) => void;
  setSelectedViolation: (violation: Violation | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

type ViolationStore = ViolationState & ViolationActions;

const initialState: ViolationState = {
  violations: [],
  selectedViolation: null,
  loading: false,
  error: null,
};

export const useViolationStore = create<ViolationStore>((set) => ({
  ...initialState,

  setViolations: (violations) => set({ violations, error: null }),

  addViolation: (violation) =>
    set((state) => ({ violations: [violation, ...state.violations] })),

  updateViolation: (id, updates) =>
    set((state) => ({
      violations: state.violations.map((v) =>
        v.id === id ? { ...v, ...updates } : v
      ),
    })),

  setSelectedViolation: (selectedViolation) => set({ selectedViolation }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

export type { Violation, ViolationSeverity, ViolationStatus, ViolationState };
