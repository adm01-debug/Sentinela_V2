import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useWebhooks } from '../useWebhooks';

describe('useWebhooks', () => {
  it('should manage webhooks', () => {
    const { result } = renderHook(() => useWebhooks());
    expect(result.current.webhooks).toBeDefined();
    expect(typeof result.current.create).toBe('function');
  });
});