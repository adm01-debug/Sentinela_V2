import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useOrientation } from '../useOrientation';

describe('useOrientation', () => {
  it('should return orientation', () => {
    const { result } = renderHook(() => useOrientation());
    expect(result.current.angle).toBeDefined();
  });
});