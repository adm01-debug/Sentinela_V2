import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useDarkMode } from '../useDarkMode';
describe('useDarkMode', () => {
  it('should toggle dark mode', () => {
    const { result } = renderHook(() => useDarkMode());
    const initial = result.current.isDarkMode;
    act(() => { result.current.toggle(); });
    expect(result.current.isDarkMode).toBe(!initial);
  });
});