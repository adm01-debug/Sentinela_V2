import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useGetSetState } from '../useGetSetState';

describe('useGetSetState', () => {
  it('should merge state', () => {
    const { result } = renderHook(() => useGetSetState({ a: 1, b: 2 }));
    act(() => { result.current[1]({ b: 3 }); });
    expect(result.current[0]()).toEqual({ a: 1, b: 3 });
  });
});