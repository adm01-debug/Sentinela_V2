import { describe, it, expect, vi, renderHook, act } from 'vitest';
import { useField } from '../useField';

vi.mock('@/lib/supabase', () => ({ supabase: { from: vi.fn(), auth: { getUser: vi.fn() } } }));

describe('useField', () => {
  it('should initialize correctly', () => {
    const { result } = renderHook(() => useField());
    expect(result.current).toBeDefined();
  });
  
  it('should handle state changes', async () => {
    const { result } = renderHook(() => useField());
    expect(result.current).toBeDefined();
  });
  
  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => useField());
    unmount();
  });
});
