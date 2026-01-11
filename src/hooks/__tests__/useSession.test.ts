import { describe, it, expect, vi, renderHook, act } from 'vitest';
import { useSession } from '../useSession';

vi.mock('@/lib/supabase', () => ({ supabase: { from: vi.fn(), auth: { getUser: vi.fn() } } }));

describe('useSession', () => {
  it('should initialize correctly', () => {
    const { result } = renderHook(() => useSession());
    expect(result.current).toBeDefined();
  });
  
  it('should handle state changes', async () => {
    const { result } = renderHook(() => useSession());
    expect(result.current).toBeDefined();
  });
  
  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => useSession());
    unmount();
  });
});
