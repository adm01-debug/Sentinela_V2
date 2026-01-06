import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useSavedFilters, useEntityFilters } from '../useSavedFilters';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null }))
        })),
        order: vi.fn(() => Promise.resolve({ data: [], error: null }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ 
            data: { id: '1', name: 'Test Filter', filters: {} }, 
            error: null 
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: { id: '1' }, error: null }))
          }))
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      }))
    })),
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'user-1' } } }))
    }
  },
  isSupabaseReady: true
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useSavedFilters', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should initialize with empty filters', async () => {
    const { result } = renderHook(() => useSavedFilters('employees'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.filters).toEqual([]);
  });

  it('should have saveFilter mutation', () => {
    const { result } = renderHook(() => useSavedFilters('employees'), { wrapper: createWrapper() });
    expect(result.current.saveFilter).toBeDefined();
  });

  it('should have deleteFilter mutation', () => {
    const { result } = renderHook(() => useSavedFilters('employees'), { wrapper: createWrapper() });
    expect(result.current.deleteFilter).toBeDefined();
  });

  it('should have updateFilter mutation', () => {
    const { result } = renderHook(() => useSavedFilters('employees'), { wrapper: createWrapper() });
    expect(result.current.updateFilter).toBeDefined();
  });
});

describe('useEntityFilters', () => {
  it('should work with different entity types', async () => {
    const { result: empResult } = renderHook(() => useEntityFilters('employees'), { wrapper: createWrapper() });
    const { result: teamResult } = renderHook(() => useEntityFilters('teams'), { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(empResult.current.filters).toBeDefined();
      expect(teamResult.current.filters).toBeDefined();
    });
  });
});
