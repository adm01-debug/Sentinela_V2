import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useIsFirstRender } from '../useIsFirstRender';

describe('useIsFirstRender', () => {
  it('should return true on first render', () => {
    const { result } = renderHook(() => useIsFirstRender());
    expect(result.current).toBe(true);
  });

  it('should return false on subsequent renders', () => {
    const { result, rerender } = renderHook(() => useIsFirstRender());
    rerender();
    expect(result.current).toBe(false);
  });
});