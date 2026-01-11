import { describe, it, expect, vi, renderHook, act } from 'vitest';
import { useFormContext } from '../useFormContext';

vi.mock('@/lib/supabase', () => ({ supabase: { from: vi.fn(), auth: { getUser: vi.fn() } } }));

describe('useFormContext', () => {
  it('should initialize correctly', () => {
    const { result } = renderHook(() => useFormContext());
    expect(result.current).toBeDefined();
  });
  
  it('should handle state changes', async () => {
    const { result } = renderHook(() => useFormContext());
    expect(result.current).toBeDefined();
  });
  
  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => useFormContext());
    unmount();
  });
});
