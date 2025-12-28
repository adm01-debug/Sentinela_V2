import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useScroll } from '../useScroll';

describe('useScroll', () => {
  it('works', () => {
    const { result } = renderHook(() => useScroll());
    expect(result.current).toBeDefined();
  });
});