import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useUndo } from '../useUndo';

describe('useUndo', () => {
  it('should track state history', () => {
    const { result } = renderHook(() => useUndo('a'));
    expect(result.current.state).toBe('a');
    act(() => { result.current.set('b'); });
    expect(result.current.state).toBe('b');
    act(() => { result.current.undo(); });
    expect(result.current.state).toBe('a');
  });
});