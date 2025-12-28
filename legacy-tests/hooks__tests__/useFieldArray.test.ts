import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useFieldArray } from '../useFieldArray';

describe('useFieldArray', () => {
  it('works', () => {
    const { result } = renderHook(() => useFieldArray());
    expect(result.current).toBeDefined();
  });
});