import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useFullscreen } from '../useFullscreen';

describe('useFullscreen', () => {
  it('works', () => {
    const { result } = renderHook(() => useFullscreen());
    expect(result.current).toBeDefined();
  });
});