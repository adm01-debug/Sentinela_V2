import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useUndoRedo } from '../useUndoRedo';

describe('useUndoRedo', () => {
  it('should track state history', () => {
    const { result } = renderHook(() => useUndoRedo({ count: 0 }));
    act(() => { result.current.set({ count: 1 }); });
    expect(result.current.state.count).toBe(1);
  });

  it('should undo', () => {
    const { result } = renderHook(() => useUndoRedo({ count: 0 }));
    act(() => { result.current.set({ count: 1 }); result.current.undo(); });
    expect(result.current.state.count).toBe(0);
  });
});