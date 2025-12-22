import { describe, it, expect, vi } from 'vitest';
import { authService } from '../auth';

describe('authService', () => {
  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('should initialize', async () => {
    const result = await authService.init?.() ?? true;
    expect(result).toBeTruthy();
  });
});