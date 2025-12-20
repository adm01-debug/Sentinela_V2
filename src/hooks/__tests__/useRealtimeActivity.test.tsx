import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRealtimeActivity, useEmployeeActivity } from '../useRealtimeActivity';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      })),
    })),
  },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe('useRealtimeActivity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch realtime activity with default limit', async () => {
    const { result } = renderHook(() => useRealtimeActivity(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeDefined();
  });

  it('should accept custom limit parameter', async () => {
    const { result } = renderHook(() => useRealtimeActivity(100), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});

describe('useEmployeeActivity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not fetch when employeeId is undefined', () => {
    const { result } = renderHook(() => useEmployeeActivity(undefined), { wrapper });

    expect(result.current.fetchStatus).toBe('idle');
  });

  it('should fetch when employeeId is provided', async () => {
    const { result } = renderHook(() => useEmployeeActivity('emp-123'), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});
