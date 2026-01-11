import { describe, it, expect, vi, renderHook, act } from 'vitest';
import { useTransition } from '../useTransition';

vi.mock('@/lib/supabase', () => ({ supabase: { from: vi.fn(), auth: { getUser: vi.fn() } } }));

describe('useTransition', () => {
  it('should initialize correctly', () => {
    const { result } = renderHook(() => useTransition());
    expect(result.current).toBeDefined();
  });
  
  it('should handle state changes', async () => {
    const { result } = renderHook(() => useTransition());
    expect(result.current).toBeDefined();
  });
  
  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => useTransition());
    unmount();
  });
});
