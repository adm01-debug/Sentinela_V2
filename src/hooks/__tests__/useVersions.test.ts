import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useVersions } from '../useVersions';

describe('useVersions', () => {
  it('should manage versions', () => {
    const { result } = renderHook(() => useVersions());
    expect(result.current.versions).toBeDefined();
    expect(typeof result.current.restore).toBe('function');
  });
});