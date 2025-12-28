import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useScrollPosition } from '../useScrollPosition';

describe('useScrollPosition', () => {
  it('works', () => {
    const { result } = renderHook(() => useScrollPosition());
    expect(result.current).toBeDefined();
  });
});