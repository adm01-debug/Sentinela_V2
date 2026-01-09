import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useInterval } from '../useInterval';

describe('useInterval', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('should call callback at interval', () => {
    const callback = vi.fn();
    renderHook(() => useInterval(callback, 1000));
    expect(callback).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(1000); });
    expect(callback).toHaveBeenCalledTimes(1);
    act(() => { vi.advanceTimersByTime(1000); });
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('should not call when delay is null', () => {
    const callback = vi.fn();
    renderHook(() => useInterval(callback, null));
    act(() => { vi.advanceTimersByTime(5000); });
    expect(callback).not.toHaveBeenCalled();
  });
});