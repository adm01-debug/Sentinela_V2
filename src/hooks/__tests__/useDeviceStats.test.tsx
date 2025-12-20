import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDeviceStats } from '@/hooks/useDeviceStats';
import { supabase } from '@/integrations/supabase/client';
import { ReactNode } from 'react';

// Wrapper para React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useDeviceStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial loading state', () => {
    const { result } = renderHook(() => useDeviceStats(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('should fetch device stats successfully', async () => {
    // Mock do Supabase
    const mockDevices = [
      { device_type: 'desktop', is_active: true },
      { device_type: 'laptop', is_active: false },
      { device_type: 'mobile', is_active: true },
    ];

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: mockDevices, error: null }),
    } as any);

    const { result } = renderHook(() => useDeviceStats(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should handle errors gracefully', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockResolvedValue({ 
        data: null, 
        error: { message: 'Database error' } 
      }),
    } as any);

    const { result } = renderHook(() => useDeviceStats(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
