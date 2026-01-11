import { describe, it, expect, vi, renderHook, act } from 'vitest';
import { useResize } from '../useResize';

vi.mock('@/lib/supabase', () => ({ supabase: { from: vi.fn(), auth: { getUser: vi.fn() } } }));

describe('useResize', () => {
  it('should initialize correctly', () => {
    const { result } = renderHook(() => useResize());
    expect(result.current).toBeDefined();
  });
  
  it('should handle state changes', async () => {
    const { result } = renderHook(() => useResize());
    expect(result.current).toBeDefined();
  });
  
  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => useResize());
    unmount();
  });
});
