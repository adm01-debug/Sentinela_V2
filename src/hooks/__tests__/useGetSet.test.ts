import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useGetSet } from '../useGetSet';

describe('useGetSet', () => {
  it('should get and set value', () => {
    const { result } = renderHook(() => useGetSet(0));
    expect(result.current[0]()).toBe(0);
    act(() => { result.current[1](5); });
    expect(result.current[0]()).toBe(5);
  });
});