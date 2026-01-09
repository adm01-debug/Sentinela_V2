import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useNormalize } from '../useNormalize';

describe('useNormalize', () => {
  it('should normalize data', () => {
    const data = [{ id: 1, name: 'A' }, { id: 2, name: 'B' }];
    const { result } = renderHook(() => useNormalize(data, 'id'));
    expect(result.current.entities[1].name).toBe('A');
  });
});