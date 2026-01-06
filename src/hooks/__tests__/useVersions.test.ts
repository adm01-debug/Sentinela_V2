import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useVersions, useEntityVersions } from '../useVersions';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({ eq: vi.fn(() => ({ order: vi.fn(() => Promise.resolve({ data: [], error: null })) })) })),
      insert: vi.fn(() => ({ select: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: { id: '1' }, error: null })) })) }))
    }))
  }, isSupabaseReady: true
}));

const wrapper = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
};

describe('useVersions', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it('should initialize with empty versions', async () => {
    const { result } = renderHook(() => useVersions('employees', '1'), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.versions).toEqual([]));
  });
  it('should have createVersion mutation', () => {
    const { result } = renderHook(() => useVersions('employees', '1'), { wrapper: wrapper() });
    expect(result.current.createVersion).toBeDefined();
  });
  it('should have restoreVersion mutation', () => {
    const { result } = renderHook(() => useVersions('employees', '1'), { wrapper: wrapper() });
    expect(result.current.restoreVersion).toBeDefined();
  });
  it('should have compareVersions function', () => {
    const { result } = renderHook(() => useVersions('employees', '1'), { wrapper: wrapper() });
    expect(result.current.compareVersions).toBeDefined();
  });
});

describe('useEntityVersions', () => {
  it('should work as alias', async () => {
    const { result } = renderHook(() => useEntityVersions('teams', '2'), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.versions).toBeDefined());
  });
});
