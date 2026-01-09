import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useEffectOnce } from '../useEffectOnce';

describe('useEffectOnce', () => {
  it('should run effect only once', () => {
    const cb = vi.fn();
    const { rerender } = renderHook(() => useEffectOnce(cb));
    expect(cb).toHaveBeenCalledTimes(1);
    rerender();
    expect(cb).toHaveBeenCalledTimes(1);
  });
});