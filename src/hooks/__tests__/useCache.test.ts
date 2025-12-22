import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCache } from '../useCache';

describe('useCache', () => {
  it('initializes correctly', () => {
    const { result } = renderHook(() => useCache());
    expect(result.current).toBeDefined();
  });
});