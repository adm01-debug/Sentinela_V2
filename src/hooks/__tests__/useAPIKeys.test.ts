import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useAPIKeys } from '../useAPIKeys';

describe('useAPIKeys', () => {
  it('should manage API keys', () => {
    const { result } = renderHook(() => useAPIKeys());
    expect(result.current.keys).toBeDefined();
    expect(typeof result.current.create).toBe('function');
    expect(typeof result.current.revoke).toBe('function');
  });
});