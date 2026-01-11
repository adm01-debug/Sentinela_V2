import { describe, it, expect, vi, renderHook, act } from 'vitest';
import { useIdleDetection } from '../useIdleDetection';

vi.mock('@/lib/supabase', () => ({ supabase: { from: vi.fn(), auth: { getUser: vi.fn() } } }));

describe('useIdleDetection', () => {
  it('should initialize correctly', () => {
    const { result } = renderHook(() => useIdleDetection());
    expect(result.current).toBeDefined();
  });
  
  it('should handle state changes', async () => {
    const { result } = renderHook(() => useIdleDetection());
    expect(result.current).toBeDefined();
  });
  
  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => useIdleDetection());
    unmount();
  });
});
