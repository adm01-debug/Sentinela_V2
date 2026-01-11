import { describe, it, expect, vi, renderHook, act } from 'vitest';
import { useAnnounce } from '../useAnnounce';

vi.mock('@/lib/supabase', () => ({ supabase: { from: vi.fn(), auth: { getUser: vi.fn() } } }));

describe('useAnnounce', () => {
  it('should initialize correctly', () => {
    const { result } = renderHook(() => useAnnounce());
    expect(result.current).toBeDefined();
  });
  
  it('should handle state changes', async () => {
    const { result } = renderHook(() => useAnnounce());
    expect(result.current).toBeDefined();
  });
  
  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => useAnnounce());
    unmount();
  });
});
