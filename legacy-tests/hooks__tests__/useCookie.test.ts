import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCookie } from '../useCookie';

describe('useCookie', () => {
  it('initializes correctly', () => {
    const { result } = renderHook(() => useCookie());
    expect(result.current).toBeDefined();
  });
});