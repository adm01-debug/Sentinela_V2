import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useDropzone } from '../useDropzone';

describe('useDropzone', () => {
  it('should handle file drop', () => {
    const onDrop = vi.fn();
    const { result } = renderHook(() => useDropzone({ onDrop }));
    expect(result.current.isDragActive).toBe(false);
  });
});