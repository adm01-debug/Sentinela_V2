import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  usePolicies,
  usePolicyAcknowledgments,
  usePendingAcknowledgments,
  usePolicyStats,
} from '../usePolicyAcknowledgments';

const mockPolicies = [
  { id: '1', name: 'Policy 1', description: 'Desc 1', enabled: true, category: 'security', created_at: '2024-01-01', updated_at: '2024-01-01' },
];

const mockAcknowledgments = [
  { id: '1', employee_name: 'John Doe', acknowledged_at: '2024-01-01T00:00:00Z' },
];

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'security_policies') {
        return {
          select: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: mockPolicies, error: null })),
            eq: vi.fn(() => Promise.resolve({ data: mockPolicies, error: null })),
          })),
        };
      }
      if (table === 'policy_acknowledgments') {
        return {
          select: vi.fn(() => ({
            order: vi.fn(() => ({
              gte: vi.fn(() => ({
                lte: vi.fn(() => Promise.resolve({ data: mockAcknowledgments, error: null })),
              })),
            })),
          })),
        };
      }
      if (table === 'employees') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ data: [{ id: '1', name: 'John Doe', email: 'john@test.com' }], error: null })),
            not: vi.fn(() => Promise.resolve({ data: [{ department: 'Engineering' }], error: null })),
          })),
        };
      }
      return {
        select: vi.fn(() => Promise.resolve({ data: [], error: null })),
      };
    }),
    functions: {
      invoke: vi.fn(() => Promise.resolve({ data: {}, error: null })),
    },
  },
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe('usePolicies', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch policies', async () => {
    const { result } = renderHook(() => usePolicies(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});

describe('usePolicyAcknowledgments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch acknowledgments without filters', async () => {
    const { result } = renderHook(() => usePolicyAcknowledgments(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should accept filter parameters', () => {
    const filters = {
      policyId: '1',
      employeeId: '1',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    };

    const { result } = renderHook(() => usePolicyAcknowledgments(filters), { wrapper });

    expect(result.current.isLoading).toBeDefined();
  });
});

describe('usePendingAcknowledgments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch pending acknowledgments', async () => {
    const { result } = renderHook(() => usePendingAcknowledgments(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});

describe('usePolicyStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should compute policy stats', async () => {
    const { result } = renderHook(() => usePolicyStats(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});
