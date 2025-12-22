import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useVibration } from '../useVibration';

describe('useVibration', () => {
  it('works', () => {
    const { result } = renderHook(() => useVibration());
    expect(result.current).toBeDefined();
  });
});