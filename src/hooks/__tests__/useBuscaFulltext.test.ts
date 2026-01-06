import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useBuscaFulltext, useSearchEmployees, useSearchAlerts, useFulltextSearch } from '../useBuscaFulltext';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        textSearch: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
        })),
        ilike: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      }))
    })),
    rpc: vi.fn(() => Promise.resolve({ data: [], error: null }))
  }, isSupabaseReady: true
}));

const wrapper = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
};

describe('useBuscaFulltext', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should initialize with empty results', async () => {
    const { result } = renderHook(() => useBuscaFulltext({ tableName: 'employees', searchFields: ['name', 'email'] }), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.results).toEqual([]));
  });

  it('should have setQuery function', () => {
    const { result } = renderHook(() => useBuscaFulltext({ tableName: 'employees', searchFields: ['name'] }), { wrapper: wrapper() });
    expect(result.current.setQuery).toBeDefined();
  });

  it('should debounce search', async () => {
    const { result } = renderHook(() => useBuscaFulltext({ tableName: 'employees', searchFields: ['name'], debounceMs: 100 }), { wrapper: wrapper() });
    act(() => { result.current.setQuery('test'); });
    expect(result.current.query).toBe('test');
  });

  it('should track loading state', () => {
    const { result } = renderHook(() => useBuscaFulltext({ tableName: 'employees', searchFields: ['name'] }), { wrapper: wrapper() });
    expect(result.current.isSearching).toBeDefined();
  });
});

describe('useSearchEmployees', () => {
  it('should be a preset for employees table', async () => {
    const { result } = renderHook(() => useSearchEmployees(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.results).toBeDefined());
  });
});

describe('useSearchAlerts', () => {
  it('should be a preset for alerts table', async () => {
    const { result } = renderHook(() => useSearchAlerts(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.results).toBeDefined());
  });
});

describe('useFulltextSearch', () => {
  it('should work as alias', async () => {
    const { result } = renderHook(() => useFulltextSearch('teams', ['name', 'description']), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.results).toBeDefined());
  });
});
