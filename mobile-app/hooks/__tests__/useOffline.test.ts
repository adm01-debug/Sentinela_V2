import { renderHook } from '@testing-library/react-hooks';
import { describe, it, expect } from 'vitest';
import { useOffline } from '../useOffline';

describe('useOffline', () => {
  it('returns value', () => {
    const { result } = renderHook(() => useOffline());
    expect(result.current).toBeDefined();
  });
});