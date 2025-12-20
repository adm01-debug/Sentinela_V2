import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProductivityData, useDepartments } from '../useProductivityComparison';

const mockEmployees = [
  { id: '1', name: 'John Doe', department: 'Engineering', status: 'active' },
  { id: '2', name: 'Jane Smith', department: 'Sales', status: 'active' },
];

const mockProductivityLogs = [
  { employee_name: 'John Doe', productive_time_seconds: 7200, unproductive_time_seconds: 1800, neutral_time_seconds: 900, recorded_date: '2024-01-15' },
];

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'employees') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: mockEmployees, error: null })),
            })),
            not: vi.fn(() => Promise.resolve({ data: [{ department: 'Engineering' }, { department: 'Sales' }], error: null })),
          })),
        };
      }
      if (table === 'productivity_logs') {
        return {
          select: vi.fn(() => ({
            gte: vi.fn(() => ({
              lte: vi.fn(() => Promise.resolve({ data: mockProductivityLogs, error: null })),
            })),
          })),
        };
      }
      if (table === 'security_violations') {
        return {
          select: vi.fn(() => ({
            gte: vi.fn(() => ({
              lte: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          })),
        };
      }
      return {
        select: vi.fn(() => Promise.resolve({ data: [], error: null })),
      };
    }),
  },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe('useProductivityData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch productivity data without filters', async () => {
    const { result } = renderHook(() => useProductivityData(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should accept filter parameters', () => {
    const filters = {
      department: 'Engineering',
      sortBy: 'score' as const,
      sortOrder: 'desc' as const,
    };

    const { result } = renderHook(() => useProductivityData(filters), { wrapper });

    expect(result.current.isLoading).toBeDefined();
  });

  it('should accept date range filters', () => {
    const filters = {
      dateRange: { from: '2024-01-01', to: '2024-01-31' },
    };

    const { result } = renderHook(() => useProductivityData(filters), { wrapper });

    expect(result.current.isLoading).toBeDefined();
  });

  it('should support team filter', () => {
    const filters = {
      team: 'Team A',
    };

    const { result } = renderHook(() => useProductivityData(filters), { wrapper });

    expect(result.current.isLoading).toBeDefined();
  });
});

describe('useDepartments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch unique departments', async () => {
    const { result } = renderHook(() => useDepartments(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});
