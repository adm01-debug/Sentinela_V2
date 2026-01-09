import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useFullscreen } from '../useFullscreen';

describe('useFullscreen', () => {
  it('should return fullscreen state', () => {
    const ref = { current: document.createElement('div') };
    const { result } = renderHook(() => useFullscreen(ref));
    expect(result.current.isFullscreen).toBe(false);
  });
});