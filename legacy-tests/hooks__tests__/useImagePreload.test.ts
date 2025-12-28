import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useImagePreload } from '../useImagePreload';

describe('useImagePreload', () => {
  it('works', () => {
    const { result } = renderHook(() => useImagePreload());
    expect(result.current).toBeDefined();
  });
});