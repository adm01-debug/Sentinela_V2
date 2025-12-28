import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useIndexedDB } from '../useIndexedDB';

describe('useIndexedDB', () => {
  it('works', () => {
    const { result } = renderHook(() => useIndexedDB());
    expect(result.current).toBeDefined();
  });
});