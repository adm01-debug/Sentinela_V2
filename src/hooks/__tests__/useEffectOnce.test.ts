import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useEffectOnce } from '../useEffectOnce';

describe('useEffectOnce', () => {
  it('should run effect once', () => {
    const effect = vi.fn();
    const { rerender } = renderHook(() => useEffectOnce(effect));
    rerender();
    rerender();
    expect(effect).toHaveBeenCalledTimes(1);
  });
});