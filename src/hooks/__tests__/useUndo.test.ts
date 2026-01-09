import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useUndo } from '../useUndo';

describe('useUndo', () => {
  it('should undo changes', () => {
    const { result } = renderHook(() => useUndo('initial'));
    act(() => { result.current.set('changed'); });
    act(() => { result.current.undo(); });
    expect(result.current.state).toBe('initial');
  });

  it('should redo changes', () => {
    const { result } = renderHook(() => useUndo('initial'));
    act(() => { result.current.set('changed'); result.current.undo(); result.current.redo(); });
    expect(result.current.state).toBe('changed');
  });

  it('should track canUndo/canRedo', () => {
    const { result } = renderHook(() => useUndo('initial'));
    expect(result.current.canUndo).toBe(false);
    act(() => { result.current.set('changed'); });
    expect(result.current.canUndo).toBe(true);
  });
});