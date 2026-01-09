import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useConnectionQuality } from '../useConnectionQuality';

describe('useConnectionQuality', () => {
  it('should return connection quality', () => {
    const { result } = renderHook(() => useConnectionQuality());
    expect(result.current.effectiveType).toBeDefined();
  });
});