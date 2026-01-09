import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useNow } from '../useNow';

describe('useNow', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('should return current timestamp', () => {
    const { result } = renderHook(() => useNow());
    expect(result.current).toBeInstanceOf(Date);
  });
});