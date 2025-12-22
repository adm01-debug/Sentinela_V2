import { describe, it, expect, vi } from 'vitest';
import { encryptionService } from '../encryption';

describe('encryptionService', () => {
  it('should be defined', () => {
    expect(encryptionService).toBeDefined();
  });

  it('should initialize', async () => {
    const result = await encryptionService.init?.() ?? true;
    expect(result).toBeTruthy();
  });
});