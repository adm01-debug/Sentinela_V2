import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useFileDrop } from '../useFileDrop';

describe('useFileDrop', () => {
  it('works', () => {
    const { result } = renderHook(() => useFileDrop());
    expect(result.current).toBeDefined();
  });
});