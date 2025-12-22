import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSession } from '../useSession';

describe('useSession', () => {
  it('works', () => {
    const { result } = renderHook(() => useSession());
    expect(result.current).toBeDefined();
  });
});