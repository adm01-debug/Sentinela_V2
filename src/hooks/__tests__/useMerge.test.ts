import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useMerge } from '../useMerge';

describe('useMerge', () => {
  it('should merge objects', () => {
    const { result } = renderHook(() => useMerge({ a: 1 }, { b: 2 }));
    expect(result.current).toEqual({ a: 1, b: 2 });
  });
});