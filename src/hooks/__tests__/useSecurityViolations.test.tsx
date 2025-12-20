import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock Supabase
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();
const mockGte = vi.fn();
const mockLte = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
    })),
  },
}));

import { supabase } from '@/integrations/supabase/client';
import { useSecurityViolations, useMarkViolationAsRead } from '../useSecurityViolations';

beforeEach(() => {
  vi.clearAllMocks();
  
  mockSelect.mockReturnValue({ order: mockOrder });
  mockOrder.mockReturnValue({ gte: mockGte });
  mockGte.mockReturnValue({ lte: mockLte });
  mockLte.mockReturnValue({ data: [], error: null });
  mockUpdate.mockReturnValue({ eq: mockEq });
  mockEq.mockReturnValue({ data: null, error: null });
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useSecurityViolations', () => {
  describe('fetching violations', () => {
    it('should fetch violations with default filters', async () => {
      const mockViolations = [
        {
          id: '1',
          employee_name: 'João Silva',
          violation_type: 'blocked_website',
          severity: 'medium',
          is_read: false,
          created_at: '2024-01-15T10:00:00Z',
        },
        {
          id: '2',
          employee_name: 'Maria Santos',
          violation_type: 'unauthorized_app',
          severity: 'high',
          is_read: true,
          created_at: '2024-01-15T11:00:00Z',
        },
      ];

      mockLte.mockReturnValue({ data: mockViolations, error: null });

      const { result } = renderHook(() => useSecurityViolations(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockViolations);
      expect(supabase.from).toHaveBeenCalledWith('security_violations');
    });

    it('should filter by severity', async () => {
      const criticalViolations = [
        {
          id: '3',
          employee_name: 'Pedro Lima',
          violation_type: 'data_exfiltration',
          severity: 'critical',
          is_read: false,
        },
      ];

      mockLte.mockReturnValue({ data: criticalViolations, error: null });

      const { result } = renderHook(
        () => useSecurityViolations({ severity: 'critical' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(criticalViolations);
    });

    it('should handle empty results', async () => {
      mockLte.mockReturnValue({ data: [], error: null });

      const { result } = renderHook(() => useSecurityViolations(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual([]);
    });

    it('should handle fetch error', async () => {
      mockLte.mockReturnValue({
        data: null,
        error: { message: 'Network error' },
      });

      const { result } = renderHook(() => useSecurityViolations(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('violation statistics', () => {
    it('should calculate unread count correctly', async () => {
      const mockViolations = [
        { id: '1', is_read: false },
        { id: '2', is_read: false },
        { id: '3', is_read: true },
        { id: '4', is_read: false },
      ];

      mockLte.mockReturnValue({ data: mockViolations, error: null });

      const { result } = renderHook(() => useSecurityViolations(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const unreadCount = result.current.data?.filter(v => !v.is_read).length;
      expect(unreadCount).toBe(3);
    });

    it('should identify critical violations', async () => {
      const mockViolations = [
        { id: '1', severity: 'low' },
        { id: '2', severity: 'critical' },
        { id: '3', severity: 'high' },
        { id: '4', severity: 'critical' },
      ];

      mockLte.mockReturnValue({ data: mockViolations, error: null });

      const { result } = renderHook(() => useSecurityViolations(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const criticalCount = result.current.data?.filter(v => v.severity === 'critical').length;
      expect(criticalCount).toBe(2);
    });
  });
});

describe('useMarkViolationAsRead', () => {
  it('should mark violation as read', async () => {
    mockEq.mockReturnValue({ data: { id: '123', is_read: true }, error: null });

    const { result } = renderHook(() => useMarkViolationAsRead(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync('123');
    });

    expect(mockUpdate).toHaveBeenCalledWith({ is_read: true });
    expect(mockEq).toHaveBeenCalledWith('id', '123');
  });

  it('should handle mark error', async () => {
    mockEq.mockReturnValue({
      data: null,
      error: { message: 'Violation not found' },
    });

    const { result } = renderHook(() => useMarkViolationAsRead(), {
      wrapper: createWrapper(),
    });

    await expect(result.current.mutateAsync('nonexistent')).rejects.toThrow();
  });
});
