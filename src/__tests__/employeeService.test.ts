import { describe, it, expect, vi, beforeEach } from 'vitest';
import { employeeService } from '../services/employeeService';

vi.mock('@/lib/api', () => ({ apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));

describe('employeeService', () => {
  it('has list method', () => { expect(employeeService.list).toBeDefined(); });
  it('has get method', () => { expect(employeeService.get).toBeDefined(); });
  it('has create method', () => { expect(employeeService.create).toBeDefined(); });
});