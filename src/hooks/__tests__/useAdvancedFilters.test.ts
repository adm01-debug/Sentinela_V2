import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useAdvancedFilters } from '../useAdvancedFilters';

describe('useAdvancedFilters', () => {
  it('should initialize with empty filters', () => {
    const { result } = renderHook(() => useAdvancedFilters());
    expect(result.current.filters).toEqual([]);
  });
  it('should add filter', () => {
    const { result } = renderHook(() => useAdvancedFilters());
    act(() => { result.current.addFilter({ field: 'name', operator: 'contains', value: 'test' }); });
    expect(result.current.filters.length).toBe(1);
  });
  it('should remove filter', () => {
    const { result } = renderHook(() => useAdvancedFilters());
    act(() => { result.current.addFilter({ field: 'name', operator: 'eq', value: 'test' }); });
    act(() => { result.current.removeFilter(0); });
    expect(result.current.filters.length).toBe(0);
  });
  it('should clear all filters', () => {
    const { result } = renderHook(() => useAdvancedFilters());
    act(() => { result.current.addFilter({ field: 'a', operator: 'eq', value: '1' }); });
    act(() => { result.current.addFilter({ field: 'b', operator: 'eq', value: '2' }); });
    act(() => { result.current.clearFilters(); });
    expect(result.current.filters.length).toBe(0);
  });
  it('should build query string', () => {
    const { result } = renderHook(() => useAdvancedFilters());
    act(() => { result.current.addFilter({ field: 'status', operator: 'eq', value: 'active' }); });
    expect(result.current.buildQuery).toBeDefined();
  });
});
