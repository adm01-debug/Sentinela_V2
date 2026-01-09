import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCarousel } from '../useCarousel';

describe('useCarousel', () => {
  it('should initialize at first slide', () => {
    const { result } = renderHook(() => useCarousel(5));
    expect(result.current.currentIndex).toBe(0);
  });

  it('should go to next slide', () => {
    const { result } = renderHook(() => useCarousel(5));
    act(() => { result.current.next(); });
    expect(result.current.currentIndex).toBe(1);
  });

  it('should go to prev slide', () => {
    const { result } = renderHook(() => useCarousel(5, 2));
    act(() => { result.current.prev(); });
    expect(result.current.currentIndex).toBe(1);
  });

  it('should loop to start', () => {
    const { result } = renderHook(() => useCarousel(3, 2));
    act(() => { result.current.next(); });
    expect(result.current.currentIndex).toBe(0);
  });
});