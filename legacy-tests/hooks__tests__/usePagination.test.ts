import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePagination } from '../usePagination';

describe('usePagination', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => usePagination({ totalItems: 100 }));

    expect(result.current.currentPage).toBe(1);
    expect(result.current.pageSize).toBe(10);
    expect(result.current.totalPages).toBe(10);
  });

  it('should accept custom initial values', () => {
    const { result } = renderHook(() =>
      usePagination({
        totalItems: 100,
        initialPage: 3,
        initialPageSize: 20,
      })
    );

    expect(result.current.currentPage).toBe(3);
    expect(result.current.pageSize).toBe(20);
    expect(result.current.totalPages).toBe(5);
  });

  it('should go to next page', () => {
    const { result } = renderHook(() => usePagination({ totalItems: 100 }));

    act(() => {
      result.current.nextPage();
    });

    expect(result.current.currentPage).toBe(2);
  });

  it('should go to previous page', () => {
    const { result } = renderHook(() =>
      usePagination({ totalItems: 100, initialPage: 3 })
    );

    act(() => {
      result.current.previousPage();
    });

    expect(result.current.currentPage).toBe(2);
  });

  it('should not go below page 1', () => {
    const { result } = renderHook(() => usePagination({ totalItems: 100 }));

    act(() => {
      result.current.previousPage();
    });

    expect(result.current.currentPage).toBe(1);
  });

  it('should not exceed total pages', () => {
    const { result } = renderHook(() =>
      usePagination({ totalItems: 100, initialPage: 10 })
    );

    act(() => {
      result.current.nextPage();
    });

    expect(result.current.currentPage).toBe(10);
  });

  it('should go to specific page', () => {
    const { result } = renderHook(() => usePagination({ totalItems: 100 }));

    act(() => {
      result.current.goToPage(5);
    });

    expect(result.current.currentPage).toBe(5);
  });

  it('should change page size', () => {
    const { result } = renderHook(() => usePagination({ totalItems: 100 }));

    act(() => {
      result.current.setPageSize(25);
    });

    expect(result.current.pageSize).toBe(25);
    expect(result.current.totalPages).toBe(4);
    expect(result.current.currentPage).toBe(1); // Should reset to page 1
  });

  it('should calculate correct offset', () => {
    const { result } = renderHook(() =>
      usePagination({ totalItems: 100, initialPage: 3, initialPageSize: 10 })
    );

    expect(result.current.offset).toBe(20);
  });

  it('should know if has next/previous', () => {
    const { result } = renderHook(() =>
      usePagination({ totalItems: 100, initialPage: 5 })
    );

    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.hasPreviousPage).toBe(true);
  });

  it('should handle first page correctly', () => {
    const { result } = renderHook(() => usePagination({ totalItems: 100 }));

    expect(result.current.hasPreviousPage).toBe(false);
    expect(result.current.hasNextPage).toBe(true);
  });

  it('should handle last page correctly', () => {
    const { result } = renderHook(() =>
      usePagination({ totalItems: 100, initialPage: 10 })
    );

    expect(result.current.hasPreviousPage).toBe(true);
    expect(result.current.hasNextPage).toBe(false);
  });

  it('should handle zero items', () => {
    const { result } = renderHook(() => usePagination({ totalItems: 0 }));

    expect(result.current.totalPages).toBe(0);
    expect(result.current.currentPage).toBe(1);
  });
});
