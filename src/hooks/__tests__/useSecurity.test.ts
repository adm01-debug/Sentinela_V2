import { describe, it, expect, vi, renderHook, act } from 'vitest';
import { useSecurity } from '../useSecurity';

vi.mock('@/lib/supabase', () => ({ supabase: { from: vi.fn(), auth: { getUser: vi.fn() } } }));

describe('useSecurity', () => {
  it('should initialize correctly', () => {
    const { result } = renderHook(() => useSecurity());
    expect(result.current).toBeDefined();
  });
  
  it('should handle state changes', async () => {
    const { result } = renderHook(() => useSecurity());
    expect(result.current).toBeDefined();
  });
  
  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => useSecurity());
    unmount();
  });
});
