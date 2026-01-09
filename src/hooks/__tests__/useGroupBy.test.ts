import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useGroupBy } from '../useGroupBy';
describe('useGroupBy', () => {
  it('should group items', () => {
    const items = [{ cat: 'a', v: 1 }, { cat: 'b', v: 2 }, { cat: 'a', v: 3 }];
    const { result } = renderHook(() => useGroupBy(items, 'cat'));
    expect(result.current.a.length).toBe(2);
  });
});