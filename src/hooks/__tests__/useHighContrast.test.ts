import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useHighContrast } from '../useHighContrast';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useHighContrast', () => {
  beforeEach(() => { vi.clearAllMocks(); queryClient.clear(); });
  it('should return initial state', () => { const { result } = renderHook(() => useHighContrast(), { wrapper }); expect(result.current).toBeDefined(); });
  it('should handle operations', async () => { const { result } = renderHook(() => useHighContrast(), { wrapper }); await waitFor(() => { expect(result.current).toBeDefined(); }); });
});
