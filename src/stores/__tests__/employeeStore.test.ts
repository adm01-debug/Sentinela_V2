import { describe, it, expect } from 'vitest';
import { useEmployeeStore } from '../employeeStore';

describe('employeeStore', () => {
  it('should have initial state', () => {
    const store = useEmployeeStore.getState();
    expect(store).toBeDefined();
  });
});