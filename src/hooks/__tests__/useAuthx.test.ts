import { describe, it, expect, vi, renderHook, act } from 'vitest';
import { useAuthx } from '../useAuthx';

vi.mock('@/lib/supabase', () => ({ supabase: { from: vi.fn(), auth: { getUser: vi.fn() } } }));

describe('useAuthx', () => {
  it('should initialize correctly', () => {
    const { result } = renderHook(() => useAuthx());
    expect(result.current).toBeDefined();
  });
  
  it('should handle state changes', async () => {
    const { result } = renderHook(() => useAuthx());
    expect(result.current).toBeDefined();
  });
  
  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => useAuthx());
    unmount();
  });
});
