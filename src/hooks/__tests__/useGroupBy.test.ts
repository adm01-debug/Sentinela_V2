import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useGroupBy } from '../useGroupBy';

describe('useGroupBy', () => {
  it('should group data', () => {
    const data = [{ cat: 'A', v: 1 }, { cat: 'B', v: 2 }, { cat: 'A', v: 3 }];
    const { result } = renderHook(() => useGroupBy(data, 'cat'));
    expect(result.current.A.length).toBe(2);
    expect(result.current.B.length).toBe(1);
  });
});