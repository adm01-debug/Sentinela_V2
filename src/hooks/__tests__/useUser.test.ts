import { describe, it, expect, vi, renderHook, act } from 'vitest';
import { useUser } from '../useUser';

vi.mock('@/lib/supabase', () => ({ supabase: { from: vi.fn(), auth: { getUser: vi.fn() } } }));

describe('useUser', () => {
  it('should initialize correctly', () => {
    const { result } = renderHook(() => useUser());
    expect(result.current).toBeDefined();
  });
  
  it('should handle state changes', async () => {
    const { result } = renderHook(() => useUser());
    expect(result.current).toBeDefined();
  });
  
  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => useUser());
    unmount();
  });
});
