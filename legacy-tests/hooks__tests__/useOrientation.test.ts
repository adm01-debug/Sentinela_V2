import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useOrientation } from '../useOrientation';

describe('useOrientation', () => {
  it('works', () => {
    const { result } = renderHook(() => useOrientation());
    expect(result.current).toBeDefined();
  });
});