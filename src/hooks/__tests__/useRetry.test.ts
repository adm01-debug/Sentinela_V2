import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useRetry } from '../useRetry';

describe('useRetry', () => {
  it('should retry on failure', async () => {
    const fn = vi.fn().mockRejectedValueOnce(new Error()).mockResolvedValue('success');
    const { result } = renderHook(() => useRetry(fn, { maxRetries: 3 }));
    await act(async () => { await result.current.execute(); });
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should give up after max retries', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'));
    const { result } = renderHook(() => useRetry(fn, { maxRetries: 2 }));
    await act(async () => { try { await result.current.execute(); } catch {} });
    expect(fn).toHaveBeenCalledTimes(3);
  });
});