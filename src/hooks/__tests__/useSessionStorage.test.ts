import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSessionStorage } from '../useSessionStorage';

describe('useSessionStorage', () => {
  it('works', () => {
    const { result } = renderHook(() => useSessionStorage());
    expect(result.current).toBeDefined();
  });
});