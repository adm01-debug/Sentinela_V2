import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useAdvancedFilters, OPERATOR_LABELS } from '../useAdvancedFilters';

describe('useAdvancedFilters', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should initialize with empty filters', () => {
    const { result } = renderHook(() => useAdvancedFilters());
    expect(result.current.filters).toEqual([]);
  });

  it('should add a filter', () => {
    const { result } = renderHook(() => useAdvancedFilters());
    act(() => { result.current.addFilter({ field: 'name', operator: 'contains', value: 'test' }); });
    expect(result.current.filters).toHaveLength(1);
    expect(result.current.filters[0].field).toBe('name');
  });

  it('should remove a filter', () => {
    const { result } = renderHook(() => useAdvancedFilters());
    act(() => { result.current.addFilter({ field: 'name', operator: 'eq', value: 'test' }); });
    const filterId = result.current.filters[0].id;
    act(() => { result.current.removeFilter(filterId); });
    expect(result.current.filters).toHaveLength(0);
  });

  it('should update a filter', () => {
    const { result } = renderHook(() => useAdvancedFilters());
    act(() => { result.current.addFilter({ field: 'name', operator: 'eq', value: 'old' }); });
    const filterId = result.current.filters[0].id;
    act(() => { result.current.updateFilter(filterId, { value: 'new' }); });
    expect(result.current.filters[0].value).toBe('new');
  });

  it('should clear all filters', () => {
    const { result } = renderHook(() => useAdvancedFilters());
    act(() => { 
      result.current.addFilter({ field: 'name', operator: 'eq', value: 'test1' });
      result.current.addFilter({ field: 'email', operator: 'contains', value: 'test2' });
    });
    act(() => { result.current.clearFilters(); });
    expect(result.current.filters).toHaveLength(0);
  });

  it('should build query correctly', () => {
    const { result } = renderHook(() => useAdvancedFilters());
    act(() => { result.current.addFilter({ field: 'status', operator: 'eq', value: 'active' }); });
    const query = result.current.buildQuery();
    expect(query).toBeDefined();
  });

  it('should export OPERATOR_LABELS', () => {
    expect(OPERATOR_LABELS).toBeDefined();
    expect(OPERATOR_LABELS.eq).toBeDefined();
    expect(OPERATOR_LABELS.contains).toBeDefined();
  });
});
