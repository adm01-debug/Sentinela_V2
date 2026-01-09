import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useHover } from '../useHover';

describe('useHover', () => {
  it('should track hover state', () => {
    const { result } = renderHook(() => useHover());
    expect(result.current[1]).toBe(false);
  });
});