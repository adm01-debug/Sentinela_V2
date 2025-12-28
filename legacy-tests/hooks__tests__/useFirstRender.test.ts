import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useFirstRender } from '../useFirstRender';

describe('useFirstRender', () => {
  it('works', () => {
    const { result } = renderHook(() => useFirstRender());
    expect(result.current).toBeDefined();
  });
});