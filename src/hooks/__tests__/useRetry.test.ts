import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useRetry } from '../useRetry';

describe('useRetry', () => {
  it('should retry on failure', async () => {
    const fn = vi.fn().mockRejectedValueOnce(new Error()).mockResolvedValue('success');
    const { result } = renderHook(() => useRetry(fn, { maxRetries: 3 }));
    await act(async () => { await result.current.execute(); });
    expect(fn).toHaveBeenCalledTimes(2);
  });
});