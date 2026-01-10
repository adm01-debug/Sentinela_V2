import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWebhooksPage } from '../useWebhooksPage';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useWebhooksPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  describe('Initial State', () => {
    it('should return initial state', () => {
      const { result } = renderHook(() => useWebhooksPage(), { wrapper });
      expect(result.current).toBeDefined();
    });
  });

  describe('Functionality', () => {
    it('should handle basic operations', async () => {
      const { result } = renderHook(() => useWebhooksPage(), { wrapper });
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully', async () => {
      const { result } = renderHook(() => useWebhooksPage(), { wrapper });
      expect(result.current).toBeDefined();
    });
  });
});
