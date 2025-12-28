import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useInfiniteScroll } from '../useInfiniteScroll';

describe('useInfiniteScroll', () => {
  it('works', () => {
    const { result } = renderHook(() => useInfiniteScroll());
    expect(result.current).toBeDefined();
  });
});