import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useRouteParams } from '../useRouteParams';

describe('useRouteParams', () => {
  it('should return route params', () => {
    const { result } = renderHook(() => useRouteParams());
    expect(result.current).toBeDefined();
  });
});