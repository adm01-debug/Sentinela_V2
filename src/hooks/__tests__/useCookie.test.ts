import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCookie } from '../useCookie';
describe('useCookie', () => {
  it('should manage cookie', () => {
    const { result } = renderHook(() => useCookie('test'));
    expect(result.current.value).toBeDefined();
  });
});