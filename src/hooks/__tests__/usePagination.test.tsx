import { renderHook, act } from '@testing-library/react';
import { usePagination, useServerPagination } from '../usePagination';

describe('usePagination (client-side)', () => {
  const mockData = Array.from({ length: 50 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` }));

  it('should initialize with page 1 and default page size', () => {
    const { result } = renderHook(() => usePagination(mockData));
    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(10);
  });

  it('should calculate total pages correctly', () => {
    const { result } = renderHook(() => usePagination(mockData, { initialPageSize: 10 }));
    expect(result.current.totalPages).toBe(5);
  });

  it('should return correct paginated data', () => {
    const { result } = renderHook(() => usePagination(mockData, { initialPageSize: 10 }));
    expect(result.current.paginatedData.length).toBe(10);
    expect(result.current.paginatedData[0].id).toBe(1);
    expect(result.current.paginatedData[9].id).toBe(10);
  });

  it('should go to next page', () => {
    const { result } = renderHook(() => usePagination(mockData, { initialPageSize: 10 }));

    act(() => {
      result.current.nextPage();
    });
    expect(result.current.page).toBe(2);
    expect(result.current.paginatedData[0].id).toBe(11);
  });

  it('should go to previous page', () => {
    const { result } = renderHook(() => usePagination(mockData, { initialPage: 3, initialPageSize: 10 }));

    act(() => {
      result.current.prevPage();
    });
    expect(result.current.page).toBe(2);
  });

  it('should not go below page 1', () => {
    const { result } = renderHook(() => usePagination(mockData));

    act(() => {
      result.current.prevPage();
    });
    expect(result.current.page).toBe(1);
  });

  it('should not exceed total pages', () => {
    const { result } = renderHook(() => usePagination(mockData, { initialPageSize: 10 }));

    act(() => {
      result.current.goToPage(10);
    });
    expect(result.current.page).toBe(5);
  });

  it('should go to specific page', () => {
    const { result } = renderHook(() => usePagination(mockData, { initialPageSize: 10 }));

    act(() => {
      result.current.goToPage(3);
    });
    expect(result.current.page).toBe(3);
  });

  it('should go to first and last page', () => {
    const { result } = renderHook(() => usePagination(mockData, { initialPage: 3, initialPageSize: 10 }));

    act(() => {
      result.current.firstPage();
    });
    expect(result.current.page).toBe(1);

    act(() => {
      result.current.lastPage();
    });
    expect(result.current.page).toBe(5);
  });

  it('should indicate if there are more pages', () => {
    const { result } = renderHook(() => usePagination(mockData, { initialPageSize: 10 }));

    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.hasPrevPage).toBe(false);

    act(() => {
      result.current.goToPage(5);
    });

    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.hasPrevPage).toBe(true);
  });

  it('should change page size', () => {
    const { result } = renderHook(() => usePagination(mockData, { initialPageSize: 10 }));

    act(() => {
      result.current.setPageSize(20);
    });

    expect(result.current.pageSize).toBe(20);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.page).toBe(1);
  });

  it('should provide offset and limit for queries', () => {
    const { result } = renderHook(() => usePagination(mockData, { initialPage: 2, initialPageSize: 10 }));
    expect(result.current.offset).toBe(10);
    expect(result.current.limit).toBe(10);
  });
});

describe('useServerPagination', () => {
  it('should initialize with provided options', () => {
    const { result } = renderHook(() => useServerPagination({
      initialPage: 1,
      initialPageSize: 25,
      totalItems: 100,
    }));

    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(25);
    expect(result.current.totalPages).toBe(4);
  });

  it('should calculate range for Supabase', () => {
    const { result } = renderHook(() => useServerPagination({
      initialPage: 2,
      initialPageSize: 10,
      totalItems: 50,
    }));

    expect(result.current.rangeStart).toBe(10);
    expect(result.current.rangeEnd).toBe(19);
  });

  it('should allow updating total items', () => {
    const { result } = renderHook(() => useServerPagination({
      initialPageSize: 10,
      totalItems: 0,
    }));

    expect(result.current.totalPages).toBe(0);

    act(() => {
      result.current.setTotalItems(100);
    });

    expect(result.current.totalPages).toBe(10);
  });
});
