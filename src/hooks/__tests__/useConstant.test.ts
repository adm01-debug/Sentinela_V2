import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useConstant } from '../useConstant';

describe('useConstant', () => {
  it('should return constant value', () => {
    const factory = vi.fn(() => ({ id: 1 }));
    const { result, rerender } = renderHook(() => useConstant(factory));
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
    expect(factory).toHaveBeenCalledTimes(1);
  });
});