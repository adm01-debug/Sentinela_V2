import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useLatest } from '../useLatest';

describe('useLatest', () => {
  it('works', () => {
    const { result } = renderHook(() => useLatest());
    expect(result.current).toBeDefined();
  });
});