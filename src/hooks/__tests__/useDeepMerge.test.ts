import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useDeepMerge } from '../useDeepMerge';

describe('useDeepMerge', () => {
  it('should deep merge objects', () => {
    const { result } = renderHook(() => useDeepMerge({ a: { b: 1 } }, { a: { c: 2 } }));
    expect(result.current).toEqual({ a: { b: 1, c: 2 } });
  });
});