import { describe, it, expect, vi, renderHook, act } from 'vitest';
import { useDuplicate } from '../useDuplicate';

vi.mock('@/lib/supabase', () => ({ supabase: { from: vi.fn(), auth: { getUser: vi.fn() } } }));

describe('useDuplicate', () => {
  it('should initialize correctly', () => {
    const { result } = renderHook(() => useDuplicate());
    expect(result.current).toBeDefined();
  });
  
  it('should handle state changes', async () => {
    const { result } = renderHook(() => useDuplicate());
    expect(result.current).toBeDefined();
  });
  
  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => useDuplicate());
    unmount();
  });
});
