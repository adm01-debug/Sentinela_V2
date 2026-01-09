import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useFilter } from '../useFilter';

describe('useFilter', () => {
  const items = [{ name: 'Apple' }, { name: 'Banana' }, { name: 'Cherry' }];

  it('should filter items', () => {
    const { result } = renderHook(() => useFilter(items, 'name'));
    act(() => { result.current.setQuery('Ban'); });
    expect(result.current.filtered).toEqual([{ name: 'Banana' }]);
  });

  it('should return all items when no query', () => {
    const { result } = renderHook(() => useFilter(items, 'name'));
    expect(result.current.filtered).toEqual(items);
  });
});