import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useReducerWithMiddleware } from '../useReducerWithMiddleware';

describe('useReducerWithMiddleware', () => {
  const reducer = (s: number, a: { type: string }) => a.type === 'INC' ? s + 1 : s;
  
  it('should work like useReducer', () => {
    const { result } = renderHook(() => useReducerWithMiddleware(reducer, 0, []));
    expect(result.current[0]).toBe(0);
    act(() => { result.current[1]({ type: 'INC' }); });
    expect(result.current[0]).toBe(1);
  });

  it('should call middleware', () => {
    const mw = vi.fn();
    const { result } = renderHook(() => useReducerWithMiddleware(reducer, 0, [mw]));
    act(() => { result.current[1]({ type: 'INC' }); });
    expect(mw).toHaveBeenCalled();
  });
});