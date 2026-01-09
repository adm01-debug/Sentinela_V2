import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useKeyPress } from '../useKeyPress';

describe('useKeyPress', () => {
  it('should detect key press', () => {
    const { result } = renderHook(() => useKeyPress('Enter'));
    expect(result.current).toBe(false);
  });
});