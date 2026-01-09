import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { usePWA } from '../usePWA';

describe('usePWA', () => {
  it('should detect PWA capabilities', () => {
    const { result } = renderHook(() => usePWA());
    expect(result.current.canInstall).toBeDefined();
  });
});