import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePrevious, useHasChanged, useFirstRender } from '../usePrevious';

describe('usePrevious', () => {
  it('should return undefined on first render', () => {
    const { result } = renderHook(() => usePrevious('initial'));
    expect(result.current).toBeUndefined();
  });

  it('should return previous value after rerender', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: 'first' } }
    );

    expect(result.current).toBeUndefined();

    rerender({ value: 'second' });
    expect(result.current).toBe('first');

    rerender({ value: 'third' });
    expect(result.current).toBe('second');
  });
});

describe('useHasChanged', () => {
  it('should return false on first render', () => {
    const { result } = renderHook(() => useHasChanged('value'));
    expect(result.current).toBe(false);
  });

  it('should return true when value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useHasChanged(value),
      { initialProps: { value: 'first' } }
    );

    expect(result.current).toBe(false);

    rerender({ value: 'second' });
    expect(result.current).toBe(true);
  });

  it('should return false when value stays the same', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useHasChanged(value),
      { initialProps: { value: 'same' } }
    );

    rerender({ value: 'same' });
    expect(result.current).toBe(false);
  });
});

describe('useFirstRender', () => {
  it('should return true on first render', () => {
    const { result } = renderHook(() => useFirstRender());
    expect(result.current).toBe(true);
  });

  it('should return false after rerender', () => {
    const { result, rerender } = renderHook(() => useFirstRender());
    
    expect(result.current).toBe(true);
    
    rerender();
    expect(result.current).toBe(false);
  });
});
