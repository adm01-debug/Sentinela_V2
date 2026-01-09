import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useSearch } from '../useSearch';

describe('useSearch', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('should debounce search', () => {
    const onSearch = vi.fn();
    const { result } = renderHook(() => useSearch({ onSearch, debounce: 300 }));
    act(() => { result.current.setQuery('test'); });
    expect(onSearch).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(300); });
    expect(onSearch).toHaveBeenCalledWith('test');
  });
});