import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useProductivity } from '../useProductivity';

describe('useProductivity', () => {
  it('should return productivity data', () => {
    const { result } = renderHook(() => useProductivity());
    expect(result.current.score).toBeDefined();
    expect(result.current.trends).toBeDefined();
  });
});