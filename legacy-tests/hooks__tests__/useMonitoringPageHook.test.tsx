import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMonitoringPage } from '../useMonitoringPage';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
          gte: vi.fn(() => Promise.resolve({ data: [], error: null })),
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

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useMonitoringPage(), { wrapper });

    expect(result.current.selectedEmployee).toBeNull();
    expect(result.current.viewMode).toBe('grid');
    expect(result.current.statusFilter).toBe('all');
    expect(result.current.departmentFilter).toBe('all');
    expect(result.current.searchTerm).toBe('');
    expect(result.current.autoRefresh).toBe(true);
    expect(result.current.refreshInterval).toBe(30000);
  });

  it('should update view mode', () => {
    const { result } = renderHook(() => useMonitoringPage(), { wrapper });

    act(() => {
      result.current.setViewMode('list');
    });

    expect(result.current.viewMode).toBe('list');
  });

  it('should update status filter', () => {
    const { result } = renderHook(() => useMonitoringPage(), { wrapper });

    act(() => {
      result.current.setStatusFilter('online');
    });

    expect(result.current.statusFilter).toBe('online');
  });

  it('should update department filter', () => {
    const { result } = renderHook(() => useMonitoringPage(), { wrapper });

    act(() => {
      result.current.setDepartmentFilter('Engineering');
    });

    expect(result.current.departmentFilter).toBe('Engineering');
  });

  it('should update search term', () => {
    const { result } = renderHook(() => useMonitoringPage(), { wrapper });

    act(() => {
      result.current.setSearchTerm('john');
    });

    expect(result.current.searchTerm).toBe('john');
  });

  it('should toggle auto refresh', () => {
    const { result } = renderHook(() => useMonitoringPage(), { wrapper });

    act(() => {
      result.current.setAutoRefresh(false);
    });

    expect(result.current.autoRefresh).toBe(false);
  });

  it('should update refresh interval', () => {
    const { result } = renderHook(() => useMonitoringPage(), { wrapper });

    act(() => {
      result.current.setRefreshInterval(60000);
    });

    expect(result.current.refreshInterval).toBe(60000);
  });

  it('should handle employee selection', () => {
    const { result } = renderHook(() => useMonitoringPage(), { wrapper });

    const mockEmployee = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      department: 'Engineering',
      status: 'online' as const,
      last_activity: '2024-01-01T00:00:00Z',
      productivity_score: 85,
    };

    act(() => {
      result.current.handleSelectEmployee(mockEmployee);
    });

    expect(result.current.selectedEmployee).toEqual(mockEmployee);
  });

  it('should provide initial stats', () => {
    const { result } = renderHook(() => useMonitoringPage(), { wrapper });

    expect(result.current.stats).toEqual({
      total: 0,
      online: 0,
      busy: 0,
      idle: 0,
      offline: 0,
      avgProductivity: 0,
    });
  });
});
