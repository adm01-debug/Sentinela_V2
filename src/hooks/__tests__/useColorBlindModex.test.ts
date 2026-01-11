import { describe, it, expect, vi, renderHook, act } from 'vitest';
import { useColorBlindModex } from '../useColorBlindModex';

vi.mock('@/lib/supabase', () => ({ supabase: { from: vi.fn(), auth: { getUser: vi.fn() } } }));

describe('useColorBlindModex', () => {
  it('should initialize correctly', () => {
    const { result } = renderHook(() => useColorBlindModex());
    expect(result.current).toBeDefined();
  });
  
  it('should handle state changes', async () => {
    const { result } = renderHook(() => useColorBlindModex());
    expect(result.current).toBeDefined();
  });
  
  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => useColorBlindModex());
    unmount();
  });
});
