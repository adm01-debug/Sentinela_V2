// Search Store for Sentinela v17
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  description?: string;
  icon?: string;
  url?: string;
  score: number;
  meta?: Record<string, unknown>;
}

type SearchResultType = 'employee' | 'activity' | 'alert' | 'report' | 'team' | 'project' | 'setting' | 'page';

interface SearchFilters {
  types?: SearchResultType[];
  dateRange?: { start: string; end: string };
  teamId?: string;
  departmentId?: string;
}

interface SearchState {
  isOpen: boolean;
  query: string;
  results: SearchResult[];
  filters: SearchFilters;
  recentSearches: string[];
  recentResults: SearchResult[];
  isLoading: boolean;
  error: string | null;
  selectedIndex: number;

  open: () => void;
  close: () => void;
  toggle: () => void;
  setQuery: (query: string) => void;
  clearQuery: () => void;
  setResults: (results: SearchResult[]) => void;
  clearResults: () => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  clearFilters: () => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  addRecentResult: (result: SearchResult) => void;
  clearRecentResults: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedIndex: (index: number) => void;
  selectNext: () => void;
  selectPrevious: () => void;
  reset: () => void;
}

const MAX_RECENT_SEARCHES = 10;
const MAX_RECENT_RESULTS = 5;

export const useSearchStore = create<SearchState>()(
  devtools(
    persist(
      (set, get) => ({
        isOpen: false,
        query: '',
        results: [],
        filters: {},
        recentSearches: [],
        recentResults: [],
        isLoading: false,
        error: null,
        selectedIndex: 0,

        open: () => set({ isOpen: true }),

        close: () => set({ isOpen: false, query: '', results: [], selectedIndex: 0 }),

        toggle: () => set((state) => ({ isOpen: !state.isOpen })),

        setQuery: (query) => set({ query, selectedIndex: 0 }),

        clearQuery: () => set({ query: '', results: [], selectedIndex: 0 }),

        setResults: (results) => set({ results }),

        clearResults: () => set({ results: [] }),

        setFilters: (filters) =>
          set((state) => ({ filters: { ...state.filters, ...filters } })),

        clearFilters: () => set({ filters: {} }),

        addRecentSearch: (query) =>
          set((state) => ({
            recentSearches: [query, ...state.recentSearches.filter((q) => q !== query)].slice(0, MAX_RECENT_SEARCHES),
          })),

        clearRecentSearches: () => set({ recentSearches: [] }),

        addRecentResult: (result) =>
          set((state) => ({
            recentResults: [result, ...state.recentResults.filter((r) => r.id !== result.id)].slice(0, MAX_RECENT_RESULTS),
          })),

        clearRecentResults: () => set({ recentResults: [] }),

        setLoading: (isLoading) => set({ isLoading }),

        setError: (error) => set({ error }),

        setSelectedIndex: (selectedIndex) => set({ selectedIndex }),

        selectNext: () =>
          set((state) => ({
            selectedIndex: (state.selectedIndex + 1) % Math.max(state.results.length, 1),
          })),

        selectPrevious: () =>
          set((state) => ({
            selectedIndex: (state.selectedIndex - 1 + state.results.length) % Math.max(state.results.length, 1),
          })),

        reset: () =>
          set({
            isOpen: false,
            query: '',
            results: [],
            filters: {},
            isLoading: false,
            error: null,
            selectedIndex: 0,
          }),
      }),
      {
        name: 'search-store',
        partialize: (state) => ({
          recentSearches: state.recentSearches,
          recentResults: state.recentResults,
          filters: state.filters,
        }),
      }
    ),
    { name: 'SearchStore' }
  )
);

// Selectors
export const selectGroupedResults = (state: SearchState) => {
  const groups: Record<SearchResultType, SearchResult[]> = {
    employee: [],
    activity: [],
    alert: [],
    report: [],
    team: [],
    project: [],
    setting: [],
    page: [],
  };

  state.results.forEach((result) => {
    groups[result.type].push(result);
  });

  return Object.entries(groups)
    .filter(([, results]) => results.length > 0)
    .map(([type, results]) => ({ type: type as SearchResultType, results }));
};
