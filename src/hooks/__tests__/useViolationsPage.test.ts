import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useViolationsPage, VIOLATION_TYPES } from '../useViolationsPage';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({ order: vi.fn(() => Promise.resolve({ data: [], error: null })) })),
    })),
  },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe('useViolationsPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should have violation types', () => {
    expect(VIOLATION_TYPES.length).toBeGreaterThan(0);
  });

  it('should initialize with default filters', () => {
    const { result } = renderHook(() => useViolationsPage(), { wrapper });
    expect(result.current.severityFilter).toBe('all');
    expect(result.current.statusFilter).toBe('all');
    expect(result.current.typeFilter).toBe('all');
  });

  it('should filter by severity', () => {
    const { result } = renderHook(() => useViolationsPage(), { wrapper });
    act(() => { result.current.setSeverityFilter('critical'); });
    expect(result.current.severityFilter).toBe('critical');
  });

  it('should filter by status', () => {
    const { result } = renderHook(() => useViolationsPage(), { wrapper });
    act(() => { result.current.setStatusFilter('open'); });
    expect(result.current.statusFilter).toBe('open');
  });
});
