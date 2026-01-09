import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useTimeAgo } from '../useTimeAgo';

describe('useTimeAgo', () => {
  it('should return time ago string', () => {
    const past = new Date(Date.now() - 60000);
    const { result } = renderHook(() => useTimeAgo(past));
    expect(result.current).toContain('minute');
  });
});