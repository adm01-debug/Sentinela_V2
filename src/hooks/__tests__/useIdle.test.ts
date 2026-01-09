import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useIdle } from '../useIdle';

describe('useIdle', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('should start as not idle', () => {
    const { result } = renderHook(() => useIdle(5000));
    expect(result.current).toBe(false);
  });

  it('should become idle after timeout', () => {
    const { result } = renderHook(() => useIdle(5000));
    act(() => { vi.advanceTimersByTime(5000); });
    expect(result.current).toBe(true);
  });

  it('should reset on user activity', () => {
    const { result } = renderHook(() => useIdle(5000));
    act(() => { vi.advanceTimersByTime(3000); });
    act(() => { document.dispatchEvent(new MouseEvent('mousemove')); });
    act(() => { vi.advanceTimersByTime(3000); });
    expect(result.current).toBe(false);
  });
});