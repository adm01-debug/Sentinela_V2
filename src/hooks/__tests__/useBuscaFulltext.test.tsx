import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect } from 'vitest';
import { useBuscaFulltext } from '../useBuscaFulltext';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: vi.fn(() => ({ select: vi.fn().mockReturnThis(), textSearch: vi.fn().mockReturnThis(), limit: vi.fn(() => Promise.resolve({ data: [], error: null })) })) },
  isSupabaseReady: true
}));

const wrapper = ({ children }: any) => <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{children}</QueryClientProvider>;

describe('useBuscaFulltext', () => {
  it('should provide search function', () => {
    const { result } = renderHook(() => useBuscaFulltext({ table: 'employees', columns: ['name', 'email'] }), { wrapper });
    expect(result.current.search).toBeDefined();
  });
  it('should provide results array', () => {
    const { result } = renderHook(() => useBuscaFulltext({ table: 'employees', columns: ['name'] }), { wrapper });
    expect(result.current.results).toBeDefined();
  });
  it('should track searching state', () => {
    const { result } = renderHook(() => useBuscaFulltext({ table: 'employees', columns: ['name'] }), { wrapper });
    expect(typeof result.current.isSearching).toBe('boolean');
  });
});
