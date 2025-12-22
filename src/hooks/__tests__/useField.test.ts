import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useField } from '../useField';

describe('useField', () => {
  it('works', () => {
    const { result } = renderHook(() => useField());
    expect(result.current).toBeDefined();
  });
});