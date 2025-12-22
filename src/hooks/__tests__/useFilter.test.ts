import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useFilter } from '../useFilter';

describe('useFilter', () => {
  it('works', () => {
    const { result } = renderHook(() => useFilter());
    expect(result.current).toBeDefined();
  });
});