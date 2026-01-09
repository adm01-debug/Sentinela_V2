import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useImport } from '../useImport';

describe('useImport', () => {
  it('should import data', () => {
    const { result } = renderHook(() => useImport());
    expect(typeof result.current.importCSV).toBe('function');
    expect(result.current.progress).toBeDefined();
  });
});