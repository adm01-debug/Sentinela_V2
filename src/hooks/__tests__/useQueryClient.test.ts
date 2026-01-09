import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useQueryClient } from '../useQueryClient';

describe('useQueryClient', () => {
  it('should return query client methods', () => {
    const { result } = renderHook(() => useQueryClient());
    expect(typeof result.current.invalidateQueries).toBe('function');
    expect(typeof result.current.refetchQueries).toBe('function');
  });
});