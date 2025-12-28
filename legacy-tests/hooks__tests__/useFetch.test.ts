import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useFetch } from '../useFetch';

describe('useFetch', () => {
  it('works', () => {
    const { result } = renderHook(() => useFetch());
    expect(result.current).toBeDefined();
  });
});