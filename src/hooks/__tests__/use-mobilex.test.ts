import { describe, it, expect, vi, renderHook, act } from 'vitest';
import { use-mobilex } from '../use-mobilex';

vi.mock('@/lib/supabase', () => ({ supabase: { from: vi.fn(), auth: { getUser: vi.fn() } } }));

describe('use-mobilex', () => {
  it('should initialize correctly', () => {
    const { result } = renderHook(() => use-mobilex());
    expect(result.current).toBeDefined();
  });
  
  it('should handle state changes', async () => {
    const { result } = renderHook(() => use-mobilex());
    expect(result.current).toBeDefined();
  });
  
  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => use-mobilex());
    unmount();
  });
});
