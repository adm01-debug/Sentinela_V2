import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useDataGrid } from '../useDataGrid';

describe('useDataGrid', () => {
  it('should manage data grid', () => {
    const { result } = renderHook(() => useDataGrid({ data: [], columns: [] }));
    expect(result.current.rows).toBeDefined();
    expect(result.current.sort).toBeDefined();
    expect(result.current.filter).toBeDefined();
  });
});