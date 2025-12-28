import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useUnmount } from '../useUnmount';

describe('useUnmount', () => {
  it('works', () => {
    const { result } = renderHook(() => useUnmount());
    expect(result.current).toBeDefined();
  });
});