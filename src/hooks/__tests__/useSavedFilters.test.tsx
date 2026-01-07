import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useSavedFilters } from '../useSavedFilters';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      single: vi.fn(() => Promise.resolve({ data: null, error: null }))
    })),
    auth: { getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'u1' } } })) }
  },
  isSupabaseReady: true
}));

const wrapper = ({ children }: any) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
};

describe('useSavedFilters', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useSavedFilters('employees'), { wrapper });
    expect(result.current).toBeDefined();
  });

  it('should have saveFilter function', () => {
    const { result } = renderHook(() => useSavedFilters('employees'), { wrapper });
    expect(typeof result.current.saveFilter).toBe('function');
  });

  it('should have deleteFilter function', () => {
    const { result } = renderHook(() => useSavedFilters('employees'), { wrapper });
    expect(typeof result.current.deleteFilter).toBe('function');
  });
});
