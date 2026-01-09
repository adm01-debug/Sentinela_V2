import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useThrottle } from '../useThrottle';

describe('useThrottle', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());
  
  it('should throttle value updates', () => {
    const { result, rerender } = renderHook(({ value }) => useThrottle(value, 500), { initialProps: { value: 'a' } });
    expect(result.current).toBe('a');
    rerender({ value: 'b' });
    expect(result.current).toBe('a');
    act(() => { vi.advanceTimersByTime(500); });
    expect(result.current).toBe('b');
  });
});