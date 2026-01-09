import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useOptimistic } from '../useOptimistic';

describe('useOptimistic', () => {
  it('should apply optimistic update', () => {
    const { result } = renderHook(() => useOptimistic([1, 2, 3]));
    act(() => { result.current.addOptimistic(4); });
    expect(result.current.optimisticValue).toContain(4);
  });

  it('should rollback on error', async () => {
    const { result } = renderHook(() => useOptimistic([1]));
    act(() => { result.current.addOptimistic(2); });
    act(() => { result.current.rollback(); });
    expect(result.current.optimisticValue).toEqual([1]);
  });
});