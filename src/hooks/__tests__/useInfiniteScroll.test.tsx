import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect } from 'vitest';
import { useInfiniteScroll } from '../useInfiniteScroll';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: vi.fn(() => ({ select: vi.fn().mockReturnThis(), range: vi.fn(() => Promise.resolve({ data: [], error: null, count: 0 })) })) },
  isSupabaseReady: true
}));

const wrapper = ({ children }: any) => <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{children}</QueryClientProvider>;

describe('useInfiniteScroll', () => {
  it('should provide data array', () => {
    const { result } = renderHook(() => useInfiniteScroll({ table: 'employees', pageSize: 20 }), { wrapper });
    expect(result.current.data).toBeDefined();
  });
  it('should provide loadMore function', () => {
    const { result } = renderHook(() => useInfiniteScroll({ table: 'employees', pageSize: 20 }), { wrapper });
    expect(result.current.loadMore).toBeDefined();
  });
  it('should track hasMore state', () => {
    const { result } = renderHook(() => useInfiniteScroll({ table: 'employees', pageSize: 20 }), { wrapper });
    expect(typeof result.current.hasMore).toBe('boolean');
  });
});
