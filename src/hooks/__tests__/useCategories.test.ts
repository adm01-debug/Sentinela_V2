import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCategories } from '../useCategories';

describe('useCategories', () => {
  it('should manage categories', () => {
    const { result } = renderHook(() => useCategories());
    expect(result.current.categories).toBeDefined();
  });
});