import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDarkMode } from '../useDarkMode';

describe('useDarkMode', () => {
  beforeEach(() => { localStorage.clear(); });

  it('should initialize from system preference', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() });
    const { result } = renderHook(() => useDarkMode());
    expect(result.current.isDark).toBe(true);
  });

  it('should toggle dark mode', () => {
    const { result } = renderHook(() => useDarkMode());
    const initial = result.current.isDark;
    act(() => { result.current.toggle(); });
    expect(result.current.isDark).toBe(!initial);
  });

  it('should persist preference', () => {
    const { result } = renderHook(() => useDarkMode());
    act(() => { result.current.setDark(true); });
    expect(localStorage.getItem('theme')).toBe('dark');
  });
});