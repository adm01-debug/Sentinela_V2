import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useIsomorphicLayoutEffect } from '../useIsomorphicLayoutEffect';

describe('useIsomorphicLayoutEffect', () => {
  it('should work like useEffect', () => {
    const effect = vi.fn();
    renderHook(() => useIsomorphicLayoutEffect(effect, []));
    expect(effect).toHaveBeenCalled();
  });
});