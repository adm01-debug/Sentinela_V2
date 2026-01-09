import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useTreeData } from '../useTreeData';

describe('useTreeData', () => {
  it('should manage tree data', () => {
    const data = [{ id: 1, parentId: null }, { id: 2, parentId: 1 }];
    const { result } = renderHook(() => useTreeData(data));
    expect(result.current.tree).toBeDefined();
  });
});