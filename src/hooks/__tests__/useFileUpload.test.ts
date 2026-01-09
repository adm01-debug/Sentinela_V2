import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useFileUpload } from '../useFileUpload';

describe('useFileUpload', () => {
  it('should handle file upload', () => {
    const { result } = renderHook(() => useFileUpload({ endpoint: '/upload' }));
    expect(result.current.progress).toBe(0);
    expect(result.current.isUploading).toBe(false);
  });
});