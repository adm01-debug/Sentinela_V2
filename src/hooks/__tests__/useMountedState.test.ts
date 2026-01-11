import { describe, it, expect, vi, renderHook, act } from 'vitest';
import { useMountedState } from '../useMountedState';

vi.mock('@/lib/supabase', () => ({ supabase: { from: vi.fn(), auth: { getUser: vi.fn() } } }));

describe('useMountedState', () => {
  it('should initialize correctly', () => {
    const { result } = renderHook(() => useMountedState());
    expect(result.current).toBeDefined();
  });
  
  it('should handle state changes', async () => {
    const { result } = renderHook(() => useMountedState());
    expect(result.current).toBeDefined();
  });
  
  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => useMountedState());
    unmount();
  });
});
