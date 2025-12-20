import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSensitiveKeywordsPage, KEYWORD_CATEGORIES } from '../useSensitiveKeywordsPage';

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

describe('useSensitiveKeywordsPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should have keyword categories', () => {
    expect(KEYWORD_CATEGORIES.length).toBeGreaterThan(0);
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useSensitiveKeywordsPage(), { wrapper });
    expect(result.current.searchTerm).toBe('');
    expect(result.current.categoryFilter).toBe('all');
  });

  it('should filter by category', () => {
    const { result } = renderHook(() => useSensitiveKeywordsPage(), { wrapper });
    act(() => { result.current.setCategoryFilter('financial'); });
    expect(result.current.categoryFilter).toBe('financial');
  });
});
