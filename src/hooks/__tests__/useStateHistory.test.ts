import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useStateHistory } from '../useStateHistory';

describe('useStateHistory', () => {
  it('should track state history', () => {
    const { result } = renderHook(() => useStateHistory(0));
    act(() => { result.current.set(1); });
    act(() => { result.current.set(2); });
    expect(result.current.history).toEqual([0, 1, 2]);
  });

  it('should undo state', () => {
    const { result } = renderHook(() => useStateHistory(0));
    act(() => { result.current.set(1); result.current.set(2); });
    act(() => { result.current.undo(); });
    expect(result.current.state).toBe(1);
  });

  it('should redo state', () => {
    const { result } = renderHook(() => useStateHistory(0));
    act(() => { result.current.set(1); result.current.undo(); result.current.redo(); });
    expect(result.current.state).toBe(1);
  });
});