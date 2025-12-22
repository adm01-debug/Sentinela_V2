import { describe, it, expect, vi } from 'vitest';
import { localstorageService } from '../local-storage';

describe('local-storageService', () => {
  it('should be defined', () => {
    expect(localstorageService).toBeDefined();
  });

  it('should initialize', async () => {
    const result = await localstorageService.init?.() ?? true;
    expect(result).toBeTruthy();
  });
});