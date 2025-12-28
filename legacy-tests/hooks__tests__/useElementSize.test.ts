import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useElementSize } from '../useElementSize';

describe('useElementSize', () => {
  it('works', () => {
    const { result } = renderHook(() => useElementSize());
    expect(result.current).toBeDefined();
  });
});