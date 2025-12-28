import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useMap } from '../useMap';

describe('useMap', () => {
  it('works', () => {
    const { result } = renderHook(() => useMap());
    expect(result.current).toBeDefined();
  });
});