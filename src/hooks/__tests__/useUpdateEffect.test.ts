import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useUpdateEffect } from '../useUpdateEffect';

describe('useUpdateEffect', () => {
  it('should not call on mount', () => {
    const cb = vi.fn();
    renderHook(() => useUpdateEffect(cb, []));
    expect(cb).not.toHaveBeenCalled();
  });

  it('should call on update', () => {
    const cb = vi.fn();
    const { rerender } = renderHook(({ d }) => useUpdateEffect(cb, [d]), { initialProps: { d: 1 } });
    expect(cb).not.toHaveBeenCalled();
    rerender({ d: 2 });
    expect(cb).toHaveBeenCalledTimes(1);
  });
});