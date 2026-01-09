import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { usePan } from '../usePan';

describe('usePan', () => {
  it('should return pan state', () => {
    const { result } = renderHook(() => usePan());
    expect(result.current.position).toEqual({ x: 0, y: 0 });
    expect(result.current.isPanning).toBe(false);
  });
});