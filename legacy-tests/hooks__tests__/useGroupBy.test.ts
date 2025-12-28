import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useGroupBy } from '../useGroupBy';

describe('useGroupBy', () => {
  it('works', () => {
    const { result } = renderHook(() => useGroupBy());
    expect(result.current).toBeDefined();
  });
});