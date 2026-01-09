import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useClone } from '../useClone';

describe('useClone', () => {
  it('should clone object', () => {
    const obj = { a: { b: 1 } };
    const { result } = renderHook(() => useClone(obj));
    expect(result.current).toEqual(obj);
    expect(result.current).not.toBe(obj);
  });
});