import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSelection } from '../useSelection';

describe('useSelection', () => {
  it('should select item', () => {
    const { result } = renderHook(() => useSelection());
    act(() => { result.current.select('item1'); });
    expect(result.current.isSelected('item1')).toBe(true);
  });

  it('should deselect item', () => {
    const { result } = renderHook(() => useSelection());
    act(() => { result.current.select('item1'); result.current.deselect('item1'); });
    expect(result.current.isSelected('item1')).toBe(false);
  });

  it('should toggle selection', () => {
    const { result } = renderHook(() => useSelection());
    act(() => { result.current.toggle('item1'); });
    expect(result.current.isSelected('item1')).toBe(true);
    act(() => { result.current.toggle('item1'); });
    expect(result.current.isSelected('item1')).toBe(false);
  });

  it('should clear selection', () => {
    const { result } = renderHook(() => useSelection());
    act(() => { result.current.select('item1'); result.current.select('item2'); result.current.clear(); });
    expect(result.current.selected.size).toBe(0);
  });
});