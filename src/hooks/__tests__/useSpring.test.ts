import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSpring } from '../useSpring';

describe('useSpring', () => {
  it('should return spring value', () => {
    const { result } = renderHook(() => useSpring(0));
    expect(result.current.value).toBe(0);
  });

  it('should animate to target', () => {
    const { result } = renderHook(() => useSpring(0));
    act(() => { result.current.set(100); });
  });
});