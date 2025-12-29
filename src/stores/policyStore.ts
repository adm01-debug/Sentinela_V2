import { create } from 'zustand';

interface Policy {
  id: string;
  name: string;
  description: string;
  type: 'screenshot' | 'activity' | 'location' | 'time';
  rules: Record<string, unknown>;
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

interface PolicyState {
  policies: Policy[];
  selectedPolicy: Policy | null;
  loading: boolean;
  error: string | null;
}

interface PolicyActions {
  setPolicies: (policies: Policy[]) => void;
  addPolicy: (policy: Policy) => void;
  updatePolicy: (id: string, updates: Partial<Policy>) => void;
  removePolicy: (id: string) => void;
  setSelectedPolicy: (policy: Policy | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

type PolicyStore = PolicyState & PolicyActions;

const initialState: PolicyState = {
  policies: [],
  selectedPolicy: null,
  loading: false,
  error: null,
};

export const usePolicyStore = create<PolicyStore>((set) => ({
  ...initialState,

  setPolicies: (policies) => set({ policies, error: null }),

  addPolicy: (policy) =>
    set((state) => ({ policies: [...state.policies, policy] })),

  updatePolicy: (id, updates) =>
    set((state) => ({
      policies: state.policies.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),

  removePolicy: (id) =>
    set((state) => ({
      policies: state.policies.filter((p) => p.id !== id),
    })),

  setSelectedPolicy: (selectedPolicy) => set({ selectedPolicy }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

export type { Policy, PolicyState };
