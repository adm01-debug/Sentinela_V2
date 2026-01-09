import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useRelativeTime } from '../useRelativeTime';

describe('useRelativeTime', () => {
  it('should return relative time', () => {
    const now = new Date();
    const { result } = renderHook(() => useRelativeTime(now));
    expect(result.current).toBeDefined();
  });
});