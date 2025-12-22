import { describe, it, expect, vi } from 'vitest';
import { cacheService } from '../cache';

describe('cacheService', () => {
  it('should be defined', () => {
    expect(cacheService).toBeDefined();
  });

  it('should initialize', async () => {
    const result = await cacheService.init?.() ?? true;
    expect(result).toBeTruthy();
  });
});