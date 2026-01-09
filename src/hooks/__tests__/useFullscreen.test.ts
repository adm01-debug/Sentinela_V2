import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useFullscreen } from '../useFullscreen';

describe('useFullscreen', () => {
  it('should initialize as not fullscreen', () => {
    const { result } = renderHook(() => useFullscreen());
    expect(result.current.isFullscreen).toBe(false);
  });

  it('should have enter and exit methods', () => {
    const { result } = renderHook(() => useFullscreen());
    expect(typeof result.current.enterFullscreen).toBe('function');
    expect(typeof result.current.exitFullscreen).toBe('function');
  });
});