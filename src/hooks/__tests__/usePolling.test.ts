import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { usePolling } from '../usePolling';

describe('usePolling', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('should poll at interval', async () => {
    const fetcher = vi.fn().mockResolvedValue({ data: 'test' });
    renderHook(() => usePolling(fetcher, 1000));
    await act(async () => { vi.advanceTimersByTime(3000); });
    expect(fetcher).toHaveBeenCalledTimes(4);
  });

  it('should stop polling', async () => {
    const fetcher = vi.fn().mockResolvedValue({});
    const { result } = renderHook(() => usePolling(fetcher, 1000));
    act(() => { result.current.stop(); });
    await act(async () => { vi.advanceTimersByTime(3000); });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});