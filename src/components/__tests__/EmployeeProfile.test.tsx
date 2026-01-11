import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmployeeProfile } from '../EmployeeProfile';
describe('EmployeeProfile', () => {
  const emp = { id: '1', name: 'John', email: 'john@test.com', department: 'Eng', role: 'Developer', avatar: '/a.jpg', joinDate: '2024-01-01' };
  it('renders profile', () => { render(<EmployeeProfile employee={emp} />); expect(screen.getByText('John')).toBeInTheDocument(); });
  it('shows contact info', () => { render(<EmployeeProfile employee={emp} />); expect(screen.getByText('john@test.com')).toBeInTheDocument(); });
  it('shows department', () => { render(<EmployeeProfile employee={emp} />); expect(screen.getByText('Eng')).toBeInTheDocument(); });
  it('handles edit', () => { const onEdit = vi.fn(); render(<EmployeeProfile employee={emp} onEdit={onEdit} />); fireEvent.click(screen.getByRole('button', { name: /edit/i })); expect(onEdit).toHaveBeenCalled(); });
});