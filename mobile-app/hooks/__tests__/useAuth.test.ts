import { renderHook } from '@testing-library/react-hooks';
import { describe, it, expect } from 'vitest';
import { useAuth } from '../useAuth';

describe('useAuth', () => {
  it('returns value', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current).toBeDefined();
  });
});