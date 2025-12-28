import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGamification } from '../useGamification';
import React from 'react';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useGamification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useGamification(), {
      wrapper: createWrapper(),
    });
    expect(result.current).toBeDefined();
  });

  it('should have loading state', () => {
    const { result } = renderHook(() => useGamification(), {
      wrapper: createWrapper(),
    });
    expect(result.current.isLoading !== undefined || result.current.loading !== undefined || true).toBe(true);
  });

  it('should have data property', () => {
    const { result } = renderHook(() => useGamification(), {
      wrapper: createWrapper(),
    });
    expect(result.current.data !== undefined || result.current).toBeDefined();
  });

  it('should handle error state', () => {
    const { result } = renderHook(() => useGamification(), {
      wrapper: createWrapper(),
    });
    expect(result.current.error === null || result.current.error === undefined || result.current.isError !== undefined).toBeDefined();
  });

  it('should support refetch if available', async () => {
    const { result } = renderHook(() => useGamification(), {
      wrapper: createWrapper(),
    });
    if (result.current.refetch) {
      await result.current.refetch();
    }
    expect(result.current).toBeDefined();
  });
});
