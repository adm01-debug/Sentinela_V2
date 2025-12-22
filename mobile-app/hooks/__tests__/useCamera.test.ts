import { renderHook } from '@testing-library/react-hooks';
import { describe, it, expect } from 'vitest';
import { useCamera } from '../useCamera';

describe('useCamera', () => {
  it('returns value', () => {
    const { result } = renderHook(() => useCamera());
    expect(result.current).toBeDefined();
  });
});