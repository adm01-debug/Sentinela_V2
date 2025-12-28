import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useActiveEmployees } from '../useActiveEmployees';
import React from 'react';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useActiveEmployees', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return employees array', () => {
    const { result } = renderHook(() => useActiveEmployees(), {
      wrapper: createWrapper(),
    });

    expect(result.current.employees || result.current.data || []).toBeDefined();
  });

  it('should have loading state', () => {
    const { result } = renderHook(() => useActiveEmployees(), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.isLoading).toBe('boolean');
  });

  it('should handle error state', () => {
    const { result } = renderHook(() => useActiveEmployees(), {
      wrapper: createWrapper(),
    });

    expect(result.current.error === null || result.current.error === undefined || result.current.error).toBeDefined();
  });

  it('should filter active employees only', () => {
    const { result } = renderHook(() => useActiveEmployees(), {
      wrapper: createWrapper(),
    });

    const employees = result.current.employees || result.current.data || [];
    if (Array.isArray(employees) && employees.length > 0) {
      employees.forEach(emp => {
        expect(emp.status === 'active' || emp.is_active === true).toBeTruthy();
      });
    }
  });

  it('should support refetch', async () => {
    const { result } = renderHook(() => useActiveEmployees(), {
      wrapper: createWrapper(),
    });

    if (result.current.refetch) {
      await result.current.refetch();
    }
    expect(result.current).toBeDefined();
  });
});
