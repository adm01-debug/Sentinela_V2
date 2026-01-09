import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useTheme } from '../useTheme';

describe('useTheme', () => {
  it('should return theme', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBeDefined();
  });

  it('should toggle theme', () => {
    const { result } = renderHook(() => useTheme());
    const initial = result.current.theme;
    act(() => { result.current.toggleTheme(); });
    expect(result.current.theme).not.toBe(initial);
  });
});