import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useInternetAccessPage, URL_CATEGORIES } from '../useInternetAccessPage';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
  },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe('useInternetAccessPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should have URL categories', () => {
    expect(URL_CATEGORIES.length).toBeGreaterThan(0);
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useInternetAccessPage(), { wrapper });
    expect(result.current.searchTerm).toBe('');
    expect(result.current.typeFilter).toBe('all');
  });

  it('should filter by type', () => {
    const { result } = renderHook(() => useInternetAccessPage(), { wrapper });
    act(() => { result.current.setTypeFilter('block'); });
    expect(result.current.typeFilter).toBe('block');
  });
});
