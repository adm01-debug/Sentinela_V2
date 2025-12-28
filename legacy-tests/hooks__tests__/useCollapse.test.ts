import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCollapse } from '../useCollapse';

describe('useCollapse', () => {
  it('initializes correctly', () => {
    const { result } = renderHook(() => useCollapse());
    expect(result.current).toBeDefined();
  });
});