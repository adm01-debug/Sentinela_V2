import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSort } from '../useSort';

describe('useSort', () => {
  it('works', () => {
    const { result } = renderHook(() => useSort());
    expect(result.current).toBeDefined();
  });
});