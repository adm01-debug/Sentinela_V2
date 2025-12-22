import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useValidation } from '../useValidation';

describe('useValidation', () => {
  it('works', () => {
    const { result } = renderHook(() => useValidation());
    expect(result.current).toBeDefined();
  });
});