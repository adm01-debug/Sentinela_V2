import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useElementSize } from '../useElementSize';

describe('useElementSize', () => {
  it('should return element size', () => {
    const ref = { current: { offsetWidth: 100, offsetHeight: 50 } };
    const { result } = renderHook(() => useElementSize(ref as any));
    expect(result.current.width).toBeDefined();
    expect(result.current.height).toBeDefined();
  });
});