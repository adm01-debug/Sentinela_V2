import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useLatest } from '../useLatest';

describe('useLatest', () => {
  it('should return ref with latest value', () => {
    const { result, rerender } = renderHook(({ v }) => useLatest(v), { initialProps: { v: 1 } });
    expect(result.current.current).toBe(1);
    rerender({ v: 2 });
    expect(result.current.current).toBe(2);
  });
});