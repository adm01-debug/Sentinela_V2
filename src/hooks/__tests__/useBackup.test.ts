import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useBackup } from '../useBackup';

describe('useBackup', () => {
  it('should manage backups', () => {
    const { result } = renderHook(() => useBackup());
    expect(result.current.backups).toBeDefined();
    expect(typeof result.current.create).toBe('function');
    expect(typeof result.current.restore).toBe('function');
  });
});