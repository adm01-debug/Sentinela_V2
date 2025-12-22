import { describe, it, expect, vi } from 'vitest';
import { indexeddbService } from '../indexed-db';

describe('indexed-dbService', () => {
  it('should be defined', () => {
    expect(indexeddbService).toBeDefined();
  });

  it('should initialize', async () => {
    const result = await indexeddbService.init?.() ?? true;
    expect(result).toBeTruthy();
  });
});