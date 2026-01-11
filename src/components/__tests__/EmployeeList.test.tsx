import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmployeeList } from '../EmployeeList';
describe('EmployeeList', () => {
  const employees = [{ id: '1', name: 'John', department: 'Eng' }, { id: '2', name: 'Jane', department: 'Sales' }];
  it('renders list', () => { render(<EmployeeList employees={employees} />); expect(screen.getByText('John')).toBeInTheDocument(); expect(screen.getByText('Jane')).toBeInTheDocument(); });
  it('shows empty state', () => { render(<EmployeeList employees={[]} />); expect(screen.getByText(/no employees/i)).toBeInTheDocument(); });
  it('handles selection', () => { const onSelect = vi.fn(); render(<EmployeeList employees={employees} onSelect={onSelect} selectable />); fireEvent.click(screen.getByText('John')); expect(onSelect).toHaveBeenCalledWith(['1']); });
  it('shows loading', () => { render(<EmployeeList employees={[]} loading />); expect(screen.getAllByTestId('skeleton')).toHaveLength(5); });
});