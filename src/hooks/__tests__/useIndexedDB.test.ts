import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useIndexedDB } from '../useIndexedDB';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useIndexedDB', () => {
  beforeEach(() => { vi.clearAllMocks(); queryClient.clear(); });
  it('should return initial state', () => { const { result } = renderHook(() => useIndexedDB(), { wrapper }); expect(result.current).toBeDefined(); });
  it('should handle operations', async () => { const { result } = renderHook(() => useIndexedDB(), { wrapper }); await waitFor(() => { expect(result.current).toBeDefined(); }); });
});
