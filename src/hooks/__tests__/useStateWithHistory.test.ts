import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useStateWithHistory } from '../useStateWithHistory';

describe('useStateWithHistory', () => {
  it('should maintain history', () => {
    const { result } = renderHook(() => useStateWithHistory(0));
    act(() => { result.current.setValue(1); result.current.setValue(2); });
    expect(result.current.history).toEqual([0, 1, 2]);
  });

  it('should go back', () => {
    const { result } = renderHook(() => useStateWithHistory(0));
    act(() => { result.current.setValue(1); result.current.back(); });
    expect(result.current.value).toBe(0);
  });
});