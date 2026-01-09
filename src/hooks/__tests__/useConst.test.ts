import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useConst } from '../useConst';

describe('useConst', () => {
  it('should memoize value', () => {
    const fn = vi.fn(() => Math.random());
    const { result, rerender } = renderHook(() => useConst(fn));
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });
});