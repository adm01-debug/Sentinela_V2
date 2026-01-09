import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useMultiSelect } from '../useMultiSelect';

describe('useMultiSelect', () => {
  it('should select multiple items', () => {
    const { result } = renderHook(() => useMultiSelect());
    act(() => { result.current.select(['a', 'b', 'c']); });
    expect(result.current.selected).toEqual(['a', 'b', 'c']);
  });

  it('should deselect items', () => {
    const { result } = renderHook(() => useMultiSelect(['a', 'b']));
    act(() => { result.current.deselect(['a']); });
    expect(result.current.selected).toEqual(['b']);
  });
});