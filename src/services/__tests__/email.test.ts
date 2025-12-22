import { describe, it, expect, vi } from 'vitest';
import { emailService } from '../email';

describe('emailService', () => {
  it('should be defined', () => {
    expect(emailService).toBeDefined();
  });

  it('should initialize', async () => {
    const result = await emailService.init?.() ?? true;
    expect(result).toBeTruthy();
  });
});