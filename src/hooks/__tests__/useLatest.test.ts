import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useLatest } from '../useLatest';

describe('useLatest', () => {
  it('should always return latest value', () => {
    const { result, rerender } = renderHook(({ val }) => useLatest(val), { initialProps: { val: 1 } });
    rerender({ val: 2 });
    expect(result.current.current).toBe(2);
  });
});