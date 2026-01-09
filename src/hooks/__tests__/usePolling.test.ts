import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { usePolling } from '../usePolling';

describe('usePolling', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('should poll at interval', () => {
    const fn = vi.fn().mockResolvedValue({});
    renderHook(() => usePolling(fn, 1000));
    act(() => { vi.advanceTimersByTime(3000); });
    expect(fn).toHaveBeenCalledTimes(3);
  });
});