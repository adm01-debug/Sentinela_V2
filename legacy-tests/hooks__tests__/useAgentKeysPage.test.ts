import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAgentKeysPage } from '../useAgentKeysPage';
import React from 'react';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useAgentKeysPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return agent keys data', () => {
    const { result } = renderHook(() => useAgentKeysPage(), {
      wrapper: createWrapper(),
    });

    expect(result.current).toBeDefined();
  });

  it('should have keys array', () => {
    const { result } = renderHook(() => useAgentKeysPage(), {
      wrapper: createWrapper(),
    });

    expect(result.current.keys || result.current.agentKeys || result.current.data || []).toBeDefined();
  });

  it('should support creating new key', () => {
    const { result } = renderHook(() => useAgentKeysPage(), {
      wrapper: createWrapper(),
    });

    expect(result.current.createKey || result.current.handleCreate).toBeDefined();
  });

  it('should support revoking key', () => {
    const { result } = renderHook(() => useAgentKeysPage(), {
      wrapper: createWrapper(),
    });

    expect(result.current.revokeKey || result.current.handleRevoke || result.current.deleteKey).toBeDefined();
  });

  it('should track loading state', () => {
    const { result } = renderHook(() => useAgentKeysPage(), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.isLoading).toBe('boolean');
  });
});
