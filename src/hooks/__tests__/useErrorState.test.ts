import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useErrorState } from '../useErrorState';

describe('useErrorState', () => {
  it('should start with no error', () => {
    const { result } = renderHook(() => useErrorState());
    expect(result.current.error).toBeNull();
  });

  it('should set error', () => {
    const { result } = renderHook(() => useErrorState());
    act(() => { result.current.setError(new Error('fail')); });
    expect(result.current.error?.message).toBe('fail');
  });

  it('should clear error', () => {
    const { result } = renderHook(() => useErrorState());
    act(() => { result.current.setError(new Error('x')); result.current.clearError(); });
    expect(result.current.error).toBeNull();
  });
});