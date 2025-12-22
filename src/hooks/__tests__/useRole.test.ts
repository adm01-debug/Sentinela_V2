import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useRole } from '../useRole';

describe('useRole', () => {
  it('works', () => {
    const { result } = renderHook(() => useRole());
    expect(result.current).toBeDefined();
  });
});