import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useDrag } from '../useDrag';

describe('useDrag', () => {
  it('should return drag state', () => {
    const { result } = renderHook(() => useDrag());
    expect(result.current.isDragging).toBe(false);
    expect(result.current.position).toEqual({ x: 0, y: 0 });
  });
});