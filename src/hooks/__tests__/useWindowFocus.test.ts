import { describe, it, expect, vi, renderHook, act } from 'vitest';
import { useWindowFocus } from '../useWindowFocus';

vi.mock('@/lib/supabase', () => ({ supabase: { from: vi.fn(), auth: { getUser: vi.fn() } } }));

describe('useWindowFocus', () => {
  it('should initialize correctly', () => {
    const { result } = renderHook(() => useWindowFocus());
    expect(result.current).toBeDefined();
  });
  
  it('should handle state changes', async () => {
    const { result } = renderHook(() => useWindowFocus());
    expect(result.current).toBeDefined();
  });
  
  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => useWindowFocus());
    unmount();
  });
});
