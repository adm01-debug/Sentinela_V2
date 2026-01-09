import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useVibrate } from '../useVibrate';

describe('useVibrate', () => {
  it('should vibrate device', () => {
    navigator.vibrate = vi.fn();
    const { result } = renderHook(() => useVibrate());
    act(() => { result.current.vibrate(200); });
    expect(navigator.vibrate).toHaveBeenCalledWith(200);
  });
});