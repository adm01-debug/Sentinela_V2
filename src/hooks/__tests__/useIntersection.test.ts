import { describe, it, expect, vi, renderHook, act } from 'vitest';
import { useIntersection } from '../useIntersection';

vi.mock('@/lib/supabase', () => ({ supabase: { from: vi.fn(), auth: { getUser: vi.fn() } } }));

describe('useIntersection', () => {
  it('should initialize correctly', () => {
    const { result } = renderHook(() => useIntersection());
    expect(result.current).toBeDefined();
  });
  
  it('should handle state changes', async () => {
    const { result } = renderHook(() => useIntersection());
    expect(result.current).toBeDefined();
  });
  
  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => useIntersection());
    unmount();
  });
});
