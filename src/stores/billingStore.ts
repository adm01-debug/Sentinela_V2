// Billing Store for Sentinela v17
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { BillingAccount, BillingPlan, Invoice, Subscription, UsageMetrics } from '@/types';

interface BillingState {
  account: BillingAccount | null;
  subscription: Subscription | null;
  plans: BillingPlan[];
  invoices: Invoice[];
  usage: UsageMetrics | null;
  isLoading: boolean;
  error: string | null;

  setAccount: (account: BillingAccount) => void;
  setSubscription: (subscription: Subscription) => void;
  setPlans: (plans: BillingPlan[]) => void;
  setInvoices: (invoices: Invoice[]) => void;
  addInvoice: (invoice: Invoice) => void;
  setUsage: (usage: UsageMetrics) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  account: null,
  subscription: null,
  plans: [],
  invoices: [],
  usage: null,
  isLoading: false,
  error: null,
};

export const useBillingStore = create<BillingState>()(
  devtools(
    (set) => ({
      ...initialState,

      setAccount: (account) => set({ account }),

      setSubscription: (subscription) => set({ subscription }),

      setPlans: (plans) => set({ plans }),

      setInvoices: (invoices) => set({ invoices }),

      addInvoice: (invoice) =>
        set((state) => ({
          invoices: [invoice, ...state.invoices],
        })),

      setUsage: (usage) => set({ usage }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      reset: () => set(initialState),
    }),
    { name: 'BillingStore' }
  )
);

// Selectors
export const selectCurrentPlan = (state: BillingState) =>
  state.plans.find((p) => p.id === state.subscription?.planId);

export const selectUnpaidInvoices = (state: BillingState) =>
  state.invoices.filter((i) => i.status === 'pending' || i.status === 'overdue');

export const selectUsagePercentage = (metric: keyof UsageMetrics['users']) => (state: BillingState) => {
  if (!state.usage) return 0;
  const data = state.usage[metric as keyof UsageMetrics];
  if (typeof data === 'object' && 'current' in data && 'limit' in data) {
    return Math.round((data.current / data.limit) * 100);
  }
  return 0;
};
