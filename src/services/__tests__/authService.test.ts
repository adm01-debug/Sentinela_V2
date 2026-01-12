import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../authService';

vi.mock('@/utils/api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('authService', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should have login method', () => {
    expect(typeof authService.login).toBe('function');
  });

  it('should have logout method', () => {
    expect(typeof authService.logout).toBe('function');
  });

  it('should have getCurrentUser method', () => {
    expect(typeof authService.getCurrentUser).toBe('function');
  });

  it('should have register method', () => {
    expect(typeof authService.register).toBe('function');
  });

  it('should have refreshToken method', () => {
    expect(typeof authService.refreshToken).toBe('function');
  });
});
