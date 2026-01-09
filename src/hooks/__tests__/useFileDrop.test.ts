import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useFileDrop } from '../useFileDrop';

describe('useFileDrop', () => {
  it('should return file drop state', () => {
    const { result } = renderHook(() => useFileDrop());
    expect(result.current.isDragging).toBe(false);
    expect(result.current.files).toEqual([]);
  });
});