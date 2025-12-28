import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSelection } from '../useSelection';

describe('useSelection', () => {
  it('works', () => {
    const { result } = renderHook(() => useSelection());
    expect(result.current).toBeDefined();
  });
});