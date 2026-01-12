import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useApiKeys } from '../useApiKeys';

vi.mock('@/services/apiKeyService', () => ({
  apiKeyService: {
    getAll: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({ key: 'new-key', apiKey: { id: '1' } }),
    revoke: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('useApiKeys', () => {
  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useApiKeys());
    expect(result.current.apiKeys).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('should have fetchApiKeys function', () => {
    const { result } = renderHook(() => useApiKeys());
    expect(typeof result.current.fetchApiKeys).toBe('function');
  });

  it('should have createApiKey function', () => {
    const { result } = renderHook(() => useApiKeys());
    expect(typeof result.current.createApiKey).toBe('function');
  });
});
