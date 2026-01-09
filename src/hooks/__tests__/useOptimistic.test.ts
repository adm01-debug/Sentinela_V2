import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useOptimistic } from '../useOptimistic';

describe('useOptimistic', () => {
  it('should apply optimistic update', () => {
    const { result } = renderHook(() => useOptimistic([1, 2, 3]));
    act(() => { result.current.addOptimistic(4); });
    expect(result.current.optimisticState).toContain(4);
  });
});