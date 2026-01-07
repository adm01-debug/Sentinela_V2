import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect } from 'vitest';
import { useSoftDelete } from '../useSoftDelete';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: vi.fn(() => ({ update: vi.fn().mockReturnThis(), eq: vi.fn(() => Promise.resolve({ error: null })) })) },
  isSupabaseReady: true
}));

const wrapper = ({ children }: any) => <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{children}</QueryClientProvider>;

describe('useSoftDelete', () => {
  it('should provide softDelete function', () => {
    const { result } = renderHook(() => useSoftDelete('employees'), { wrapper });
    expect(result.current.softDelete).toBeDefined();
  });
  it('should provide restore function', () => {
    const { result } = renderHook(() => useSoftDelete('employees'), { wrapper });
    expect(result.current.restore).toBeDefined();
  });
  it('should provide permanentDelete function', () => {
    const { result } = renderHook(() => useSoftDelete('employees'), { wrapper });
    expect(result.current.permanentDelete).toBeDefined();
  });
});
