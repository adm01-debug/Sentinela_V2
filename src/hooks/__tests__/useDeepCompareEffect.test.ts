import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useDeepCompareEffect } from '../useDeepCompareEffect';

describe('useDeepCompareEffect', () => {
  it('should not trigger on shallow equal deps', () => {
    const cb = vi.fn();
    const { rerender } = renderHook(({ d }) => useDeepCompareEffect(cb, [d]), { initialProps: { d: { a: 1 } } });
    rerender({ d: { a: 1 } });
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('should trigger on deep change', () => {
    const cb = vi.fn();
    const { rerender } = renderHook(({ d }) => useDeepCompareEffect(cb, [d]), { initialProps: { d: { a: 1 } } });
    rerender({ d: { a: 2 } });
    expect(cb).toHaveBeenCalledTimes(2);
  });
});