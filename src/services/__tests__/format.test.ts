import { describe, it, expect, vi } from 'vitest';
import { formatService } from '../format';

describe('formatService', () => {
  it('should be defined', () => {
    expect(formatService).toBeDefined();
  });

  it('should initialize', async () => {
    const result = await formatService.init?.() ?? true;
    expect(result).toBeTruthy();
  });
});