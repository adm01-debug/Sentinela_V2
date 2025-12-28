import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useConfirm } from '../useConfirm';

describe('useConfirm', () => {
  it('initializes correctly', () => {
    const { result } = renderHook(() => useConfirm());
    expect(result.current).toBeDefined();
  });
});