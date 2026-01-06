import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect } from 'vitest';
import { useActivityHistory } from '../useActivityHistory';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: vi.fn(() => ({ select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), order: vi.fn().mockReturnThis(), limit: vi.fn(() => Promise.resolve({ data: [], error: null })) })) },
  isSupabaseReady: true
}));

const wrapper = ({ children }: any) => <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{children}</QueryClientProvider>;

describe('useActivityHistory', () => {
  it('should fetch activity history', () => {
    const { result } = renderHook(() => useActivityHistory('employees', '1'), { wrapper });
    expect(result.current.activities).toBeDefined();
  });
  it('should provide logActivity function', () => {
    const { result } = renderHook(() => useActivityHistory('employees', '1'), { wrapper });
    expect(result.current.logActivity).toBeDefined();
  });
});
