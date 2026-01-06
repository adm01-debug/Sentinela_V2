import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect } from 'vitest';
import { useBulkActions } from '../useBulkActions';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: vi.fn(() => ({ update: vi.fn().mockReturnThis(), in: vi.fn(() => Promise.resolve({ error: null })), delete: vi.fn().mockReturnThis() })) },
  isSupabaseReady: true
}));

const wrapper = ({ children }: any) => <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{children}</QueryClientProvider>;

describe('useBulkActions', () => {
  it('should provide bulkUpdate function', () => {
    const { result } = renderHook(() => useBulkActions('employees'), { wrapper });
    expect(result.current.bulkUpdate).toBeDefined();
  });
  it('should provide bulkDelete function', () => {
    const { result } = renderHook(() => useBulkActions('employees'), { wrapper });
    expect(result.current.bulkDelete).toBeDefined();
  });
  it('should track selected items', () => {
    const { result } = renderHook(() => useBulkActions('employees'), { wrapper });
    expect(result.current.selectedIds).toBeDefined();
  });
});
