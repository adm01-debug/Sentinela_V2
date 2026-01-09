import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useTransform } from '../useTransform';

describe('useTransform', () => {
  it('should transform data', () => {
    const { result } = renderHook(() => useTransform([1, 2, 3], x => x * 2));
    expect(result.current).toEqual([2, 4, 6]);
  });
});