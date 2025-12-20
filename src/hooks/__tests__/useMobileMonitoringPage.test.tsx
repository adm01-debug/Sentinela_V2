import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMobileMonitoringPage } from '../useMobileMonitoringPage';

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
          gte: vi.fn(() => ({
            lte: vi.fn(() => Promise.resolve({ data: [], error: null })),
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

describe('useMobileMonitoringPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useMobileMonitoringPage(), { wrapper });

    expect(result.current.selectedDevice).toBeNull();
    expect(result.current.viewMode).toBe('list');
    expect(result.current.statusFilter).toBe('all');
    expect(result.current.searchTerm).toBe('');
    expect(result.current.autoRefresh).toBe(true);
    expect(result.current.dateRange).toBeNull();
  });

  it('should update view mode', () => {
    const { result } = renderHook(() => useMobileMonitoringPage(), { wrapper });

    act(() => {
      result.current.setViewMode('map');
    });

    expect(result.current.viewMode).toBe('map');
  });

  it('should update status filter', () => {
    const { result } = renderHook(() => useMobileMonitoringPage(), { wrapper });

    act(() => {
      result.current.setStatusFilter('online');
    });

    expect(result.current.statusFilter).toBe('online');
  });

  it('should update search term', () => {
    const { result } = renderHook(() => useMobileMonitoringPage(), { wrapper });

    act(() => {
      result.current.setSearchTerm('test device');
    });

    expect(result.current.searchTerm).toBe('test device');
  });

  it('should toggle auto refresh', () => {
    const { result } = renderHook(() => useMobileMonitoringPage(), { wrapper });

    act(() => {
      result.current.setAutoRefresh(false);
    });

    expect(result.current.autoRefresh).toBe(false);
  });

  it('should handle device selection', () => {
    const { result } = renderHook(() => useMobileMonitoringPage(), { wrapper });

    const mockDevice = {
      id: '1',
      device_id: 'device-123',
      employee_id: 'emp-1',
      employee_name: 'Test Employee',
      device_model: 'iPhone 15',
      os: 'iOS',
      os_version: '17.0',
      app_version: '1.0.0',
      last_seen: '2024-01-01T00:00:00Z',
      battery_level: 80,
      is_charging: false,
      is_online: true,
    };

    act(() => {
      result.current.handleSelectDevice(mockDevice);
    });

    expect(result.current.selectedDevice).toEqual(mockDevice);
  });

  it('should provide initial stats', () => {
    const { result } = renderHook(() => useMobileMonitoringPage(), { wrapper });

    expect(result.current.stats).toEqual({
      total: 0,
      online: 0,
      offline: 0,
      lowBattery: 0,
    });
  });

  it('should update date range', () => {
    const { result } = renderHook(() => useMobileMonitoringPage(), { wrapper });

    const dateRange = { from: new Date('2024-01-01'), to: new Date('2024-01-31') };

    act(() => {
      result.current.setDateRange(dateRange);
    });

    expect(result.current.dateRange).toEqual(dateRange);
  });
});
