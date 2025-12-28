import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSet } from '../useSet';

describe('useSet', () => {
  it('works', () => {
    const { result } = renderHook(() => useSet());
    expect(result.current).toBeDefined();
  });
});