import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useScrollPosition } from '../useScrollPosition';

describe('useScrollPosition', () => {
  it('should return scroll position', () => {
    const { result } = renderHook(() => useScrollPosition());
    expect(result.current.x).toBe(0);
    expect(result.current.y).toBe(0);
  });
});