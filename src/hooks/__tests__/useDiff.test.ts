import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useDiff } from '../useDiff';

describe('useDiff', () => {
  it('should calculate diff', () => {
    const { result } = renderHook(() => useDiff({ a: 1 }, { a: 2 }));
    expect(result.current.changes).toBeDefined();
  });
});