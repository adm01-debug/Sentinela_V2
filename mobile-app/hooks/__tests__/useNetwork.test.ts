import { renderHook } from '@testing-library/react-hooks';
import { describe, it, expect } from 'vitest';
import { useNetwork } from '../useNetwork';

describe('useNetwork', () => {
  it('returns value', () => {
    const { result } = renderHook(() => useNetwork());
    expect(result.current).toBeDefined();
  });
});