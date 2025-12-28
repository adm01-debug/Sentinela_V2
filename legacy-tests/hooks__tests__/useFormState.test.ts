import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useFormState } from '../useFormState';

describe('useFormState', () => {
  it('works', () => {
    const { result } = renderHook(() => useFormState());
    expect(result.current).toBeDefined();
  });
});