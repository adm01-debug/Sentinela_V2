import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useWindowSize } from '../useWindowSize';

describe('useWindowSize', () => {
  it('should return window dimensions', () => {
    const { result } = renderHook(() => useWindowSize());
    expect(result.current.width).toBe(window.innerWidth);
    expect(result.current.height).toBe(window.innerHeight);
  });

  it('should update on resize', () => {
    const { result } = renderHook(() => useWindowSize());
    act(() => {
      window.innerWidth = 1024;
      window.innerHeight = 768;
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current.width).toBe(1024);
  });
});