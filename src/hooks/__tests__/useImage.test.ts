import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useImage } from '../useImage';

describe('useImage', () => {
  it('should load image', async () => {
    const { result } = renderHook(() => useImage('/test.jpg'));
    expect(result.current.loading).toBeDefined();
  });

  it('should handle error', async () => {
    const { result } = renderHook(() => useImage('/invalid.jpg'));
    expect(result.current.error).toBeDefined();
  });
});