import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useTick } from '../useTick';

describe('useTick', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('should tick at interval', () => {
    const callback = vi.fn();
    renderHook(() => useTick(callback, 100));
    act(() => { vi.advanceTimersByTime(500); });
    expect(callback).toHaveBeenCalledTimes(5);
  });
});