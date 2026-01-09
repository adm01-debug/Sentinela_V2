import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useClock } from '../useClock';

describe('useClock', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('should return current time', () => {
    const { result } = renderHook(() => useClock());
    expect(result.current.time).toBeInstanceOf(Date);
  });

  it('should update every second', () => {
    const { result } = renderHook(() => useClock());
    const initial = result.current.time.getSeconds();
    act(() => { vi.advanceTimersByTime(1000); });
  });
});