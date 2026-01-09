import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useTimeout } from '../useTimeout';

describe('useTimeout', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('should call callback after delay', () => {
    const callback = vi.fn();
    renderHook(() => useTimeout(callback, 1000));
    expect(callback).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(1000); });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should not call callback again', () => {
    const callback = vi.fn();
    renderHook(() => useTimeout(callback, 1000));
    act(() => { vi.advanceTimersByTime(3000); });
    expect(callback).toHaveBeenCalledTimes(1);
  });
});