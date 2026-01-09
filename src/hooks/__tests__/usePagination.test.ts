import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { usePagination } from '../usePagination';

describe('usePagination', () => {
  it('should initialize with page 1', () => {
    const { result } = renderHook(() => usePagination({ totalItems: 100, pageSize: 10 }));
    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(10);
  });
  it('should go to next page', () => {
    const { result } = renderHook(() => usePagination({ totalItems: 100, pageSize: 10 }));
    act(() => { result.current.nextPage(); });
    expect(result.current.currentPage).toBe(2);
  });
  it('should go to previous page', () => {
    const { result } = renderHook(() => usePagination({ totalItems: 100, pageSize: 10 }));
    act(() => { result.current.goToPage(3); });
    act(() => { result.current.prevPage(); });
    expect(result.current.currentPage).toBe(2);
  });
});