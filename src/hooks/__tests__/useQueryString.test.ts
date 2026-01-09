import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useQueryString } from '../useQueryString';

describe('useQueryString', () => {
  it('should parse query string', () => {
    const { result } = renderHook(() => useQueryString());
    expect(result.current.query).toBeDefined();
  });
});