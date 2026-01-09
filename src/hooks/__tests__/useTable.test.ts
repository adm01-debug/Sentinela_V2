import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useTable } from '../useTable';

describe('useTable', () => {
  it('should manage table state', () => {
    const data = [{ id: 1, name: 'A' }, { id: 2, name: 'B' }];
    const { result } = renderHook(() => useTable({ data, columns: ['id', 'name'] }));
    expect(result.current.rows).toBeDefined();
    expect(result.current.headers).toBeDefined();
  });
});