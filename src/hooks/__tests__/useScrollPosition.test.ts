import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useScrollPosition } from '../useScrollPosition';

describe('useScrollPosition', () => {
  it('should return scroll position', () => {
    const { result } = renderHook(() => useScrollPosition());
    expect(result.current.x).toBeDefined();
    expect(result.current.y).toBeDefined();
  });
});