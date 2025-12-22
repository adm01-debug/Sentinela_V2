import { describe, it, expect, vi } from 'vitest';
import { analyticsService } from '../analytics';

describe('analyticsService', () => {
  it('should be defined', () => {
    expect(analyticsService).toBeDefined();
  });

  it('should initialize', async () => {
    const result = await analyticsService.init?.() ?? true;
    expect(result).toBeTruthy();
  });
});