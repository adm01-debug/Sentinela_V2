import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useInfiniteScroll, useLoadMore, useVirtualizedInfiniteScroll } from '../useInfiniteScroll';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        range: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [{ id: '1' }, { id: '2' }], error: null }))
        }))
      }))
    }))
  }, isSupabaseReady: true
}));

const wrapper = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
};

describe('useInfiniteScroll', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should initialize with empty data', async () => {
    const { result } = renderHook(() => useInfiniteScroll({ tableName: 'employees', pageSize: 10 }), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.data).toBeDefined());
  });

  it('should have fetchNextPage function', () => {
    const { result } = renderHook(() => useInfiniteScroll({ tableName: 'employees', pageSize: 10 }), { wrapper: wrapper() });
    expect(result.current.fetchNextPage).toBeDefined();
  });

  it('should track hasNextPage', () => {
    const { result } = renderHook(() => useInfiniteScroll({ tableName: 'employees', pageSize: 10 }), { wrapper: wrapper() });
    expect(result.current.hasNextPage).toBeDefined();
  });

  it('should track loading state', () => {
    const { result } = renderHook(() => useInfiniteScroll({ tableName: 'employees', pageSize: 10 }), { wrapper: wrapper() });
    expect(result.current.isFetchingNextPage).toBeDefined();
  });
});

describe('useLoadMore', () => {
  it('should work as simplified alias', async () => {
    const { result } = renderHook(() => useLoadMore('employees', 20), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.data).toBeDefined());
  });
});

describe('useVirtualizedInfiniteScroll', () => {
  it('should support virtualization config', async () => {
    const { result } = renderHook(() => useVirtualizedInfiniteScroll({ tableName: 'employees', pageSize: 50, itemHeight: 40 }), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.data).toBeDefined());
  });
});
