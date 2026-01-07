import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect } from 'vitest';
import { useDuplicate } from '../useDuplicate';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: vi.fn(() => ({ select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn(() => Promise.resolve({ data: {}, error: null })), insert: vi.fn().mockReturnThis() })) },
  isSupabaseReady: true
}));

const wrapper = ({ children }: any) => <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{children}</QueryClientProvider>;

describe('useDuplicate', () => {
  it('should provide duplicate function', () => {
    const { result } = renderHook(() => useDuplicate('employees'), { wrapper });
    expect(result.current.duplicate).toBeDefined();
  });
  it('should track duplicating state', () => {
    const { result } = renderHook(() => useDuplicate('employees'), { wrapper });
    expect(result.current.isDuplicating).toBe(false);
  });
});
