import { renderHook } from '@testing-library/react-hooks';
import { describe, it, expect } from 'vitest';
import { useUser } from '../useUser';

describe('useUser', () => {
  it('returns value', () => {
    const { result } = renderHook(() => useUser());
    expect(result.current).toBeDefined();
  });
});