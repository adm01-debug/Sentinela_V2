import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSelection } from '../useSelection';

describe('useSelection', () => {
  it('should select items', () => {
    const { result } = renderHook(() => useSelection());
    act(() => { result.current.select('a'); });
    expect(result.current.isSelected('a')).toBe(true);
  });

  it('should deselect items', () => {
    const { result } = renderHook(() => useSelection(['a']));
    act(() => { result.current.deselect('a'); });
    expect(result.current.isSelected('a')).toBe(false);
  });

  it('should toggle selection', () => {
    const { result } = renderHook(() => useSelection());
    act(() => { result.current.toggle('a'); });
    expect(result.current.isSelected('a')).toBe(true);
    act(() => { result.current.toggle('a'); });
    expect(result.current.isSelected('a')).toBe(false);
  });
});