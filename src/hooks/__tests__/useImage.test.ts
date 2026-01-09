import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useImage } from '../useImage';

describe('useImage', () => {
  it('should track loading state', () => {
    const { result } = renderHook(() => useImage('https://example.com/img.png'));
    expect(result.current.loading).toBe(true);
  });
});