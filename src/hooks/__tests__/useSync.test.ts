import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSync } from '../useSync';

describe('useSync', () => {
  it('should sync data', () => {
    const { result } = renderHook(() => useSync('syncKey'));
    expect(result.current.sync).toBeDefined();
    expect(result.current.isSyncing).toBeDefined();
  });
});