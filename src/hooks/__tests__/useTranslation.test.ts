import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useTranslation } from '../useTranslation';

describe('useTranslation', () => {
  it('should return translation function', () => {
    const { result } = renderHook(() => useTranslation());
    expect(typeof result.current.t).toBe('function');
  });
});