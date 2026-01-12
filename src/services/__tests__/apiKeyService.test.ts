import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiKeyService } from '../apiKeyService';

vi.mock('@/utils/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

describe('apiKeyService', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should have getAll method', () => {
    expect(typeof apiKeyService.getAll).toBe('function');
  });

  it('should have create method', () => {
    expect(typeof apiKeyService.create).toBe('function');
  });

  it('should have revoke method', () => {
    expect(typeof apiKeyService.revoke).toBe('function');
  });

  it('should have regenerate method', () => {
    expect(typeof apiKeyService.regenerate).toBe('function');
  });
});
