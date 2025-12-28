import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useHover } from '../useHover';

describe('useHover', () => {
  it('works', () => {
    const { result } = renderHook(() => useHover());
    expect(result.current).toBeDefined();
  });
});