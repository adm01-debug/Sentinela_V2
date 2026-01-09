import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useDarkMode } from '../useDarkMode';

describe('useDarkMode', () => {
  it('should toggle dark mode', () => {
    const { result } = renderHook(() => useDarkMode());
    const initial = result.current.isDark;
    act(() => { result.current.toggle(); });
    expect(result.current.isDark).toBe(!initial);
  });

  it('should enable dark mode', () => {
    const { result } = renderHook(() => useDarkMode());
    act(() => { result.current.enable(); });
    expect(result.current.isDark).toBe(true);
  });

  it('should disable dark mode', () => {
    const { result } = renderHook(() => useDarkMode());
    act(() => { result.current.disable(); });
    expect(result.current.isDark).toBe(false);
  });
});