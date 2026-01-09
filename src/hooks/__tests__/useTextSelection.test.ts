import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useTextSelection } from '../useTextSelection';

describe('useTextSelection', () => {
  it('should return selection state', () => {
    const { result } = renderHook(() => useTextSelection());
    expect(result.current.text).toBe('');
  });
});