import { describe, it, expect, beforeEach } from 'vitest';
import { useEmployeeStore } from '../employeeStore';
describe('employeeStore', () => {
  beforeEach(() => { useEmployeeStore.setState({ employees: [], selectedEmployee: null }); });
  it('adds employee', () => { useEmployeeStore.getState().addEmployee({ id: '1', name: 'John', email: 'j@t.com', department: 'Eng', role: 'Dev', status: 'active' }); expect(useEmployeeStore.getState().employees).toHaveLength(1); });
  it('deletes employee', () => { useEmployeeStore.getState().addEmployee({ id: '1', name: 'John', email: 'j@t.com', department: 'Eng', role: 'Dev', status: 'active' }); useEmployeeStore.getState().deleteEmployee('1'); expect(useEmployeeStore.getState().employees).toHaveLength(0); });
});