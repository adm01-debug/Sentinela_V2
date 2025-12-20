import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTeamsPage } from '../useTeamsPage';

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

describe('useTeamsPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useTeamsPage(), { wrapper });
    expect(result.current.searchTerm).toBe('');
    expect(result.current.statusFilter).toBe('all');
    expect(result.current.isDialogOpen).toBe(false);
  });

  it('should open create dialog', () => {
    const { result } = renderHook(() => useTeamsPage(), { wrapper });
    act(() => { result.current.handleOpenCreate(); });
    expect(result.current.isDialogOpen).toBe(true);
    expect(result.current.editingTeam).toBeNull();
  });

  it('should filter by search', () => {
    const { result } = renderHook(() => useTeamsPage(), { wrapper });
    act(() => { result.current.setSearchTerm('engineering'); });
    expect(result.current.searchTerm).toBe('engineering');
  });

  it('should filter by status', () => {
    const { result } = renderHook(() => useTeamsPage(), { wrapper });
    act(() => { result.current.setStatusFilter('active'); });
    expect(result.current.statusFilter).toBe('active');
  });
});
