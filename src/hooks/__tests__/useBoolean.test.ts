import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useBoolean } from '../useBoolean';

describe('useBoolean', () => {
  it('should toggle', () => {
    const { result } = renderHook(() => useBoolean(false));
    act(() => { result.current.toggle(); });
    expect(result.current.value).toBe(true);
  });

  it('should set true', () => {
    const { result } = renderHook(() => useBoolean(false));
    act(() => { result.current.setTrue(); });
    expect(result.current.value).toBe(true);
  });

  it('should set false', () => {
    const { result } = renderHook(() => useBoolean(true));
    act(() => { result.current.setFalse(); });
    expect(result.current.value).toBe(false);
  });
});