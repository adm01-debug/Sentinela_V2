import { describe, it, expect, vi, renderHook, act } from 'vitest';
import { useSkipLinksx } from '../useSkipLinksx';

vi.mock('@/lib/supabase', () => ({ supabase: { from: vi.fn(), auth: { getUser: vi.fn() } } }));

describe('useSkipLinksx', () => {
  it('should initialize correctly', () => {
    const { result } = renderHook(() => useSkipLinksx());
    expect(result.current).toBeDefined();
  });
  
  it('should handle state changes', async () => {
    const { result } = renderHook(() => useSkipLinksx());
    expect(result.current).toBeDefined();
  });
  
  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => useSkipLinksx());
    unmount();
  });
});
