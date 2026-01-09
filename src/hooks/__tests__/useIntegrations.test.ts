import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useIntegrations } from '../useIntegrations';

describe('useIntegrations', () => {
  it('should manage integrations', () => {
    const { result } = renderHook(() => useIntegrations());
    expect(result.current.integrations).toBeDefined();
    expect(typeof result.current.connect).toBe('function');
  });
});