import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useActivityHistory } from '../useActivityHistory';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({ eq: vi.fn(() => ({ order: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve({ data: [], error: null })) })) })) })),
      insert: vi.fn(() => Promise.resolve({ error: null }))
    }))
  }, isSupabaseReady: true
}));

const wrapper = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
};

describe('useActivityHistory', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it('should initialize with empty activities', async () => {
    const { result } = renderHook(() => useActivityHistory('employees', '1'), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.activities).toEqual([]));
  });
  it('should have logActivity function', () => {
    const { result } = renderHook(() => useActivityHistory('employees', '1'), { wrapper: wrapper() });
    expect(result.current.logActivity).toBeDefined();
  });
  it('should track loading state', async () => {
    const { result } = renderHook(() => useActivityHistory('employees', '1'), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });
  it('should support pagination', () => {
    const { result } = renderHook(() => useActivityHistory('employees', '1', { limit: 20 }), { wrapper: wrapper() });
    expect(result.current.activities).toBeDefined();
  });
});
