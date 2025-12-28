import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useIntersection } from '../useIntersection';

describe('useIntersection', () => {
  it('works', () => {
    const { result } = renderHook(() => useIntersection());
    expect(result.current).toBeDefined();
  });
});