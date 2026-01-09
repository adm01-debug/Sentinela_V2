import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useScroll } from '../useScroll';

describe('useScroll', () => {
  it('should return scroll position', () => {
    const { result } = renderHook(() => useScroll());
    expect(result.current.x).toBeDefined();
    expect(result.current.y).toBeDefined();
  });

  it('should update on scroll', () => {
    const { result } = renderHook(() => useScroll());
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 100, writable: true });
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current.y).toBe(100);
  });
});