import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useTimeout } from '../useTimeout';

describe('useTimeout', () => {
  it('works', () => {
    const { result } = renderHook(() => useTimeout());
    expect(result.current).toBeDefined();
  });
});