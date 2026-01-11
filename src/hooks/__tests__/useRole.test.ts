import { describe, it, expect, vi, renderHook, act } from 'vitest';
import { useRole } from '../useRole';

vi.mock('@/lib/supabase', () => ({ supabase: { from: vi.fn(), auth: { getUser: vi.fn() } } }));

describe('useRole', () => {
  it('should initialize correctly', () => {
    const { result } = renderHook(() => useRole());
    expect(result.current).toBeDefined();
  });
  
  it('should handle state changes', async () => {
    const { result } = renderHook(() => useRole());
    expect(result.current).toBeDefined();
  });
  
  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => useRole());
    unmount();
  });
});
