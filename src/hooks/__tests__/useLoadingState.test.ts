import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useLoadingState } from '../useLoadingState';

describe('useLoadingState', () => {
  it('should start not loading', () => {
    const { result } = renderHook(() => useLoadingState());
    expect(result.current.isLoading).toBe(false);
  });

  it('should set loading', () => {
    const { result } = renderHook(() => useLoadingState());
    act(() => { result.current.startLoading(); });
    expect(result.current.isLoading).toBe(true);
  });

  it('should stop loading', () => {
    const { result } = renderHook(() => useLoadingState());
    act(() => { result.current.startLoading(); result.current.stopLoading(); });
    expect(result.current.isLoading).toBe(false);
  });
});