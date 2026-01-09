import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useVibrate } from '../useVibrate';

describe('useVibrate', () => {
  it('should vibrate', () => {
    navigator.vibrate = vi.fn();
    const { result } = renderHook(() => useVibrate());
    act(() => { result.current.vibrate(100); });
    expect(navigator.vibrate).toHaveBeenCalledWith(100);
  });
});