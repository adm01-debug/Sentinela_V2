import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useHierarchy } from '../useHierarchy';

describe('useHierarchy', () => {
  it('should build hierarchy', () => {
    const { result } = renderHook(() => useHierarchy([{ id: 1, parent: null }]));
    expect(result.current.root).toBeDefined();
  });
});