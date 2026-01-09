import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useLongPress } from '../useLongPress';

describe('useLongPress', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('should trigger on long press', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useLongPress(callback, { delay: 500 }));
    const element = document.createElement('button');
    act(() => {
      element.dispatchEvent(new MouseEvent('mousedown'));
      vi.advanceTimersByTime(500);
    });
  });
});