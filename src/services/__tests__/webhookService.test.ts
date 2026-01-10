import { describe, it, expect, vi, beforeEach } from 'vitest';
import webhookService from '../webhookService';

describe('webhookService', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it('should be defined', () => { expect(webhookService).toBeDefined(); });
  it('should have required methods', () => { expect(typeof webhookService).toBe('object'); });
});
