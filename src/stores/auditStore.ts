// Audit Store for Sentinela v17
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { AuditLog, AuditLogFilters, AuditLogStats } from '@/types';

interface AuditState {
  logs: AuditLog[];
  filters: AuditLogFilters;
  stats: AuditLogStats | null;
  isLoading: boolean;
  error: string | null;

  setLogs: (logs: AuditLog[]) => void;
  addLog: (log: AuditLog) => void;
  setFilters: (filters: Partial<AuditLogFilters>) => void;
  clearFilters: () => void;
  setStats: (stats: AuditLogStats) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  logs: [],
  filters: {},
  stats: null,
  isLoading: false,
  error: null,
};

export const useAuditStore = create<AuditState>()(
  devtools(
    (set) => ({
      ...initialState,

      setLogs: (logs) => set({ logs }),

      addLog: (log) =>
        set((state) => ({
          logs: [log, ...state.logs].slice(0, 1000),
        })),

      setFilters: (filters) =>
        set((state) => ({ filters: { ...state.filters, ...filters } })),

      clearFilters: () => set({ filters: {} }),

      setStats: (stats) => set({ stats }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      reset: () => set(initialState),
    }),
    { name: 'AuditStore' }
  )
);

// Selectors
export const selectLogsByUser = (userId) => (state: AuditState) =>
  state.logs.filter((l) => l.userId === userId);

export const selectLogsByAction = (action) => (state: AuditState) =>
  state.logs.filter((l) => l.action === action);

export const selectRecentLogs = (count) => (state: AuditState) =>
  state.logs.slice(0, count);
