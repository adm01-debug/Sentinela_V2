import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useEvent } from '../useEvent';

describe('useEvent', () => {
  it('works', () => {
    const { result } = renderHook(() => useEvent());
    expect(result.current).toBeDefined();
  });
});