import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { usePrivacy } from '../usePrivacy';

describe('usePrivacy', () => {
  it('should manage privacy settings', () => {
    const { result } = renderHook(() => usePrivacy());
    expect(result.current.settings).toBeDefined();
    expect(typeof result.current.requestDataExport).toBe('function');
  });
});