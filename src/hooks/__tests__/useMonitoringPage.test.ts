import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMonitoringPage } from '../useMonitoringPage';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
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

describe('useMonitoringPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with grid view', () => {
    const { result } = renderHook(() => useMonitoringPage(), { wrapper });
    
    expect(result.current.viewMode).toBe('grid');
  });

  it('should toggle auto refresh', () => {
    const { result } = renderHook(() => useMonitoringPage(), { wrapper });
    
    expect(result.current.autoRefresh).toBe(true);
    
    act(() => {
      result.current.setAutoRefresh(false);
    });
    
    expect(result.current.autoRefresh).toBe(false);
  });

  it('should change view mode', () => {
    const { result } = renderHook(() => useMonitoringPage(), { wrapper });
    
    act(() => {
      result.current.setViewMode('list');
    });
    
    expect(result.current.viewMode).toBe('list');
  });
});
