import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSearchParams } from '../useSearchParams';

describe('useSearchParams', () => {
  it('should get search params', () => {
    const { result } = renderHook(() => useSearchParams());
    expect(result.current.params).toBeDefined();
  });

  it('should set search params', () => {
    const { result } = renderHook(() => useSearchParams());
    act(() => { result.current.setParam('key', 'value'); });
  });
});