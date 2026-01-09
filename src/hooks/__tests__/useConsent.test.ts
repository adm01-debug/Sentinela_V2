import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useConsent } from '../useConsent';

describe('useConsent', () => {
  it('should manage consent', () => {
    const { result } = renderHook(() => useConsent());
    expect(result.current.consents).toBeDefined();
    act(() => { result.current.grant('analytics'); });
  });
});