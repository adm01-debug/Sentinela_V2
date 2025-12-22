import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useList } from '../useList';

describe('useList', () => {
  it('works', () => {
    const { result } = renderHook(() => useList());
    expect(result.current).toBeDefined();
  });
});