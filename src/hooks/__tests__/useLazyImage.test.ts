import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useLazyImage } from '../useLazyImage';

describe('useLazyImage', () => {
  it('should lazy load image', () => {
    const ref = { current: document.createElement('img') };
    const { result } = renderHook(() => useLazyImage(ref, 'https://example.com/img.png'));
    expect(result.current.isLoaded).toBe(false);
  });
});