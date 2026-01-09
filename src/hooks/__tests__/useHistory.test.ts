import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useHistory } from '../useHistory';

describe('useHistory', () => {
  it('should track history', () => {
    const { result } = renderHook(() => useHistory('initial'));
    act(() => { result.current.set('second'); });
    expect(result.current.history).toEqual(['initial', 'second']);
  });

  it('should undo', () => {
    const { result } = renderHook(() => useHistory('initial'));
    act(() => { result.current.set('second'); result.current.undo(); });
    expect(result.current.current).toBe('initial');
  });

  it('should redo', () => {
    const { result } = renderHook(() => useHistory('initial'));
    act(() => { result.current.set('second'); result.current.undo(); result.current.redo(); });
    expect(result.current.current).toBe('second');
  });
});