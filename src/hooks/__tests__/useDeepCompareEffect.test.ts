import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useDeepCompareEffect } from '../useDeepCompareEffect';

describe('useDeepCompareEffect', () => {
  it('should not re-run for equal objects', () => {
    const effect = vi.fn();
    const { rerender } = renderHook(({ obj }) => useDeepCompareEffect(effect, [obj]), { initialProps: { obj: { a: 1 } } });
    expect(effect).toHaveBeenCalledTimes(1);
    rerender({ obj: { a: 1 } });
    expect(effect).toHaveBeenCalledTimes(1);
  });

  it('should re-run for different objects', () => {
    const effect = vi.fn();
    const { rerender } = renderHook(({ obj }) => useDeepCompareEffect(effect, [obj]), { initialProps: { obj: { a: 1 } } });
    rerender({ obj: { a: 2 } });
    expect(effect).toHaveBeenCalledTimes(2);
  });
});