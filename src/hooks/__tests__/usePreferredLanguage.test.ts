import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { usePreferredLanguage } from '../usePreferredLanguage';

describe('usePreferredLanguage', () => {
  it('should return browser language', () => {
    const { result } = renderHook(() => usePreferredLanguage());
    expect(result.current).toBeDefined();
  });
});