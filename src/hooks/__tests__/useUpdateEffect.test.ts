import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useUpdateEffect } from '../useUpdateEffect';

describe('useUpdateEffect', () => {
  it('should not run on initial render', () => {
    const effect = vi.fn();
    renderHook(() => useUpdateEffect(effect, []));
    expect(effect).not.toHaveBeenCalled();
  });

  it('should run on updates', () => {
    const effect = vi.fn();
    const { rerender } = renderHook(({ dep }) => useUpdateEffect(effect, [dep]), { initialProps: { dep: 1 } });
    expect(effect).not.toHaveBeenCalled();
    rerender({ dep: 2 });
    expect(effect).toHaveBeenCalled();
  });
});