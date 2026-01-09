import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useTimer } from '../useTimer';

describe('useTimer', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('should count up', () => {
    const { result } = renderHook(() => useTimer());
    act(() => { result.current.start(); vi.advanceTimersByTime(5000); });
    expect(result.current.seconds).toBe(5);
  });

  it('should pause', () => {
    const { result } = renderHook(() => useTimer());
    act(() => { result.current.start(); vi.advanceTimersByTime(3000); result.current.pause(); });
    act(() => { vi.advanceTimersByTime(2000); });
    expect(result.current.seconds).toBe(3);
  });

  it('should reset', () => {
    const { result } = renderHook(() => useTimer());
    act(() => { result.current.start(); vi.advanceTimersByTime(5000); result.current.reset(); });
    expect(result.current.seconds).toBe(0);
  });
});