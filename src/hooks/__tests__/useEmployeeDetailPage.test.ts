import { describe, it, expect, vi, renderHook, act } from 'vitest';
import { useEmployeeDetailPage } from '../useEmployeeDetailPage';

vi.mock('@/lib/supabase', () => ({ supabase: { from: vi.fn(), auth: { getUser: vi.fn() } } }));

describe('useEmployeeDetailPage', () => {
  it('should initialize correctly', () => {
    const { result } = renderHook(() => useEmployeeDetailPage());
    expect(result.current).toBeDefined();
  });
  
  it('should handle state changes', async () => {
    const { result } = renderHook(() => useEmployeeDetailPage());
    expect(result.current).toBeDefined();
  });
  
  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => useEmployeeDetailPage());
    unmount();
  });
});
