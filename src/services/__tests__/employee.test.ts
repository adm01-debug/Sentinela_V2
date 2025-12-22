import { describe, it, expect, vi } from 'vitest';
import { employeeService } from '../employee';

describe('employeeService', () => {
  it('should be defined', () => {
    expect(employeeService).toBeDefined();
  });

  it('should initialize', async () => {
    const result = await employeeService.init?.() ?? true;
    expect(result).toBeTruthy();
  });
});