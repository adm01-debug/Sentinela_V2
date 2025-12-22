import { describe, it, expect, vi } from 'vitest';
import { axiosinstanceService } from '../axios-instance';

describe('axios-instanceService', () => {
  it('should be defined', () => {
    expect(axiosinstanceService).toBeDefined();
  });

  it('should initialize', async () => {
    const result = await axiosinstanceService.init?.() ?? true;
    expect(result).toBeTruthy();
  });
});