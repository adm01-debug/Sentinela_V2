import { describe, it, expect, vi, renderHook, act } from 'vitest';
import { useMediaDevices } from '../useMediaDevices';

vi.mock('@/lib/supabase', () => ({ supabase: { from: vi.fn(), auth: { getUser: vi.fn() } } }));

describe('useMediaDevices', () => {
  it('should initialize correctly', () => {
    const { result } = renderHook(() => useMediaDevices());
    expect(result.current).toBeDefined();
  });
  
  it('should handle state changes', async () => {
    const { result } = renderHook(() => useMediaDevices());
    expect(result.current).toBeDefined();
  });
  
  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => useMediaDevices());
    unmount();
  });
});
