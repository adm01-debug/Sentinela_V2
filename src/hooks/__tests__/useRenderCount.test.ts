import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useRenderCount } from '../useRenderCount';

describe('useRenderCount', () => {
  it('should count renders', () => {
    const { result, rerender } = renderHook(() => useRenderCount());
    expect(result.current).toBe(1);
    rerender();
    expect(result.current).toBe(2);
  });
});