import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSelection } from '../useSelection';

describe('useSelection', () => {
  it('should track selected items', () => {
    const { result } = renderHook(() => useSelection<string>());
    act(() => { result.current.select('a'); });
    expect(result.current.isSelected('a')).toBe(true);
    act(() => { result.current.deselect('a'); });
    expect(result.current.isSelected('a')).toBe(false);
  });
});