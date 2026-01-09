import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useStopwatch } from '../useStopwatch';

describe('useStopwatch', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('should track time', () => {
    const { result } = renderHook(() => useStopwatch());
    act(() => { result.current.start(); vi.advanceTimersByTime(1000); });
    expect(result.current.time).toBe(1000);
  });

  it('should lap', () => {
    const { result } = renderHook(() => useStopwatch());
    act(() => { result.current.start(); vi.advanceTimersByTime(1000); result.current.lap(); });
    expect(result.current.laps.length).toBe(1);
  });
});