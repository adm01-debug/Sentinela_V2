import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useOrientation } from '../useOrientation';

describe('useOrientation', () => {
  it('should return orientation', () => {
    const { result } = renderHook(() => useOrientation());
    expect(result.current.type).toBeDefined();
  });
});