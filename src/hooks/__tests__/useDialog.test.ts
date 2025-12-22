import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useDialog } from '../useDialog';

describe('useDialog', () => {
  it('initializes correctly', () => {
    const { result } = renderHook(() => useDialog());
    expect(result.current).toBeDefined();
  });
});