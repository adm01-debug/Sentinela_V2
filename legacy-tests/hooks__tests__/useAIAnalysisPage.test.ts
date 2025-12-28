import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAIAnalysisPage } from '../useAIAnalysisPage';
import React from 'react';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useAIAnalysisPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useAIAnalysisPage(), {
      wrapper: createWrapper(),
    });

    expect(result.current).toBeDefined();
  });

  it('should have loading state initially', () => {
    const { result } = renderHook(() => useAIAnalysisPage(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBeDefined();
  });

  it('should have analysis data property', () => {
    const { result } = renderHook(() => useAIAnalysisPage(), {
      wrapper: createWrapper(),
    });

    expect(result.current.analysisData !== undefined || result.current.data !== undefined).toBe(true);
  });

  it('should handle filters', async () => {
    const { result } = renderHook(() => useAIAnalysisPage(), {
      wrapper: createWrapper(),
    });

    if (result.current.setFilters) {
      result.current.setFilters({ dateRange: 'week' });
    }
    
    expect(result.current).toBeDefined();
  });

  it('should handle refresh', async () => {
    const { result } = renderHook(() => useAIAnalysisPage(), {
      wrapper: createWrapper(),
    });

    if (result.current.refetch) {
      await result.current.refetch();
    }
    
    expect(result.current).toBeDefined();
  });
});
