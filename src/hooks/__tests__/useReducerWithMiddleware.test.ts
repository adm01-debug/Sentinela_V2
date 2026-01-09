import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useReducerWithMiddleware } from '../useReducerWithMiddleware';

describe('useReducerWithMiddleware', () => {
  it('should apply middleware', () => {
    const middleware = vi.fn((state, action, next) => next(action));
    const reducer = (state: number, action: { type: string }) => state + 1;
    const { result } = renderHook(() => useReducerWithMiddleware(reducer, 0, [middleware]));
    act(() => { result.current[1]({ type: 'INC' }); });
    expect(middleware).toHaveBeenCalled();
  });
});