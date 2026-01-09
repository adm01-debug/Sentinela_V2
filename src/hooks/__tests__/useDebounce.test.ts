import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), { initialProps: { value: 'initial' } });
    rerender({ value: 'changed' });
    expect(result.current).toBe('initial');
    act(() => { vi.advanceTimersByTime(500); });
    expect(result.current).toBe('changed');
  });

  it('should reset timer on rapid changes', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), { initialProps: { value: 'a' } });
    rerender({ value: 'b' });
    act(() => { vi.advanceTimersByTime(300); });
    rerender({ value: 'c' });
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current).toBe('a');
    act(() => { vi.advanceTimersByTime(200); });
    expect(result.current).toBe('c');
  });

  it('should handle delay of 0', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 0), { initialProps: { value: 'initial' } });
    rerender({ value: 'changed' });
    act(() => { vi.advanceTimersByTime(0); });
    expect(result.current).toBe('changed');
  });
});
