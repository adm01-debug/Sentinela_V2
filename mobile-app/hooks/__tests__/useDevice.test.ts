import { renderHook } from '@testing-library/react-hooks';
import { describe, it, expect } from 'vitest';
import { useDevice } from '../useDevice';

describe('useDevice', () => {
  it('returns value', () => {
    const { result } = renderHook(() => useDevice());
    expect(result.current).toBeDefined();
  });
});