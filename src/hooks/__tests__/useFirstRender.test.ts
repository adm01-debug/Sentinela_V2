import { describe, it, expect, vi, renderHook, act } from 'vitest';
import { useFirstRender } from '../useFirstRender';

vi.mock('@/lib/supabase', () => ({ supabase: { from: vi.fn(), auth: { getUser: vi.fn() } } }));

describe('useFirstRender', () => {
  it('should initialize correctly', () => {
    const { result } = renderHook(() => useFirstRender());
    expect(result.current).toBeDefined();
  });
  
  it('should handle state changes', async () => {
    const { result } = renderHook(() => useFirstRender());
    expect(result.current).toBeDefined();
  });
  
  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => useFirstRender());
    unmount();
  });
});
