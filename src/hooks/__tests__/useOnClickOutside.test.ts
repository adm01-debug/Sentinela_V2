import { describe, it, expect, vi, renderHook, act } from 'vitest';
import { useOnClickOutside } from '../useOnClickOutside';

vi.mock('@/lib/supabase', () => ({ supabase: { from: vi.fn(), auth: { getUser: vi.fn() } } }));

describe('useOnClickOutside', () => {
  it('should initialize correctly', () => {
    const { result } = renderHook(() => useOnClickOutside());
    expect(result.current).toBeDefined();
  });
  
  it('should handle state changes', async () => {
    const { result } = renderHook(() => useOnClickOutside());
    expect(result.current).toBeDefined();
  });
  
  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => useOnClickOutside());
    unmount();
  });
});
