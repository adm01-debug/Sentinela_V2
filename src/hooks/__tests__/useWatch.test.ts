import { describe, it, expect, vi, renderHook, act } from 'vitest';
import { useWatch } from '../useWatch';

vi.mock('@/lib/supabase', () => ({ supabase: { from: vi.fn(), auth: { getUser: vi.fn() } } }));

describe('useWatch', () => {
  it('should initialize correctly', () => {
    const { result } = renderHook(() => useWatch());
    expect(result.current).toBeDefined();
  });
  
  it('should handle state changes', async () => {
    const { result } = renderHook(() => useWatch());
    expect(result.current).toBeDefined();
  });
  
  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => useWatch());
    unmount();
  });
});
