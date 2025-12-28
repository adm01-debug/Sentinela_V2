import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useDrawer } from '../useDrawer';

describe('useDrawer', () => {
  it('initializes correctly', () => {
    const { result } = renderHook(() => useDrawer());
    expect(result.current).toBeDefined();
  });
});