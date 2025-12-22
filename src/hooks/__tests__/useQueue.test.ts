import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useQueue } from '../useQueue';

describe('useQueue', () => {
  it('works', () => {
    const { result } = renderHook(() => useQueue());
    expect(result.current).toBeDefined();
  });
});