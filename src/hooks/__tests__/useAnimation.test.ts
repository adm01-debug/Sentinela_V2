import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAnimation } from '../useAnimation';

describe('useAnimation', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('should animate value', () => {
    const { result } = renderHook(() => useAnimation(0, 100, 1000));
    expect(result.current).toBe(0);
    act(() => { vi.advanceTimersByTime(500); });
  });
});