import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useDuplicate } from '../useDuplicate';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: { id: '1', name: 'Test' }, error: null })) })) })),
      insert: vi.fn(() => ({ select: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: { id: '2', name: 'Test (Copy)' }, error: null })) })) }))
    }))
  }, isSupabaseReady: true
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const wrapper = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
};

describe('useDuplicate', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it('should have duplicate mutation', () => {
    const { result } = renderHook(() => useDuplicate({ tableName: 'employees', onSuccess: vi.fn() }), { wrapper: wrapper() });
    expect(result.current.duplicate).toBeDefined();
  });
  it('should track processing state', () => {
    const { result } = renderHook(() => useDuplicate({ tableName: 'employees', onSuccess: vi.fn() }), { wrapper: wrapper() });
    expect(result.current.isDuplicating).toBe(false);
  });
  it('should support exclude fields option', () => {
    const { result } = renderHook(() => useDuplicate({ tableName: 'employees', excludeFields: ['id', 'created_at'], onSuccess: vi.fn() }), { wrapper: wrapper() });
    expect(result.current.duplicate).toBeDefined();
  });
});
