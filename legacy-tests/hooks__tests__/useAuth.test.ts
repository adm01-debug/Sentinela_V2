import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useAuth } from '../useAuth';

describe('useAuth', () => {
  it('initializes correctly', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current).toBeDefined();
  });
});