import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useIsomorphicLayoutEffect } from '../useIsomorphicLayoutEffect';

describe('useIsomorphicLayoutEffect', () => {
  it('works', () => {
    const { result } = renderHook(() => useIsomorphicLayoutEffect());
    expect(result.current).toBeDefined();
  });
});