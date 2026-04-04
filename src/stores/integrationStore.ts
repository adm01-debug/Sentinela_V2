// Integration Store for Sentinela v17
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Integration, IntegrationFilters, IntegrationStats, IntegrationEvent } from '@/types';

interface IntegrationState {
  integrations: Integration[];
  currentIntegration: Integration | null;
  events: IntegrationEvent[];
  filters: IntegrationFilters;
  stats: IntegrationStats | null;
  isLoading: boolean;
  error: string | null;

  setIntegrations: (integrations: Integration[]) => void;
  addIntegration: (integration: Integration) => void;
  updateIntegration: (id: string, data: Partial<Integration>) => void;
  removeIntegration: (id) => void;
  setCurrentIntegration: (integration: Integration | null) => void;
  setEvents: (events: IntegrationEvent[]) => void;
  addEvent: (event: IntegrationEvent) => void;
  setFilters: (filters: Partial<IntegrationFilters>) => void;
  clearFilters: () => void;
  setStats: (stats: IntegrationStats) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  integrations: [],
  currentIntegration: null,
  events: [],
  filters: {},
  stats: null,
  isLoading: false,
  error: null,
};

export const useIntegrationStore = create<IntegrationState>()(
  devtools(
    (set) => ({
      ...initialState,

      setIntegrations: (integrations) => set({ integrations }),

      addIntegration: (integration) =>
        set((state) => ({
          integrations: [...state.integrations, integration],
        })),

      updateIntegration: (id, data) =>
        set((state) => ({
          integrations: state.integrations.map((i) =>
            i.id === id ? { ...i, ...data } : i
          ),
        })),

      removeIntegration: (id) =>
        set((state) => ({
          integrations: state.integrations.filter((i) => i.id !== id),
        })),

      setCurrentIntegration: (integration) => set({ currentIntegration: integration }),

      setEvents: (events) => set({ events }),

      addEvent: (event) =>
        set((state) => ({
          events: [event, ...state.events].slice(0, 100),
        })),

      setFilters: (filters) =>
        set((state) => ({ filters: { ...state.filters, ...filters } })),

      clearFilters: () => set({ filters: {} }),

      setStats: (stats) => set({ stats }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      reset: () => set(initialState),
    }),
    { name: 'IntegrationStore' }
  )
);

// Selectors
export const selectActiveIntegrations = (state: IntegrationState) =>
  state.integrations.filter((i) => i.isActive && i.status === 'connected');

export const selectIntegrationsByType = (type) => (state: IntegrationState) =>
  state.integrations.filter((i) => i.type === type);
