import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useServiceWorker } from '../useServiceWorker';

describe('useServiceWorker', () => {
  it('should check service worker support', () => {
    const { result } = renderHook(() => useServiceWorker('/sw.js'));
    expect(result.current.supported).toBeDefined();
  });
});