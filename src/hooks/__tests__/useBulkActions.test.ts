import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useBulkActions } from '../useBulkActions';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      update: vi.fn(() => ({ in: vi.fn(() => Promise.resolve({ error: null, count: 5 })) })),
      delete: vi.fn(() => ({ in: vi.fn(() => Promise.resolve({ error: null, count: 5 })) }))
    }))
  },
  isSupabaseReady: true
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const createWrapper = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
};

describe('useBulkActions', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useBulkActions({ tableName: 'employees', onSuccess: vi.fn() }), { wrapper: createWrapper() });
    expect(result.current.selectedIds).toEqual([]);
    expect(result.current.isProcessing).toBe(false);
  });

  it('should select and deselect items', () => {
    const { result } = renderHook(() => useBulkActions({ tableName: 'employees', onSuccess: vi.fn() }), { wrapper: createWrapper() });
    act(() => { result.current.toggleSelection('1'); });
    expect(result.current.selectedIds).toContain('1');
    act(() => { result.current.toggleSelection('1'); });
    expect(result.current.selectedIds).not.toContain('1');
  });

  it('should select all items', () => {
    const { result } = renderHook(() => useBulkActions({ tableName: 'employees', onSuccess: vi.fn() }), { wrapper: createWrapper() });
    act(() => { result.current.selectAll(['1', '2', '3']); });
    expect(result.current.selectedIds).toEqual(['1', '2', '3']);
  });

  it('should clear selection', () => {
    const { result } = renderHook(() => useBulkActions({ tableName: 'employees', onSuccess: vi.fn() }), { wrapper: createWrapper() });
    act(() => { result.current.selectAll(['1', '2']); });
    act(() => { result.current.clearSelection(); });
    expect(result.current.selectedIds).toEqual([]);
  });

  it('should have bulk update mutation', () => {
    const { result } = renderHook(() => useBulkActions({ tableName: 'employees', onSuccess: vi.fn() }), { wrapper: createWrapper() });
    expect(result.current.bulkUpdate).toBeDefined();
  });

  it('should have bulk delete mutation', () => {
    const { result } = renderHook(() => useBulkActions({ tableName: 'employees', onSuccess: vi.fn() }), { wrapper: createWrapper() });
    expect(result.current.bulkDelete).toBeDefined();
  });
});
