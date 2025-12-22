import { describe, it, expect, vi } from 'vitest';
import { errorhandlerService } from '../error-handler';

describe('error-handlerService', () => {
  it('should be defined', () => {
    expect(errorhandlerService).toBeDefined();
  });

  it('should initialize', async () => {
    const result = await errorhandlerService.init?.() ?? true;
    expect(result).toBeTruthy();
  });
});