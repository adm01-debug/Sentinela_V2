import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useOnline } from '../useOnline';

describe('useOnline', () => {
  it('works', () => {
    const { result } = renderHook(() => useOnline());
    expect(result.current).toBeDefined();
  });
});