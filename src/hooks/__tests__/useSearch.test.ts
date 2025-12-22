import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSearch } from '../useSearch';

describe('useSearch', () => {
  it('works', () => {
    const { result } = renderHook(() => useSearch());
    expect(result.current).toBeDefined();
  });
});