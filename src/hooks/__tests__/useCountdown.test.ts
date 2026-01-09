import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useCountdown } from '../useCountdown';

describe('useCountdown', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('should countdown', () => {
    const { result } = renderHook(() => useCountdown(10));
    act(() => { result.current.start(); vi.advanceTimersByTime(1000); });
    expect(result.current.seconds).toBe(9);
  });

  it('should stop at zero', () => {
    const { result } = renderHook(() => useCountdown(1));
    act(() => { result.current.start(); vi.advanceTimersByTime(2000); });
    expect(result.current.seconds).toBe(0);
  });
});