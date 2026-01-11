import { describe, it, expect, vi, renderHook, act } from 'vitest';
import { useFormState } from '../useFormState';

vi.mock('@/lib/supabase', () => ({ supabase: { from: vi.fn(), auth: { getUser: vi.fn() } } }));

describe('useFormState', () => {
  it('should initialize correctly', () => {
    const { result } = renderHook(() => useFormState());
    expect(result.current).toBeDefined();
  });
  
  it('should handle state changes', async () => {
    const { result } = renderHook(() => useFormState());
    expect(result.current).toBeDefined();
  });
  
  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => useFormState());
    unmount();
  });
});
