import { renderHook } from '@testing-library/react-hooks';
import { describe, it, expect } from 'vitest';
import { useLocation } from '../useLocation';

describe('useLocation', () => {
  it('returns value', () => {
    const { result } = renderHook(() => useLocation());
    expect(result.current).toBeDefined();
  });
});