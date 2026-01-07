import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect } from 'vitest';
import { useVersions } from '../useVersions';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: vi.fn(() => ({ select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), order: vi.fn(() => Promise.resolve({ data: [], error: null })) })) },
  isSupabaseReady: true
}));

const wrapper = ({ children }: any) => <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{children}</QueryClientProvider>;

describe('useVersions', () => {
  it('should fetch versions for entity', () => {
    const { result } = renderHook(() => useVersions('employees', '1'), { wrapper });
    expect(result.current.versions).toBeDefined();
  });
  it('should provide restoreVersion function', () => {
    const { result } = renderHook(() => useVersions('employees', '1'), { wrapper });
    expect(result.current.restoreVersion).toBeDefined();
  });
  it('should provide compareVersions function', () => {
    const { result } = renderHook(() => useVersions('employees', '1'), { wrapper });
    expect(result.current.compareVersions).toBeDefined();
  });
});
