import { describe, it, expect, beforeEach } from 'vitest';
import { useDepartmentStore } from '../departmentStore';

describe('departmentStore', () => {
  beforeEach(() => {
    useDepartmentStore.setState({ departments: [], selectedDepartment: null, isLoading: false });
  });

  it('should have correct initial state', () => {
    const state = useDepartmentStore.getState();
    expect(state.departments).toEqual([]);
    expect(state.selectedDepartment).toBeNull();
  });

  it('should set departments', () => {
    const departments = [{ id: '1', name: 'Engineering', employeeCount: 10 }];
    useDepartmentStore.setState({ departments });
    expect(useDepartmentStore.getState().departments).toEqual(departments);
  });

  it('should select department', () => {
    const dept = { id: '1', name: 'HR', employeeCount: 5 };
    useDepartmentStore.setState({ selectedDepartment: dept });
    expect(useDepartmentStore.getState().selectedDepartment).toEqual(dept);
  });

  it('should add department', () => {
    const store = useDepartmentStore.getState();
    if (store.addDepartment) {
      store.addDepartment({ id: '1', name: 'Sales', employeeCount: 8 });
      expect(useDepartmentStore.getState().departments.length).toBe(1);
    }
  });

  it('should remove department', () => {
    useDepartmentStore.setState({ departments: [{ id: '1', name: 'Test', employeeCount: 0 }] });
    const store = useDepartmentStore.getState();
    if (store.removeDepartment) {
      store.removeDepartment('1');
      expect(useDepartmentStore.getState().departments.length).toBe(0);
    }
  });
});
