import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCompare } from '../useCompare';

describe('useCompare', () => {
  it('should compare values', () => {
    const { result } = renderHook(() => useCompare({ a: 1 }, { a: 1 }));
    expect(result.current.isEqual).toBe(true);
  });
});