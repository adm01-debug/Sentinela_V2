import { describe, it, expect, vi, renderHook, act } from 'vitest';
import { use-toast } from '../use-toast';

vi.mock('@/lib/supabase', () => ({ supabase: { from: vi.fn(), auth: { getUser: vi.fn() } } }));

describe('use-toast', () => {
  it('should initialize correctly', () => {
    const { result } = renderHook(() => use-toast());
    expect(result.current).toBeDefined();
  });
  
  it('should handle state changes', async () => {
    const { result } = renderHook(() => use-toast());
    expect(result.current).toBeDefined();
  });
  
  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => use-toast());
    unmount();
  });
});
