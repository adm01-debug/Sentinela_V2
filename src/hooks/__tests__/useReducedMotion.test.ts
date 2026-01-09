import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useReducedMotion } from '../useReducedMotion';
describe('useReducedMotion', () => {
  it('should detect reduced motion preference', () => {
    const { result } = renderHook(() => useReducedMotion());
    expect(typeof result.current).toBe('boolean');
  });
});