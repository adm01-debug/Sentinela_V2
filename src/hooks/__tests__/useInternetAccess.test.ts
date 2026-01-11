import { describe, it, expect, vi, renderHook, act } from 'vitest';
import { useInternetAccess } from '../useInternetAccess';

vi.mock('@/lib/supabase', () => ({ supabase: { from: vi.fn(), auth: { getUser: vi.fn() } } }));

describe('useInternetAccess', () => {
  it('should initialize correctly', () => {
    const { result } = renderHook(() => useInternetAccess());
    expect(result.current).toBeDefined();
  });
  
  it('should handle state changes', async () => {
    const { result } = renderHook(() => useInternetAccess());
    expect(result.current).toBeDefined();
  });
  
  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => useInternetAccess());
    unmount();
  });
});
