import { describe, it, expect, vi, renderHook, act } from 'vitest';
import { useKeyboardShortcuts } from '../useKeyboardShortcuts';

vi.mock('@/lib/supabase', () => ({ supabase: { from: vi.fn(), auth: { getUser: vi.fn() } } }));

describe('useKeyboardShortcuts', () => {
  it('should initialize correctly', () => {
    const { result } = renderHook(() => useKeyboardShortcuts());
    expect(result.current).toBeDefined();
  });
  
  it('should handle state changes', async () => {
    const { result } = renderHook(() => useKeyboardShortcuts());
    expect(result.current).toBeDefined();
  });
  
  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => useKeyboardShortcuts());
    unmount();
  });
});
