import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMonitoringPoliciesPage } from '../useMonitoringPoliciesPage';

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

describe('useMonitoringPoliciesPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useMonitoringPoliciesPage(), { wrapper });
    expect(result.current.searchTerm).toBe('');
    expect(result.current.isDialogOpen).toBe(false);
  });

  it('should open create dialog with default form', () => {
    const { result } = renderHook(() => useMonitoringPoliciesPage(), { wrapper });
    act(() => { result.current.handleOpenCreate(); });
    expect(result.current.isDialogOpen).toBe(true);
    expect(result.current.formData.screenshot_interval).toBe(300);
    expect(result.current.formData.activity_tracking).toBe(true);
  });

  it('should close dialog and reset form', () => {
    const { result } = renderHook(() => useMonitoringPoliciesPage(), { wrapper });
    act(() => { result.current.handleOpenCreate(); });
    act(() => { result.current.handleCloseDialog(); });
    expect(result.current.isDialogOpen).toBe(false);
  });
});
