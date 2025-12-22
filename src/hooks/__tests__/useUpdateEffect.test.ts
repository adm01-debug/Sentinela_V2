import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useUpdateEffect } from '../useUpdateEffect';

describe('useUpdateEffect', () => {
  it('works', () => {
    const { result } = renderHook(() => useUpdateEffect());
    expect(result.current).toBeDefined();
  });
});