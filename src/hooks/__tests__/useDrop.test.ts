import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useDrop } from '../useDrop';

describe('useDrop', () => {
  it('should return drop state', () => {
    const { result } = renderHook(() => useDrop());
    expect(result.current.isOver).toBe(false);
    expect(result.current.canDrop).toBeDefined();
  });
});