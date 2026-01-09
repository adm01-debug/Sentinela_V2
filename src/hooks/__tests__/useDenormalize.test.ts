import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useDenormalize } from '../useDenormalize';

describe('useDenormalize', () => {
  it('should denormalize data', () => {
    const entities = { 1: { id: 1, name: 'A' } };
    const ids = [1];
    const { result } = renderHook(() => useDenormalize(ids, entities));
    expect(result.current[0].name).toBe('A');
  });
});