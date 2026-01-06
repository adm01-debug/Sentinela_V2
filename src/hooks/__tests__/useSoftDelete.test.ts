import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useSoftDelete } from '../useSoftDelete';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      update: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: null })) })),
      select: vi.fn(() => ({ eq: vi.fn(() => ({ is: vi.fn(() => Promise.resolve({ data: [], error: null })) })) }))
    }))
  }, isSupabaseReady: true
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const wrapper = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
};

describe('useSoftDelete', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it('should have softDelete mutation', () => {
    const { result } = renderHook(() => useSoftDelete({ tableName: 'employees', onSuccess: vi.fn() }), { wrapper: wrapper() });
    expect(result.current.softDelete).toBeDefined();
  });
  it('should have restore mutation', () => {
    const { result } = renderHook(() => useSoftDelete({ tableName: 'employees', onSuccess: vi.fn() }), { wrapper: wrapper() });
    expect(result.current.restore).toBeDefined();
  });
  it('should have permanentDelete mutation', () => {
    const { result } = renderHook(() => useSoftDelete({ tableName: 'employees', onSuccess: vi.fn() }), { wrapper: wrapper() });
    expect(result.current.permanentDelete).toBeDefined();
  });
  it('should track deletion state', () => {
    const { result } = renderHook(() => useSoftDelete({ tableName: 'employees', onSuccess: vi.fn() }), { wrapper: wrapper() });
    expect(result.current.isDeleting).toBe(false);
  });
});
