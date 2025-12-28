import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useUndo } from '../useUndo';

describe('useUndo', () => {
  it('works', () => {
    const { result } = renderHook(() => useUndo());
    expect(result.current).toBeDefined();
  });
});