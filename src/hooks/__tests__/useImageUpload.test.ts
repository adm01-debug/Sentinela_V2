import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useImageUpload } from '../useImageUpload';

describe('useImageUpload', () => {
  it('should handle image upload', () => {
    const onUpload = vi.fn();
    const { result } = renderHook(() => useImageUpload({ onUpload }));
    expect(result.current.isUploading).toBe(false);
  });
});