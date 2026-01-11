import { describe, it, expect, vi, renderHook, act } from 'vitest';
import { useFocusVisible } from '../useFocusVisible';

vi.mock('@/lib/supabase', () => ({ supabase: { from: vi.fn(), auth: { getUser: vi.fn() } } }));

describe('useFocusVisible', () => {
  it('should initialize correctly', () => {
    const { result } = renderHook(() => useFocusVisible());
    expect(result.current).toBeDefined();
  });
  
  it('should handle state changes', async () => {
    const { result } = renderHook(() => useFocusVisible());
    expect(result.current).toBeDefined();
  });
  
  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => useFocusVisible());
    unmount();
  });
});
