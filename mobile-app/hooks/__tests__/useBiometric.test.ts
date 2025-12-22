import { renderHook } from '@testing-library/react-hooks';
import { describe, it, expect } from 'vitest';
import { useBiometric } from '../useBiometric';

describe('useBiometric', () => {
  it('returns value', () => {
    const { result } = renderHook(() => useBiometric());
    expect(result.current).toBeDefined();
  });
});