import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmployeeCard } from '../EmployeeCard';
describe('EmployeeCard', () => {
  const employee = { id: '1', name: 'John Doe', email: 'john@test.com', department: 'Engineering', avatar: '/avatar.jpg' };
  it('renders employee info', () => { render(<EmployeeCard employee={employee} />); expect(screen.getByText('John Doe')).toBeInTheDocument(); });
  it('shows avatar', () => { render(<EmployeeCard employee={employee} />); expect(screen.getByAltText('John Doe')).toHaveAttribute('src', '/avatar.jpg'); });
  it('shows department', () => { render(<EmployeeCard employee={employee} />); expect(screen.getByText('Engineering')).toBeInTheDocument(); });
  it('handles click', () => { const onClick = vi.fn(); render(<EmployeeCard employee={employee} onClick={onClick} />); fireEvent.click(screen.getByText('John Doe')); expect(onClick).toHaveBeenCalled(); });
});