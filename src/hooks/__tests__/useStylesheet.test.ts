import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useStylesheet } from '../useStylesheet';

describe('useStylesheet', () => {
  it('should load stylesheet', () => {
    const { result } = renderHook(() => useStylesheet('https://example.com/style.css'));
    expect(result.current.loaded).toBeDefined();
  });
});