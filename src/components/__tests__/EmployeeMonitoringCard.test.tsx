import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmployeeMonitoringCard } from '../monitoring/EmployeeMonitoringCard';

const mockEmployee = {
  id: '1',
  name: 'John Doe',
  email: 'john@test.com',
  department: 'Engineering',
  status: 'online' as const,
  last_activity: new Date().toISOString(),
  productivity_score: 85,
};

describe('EmployeeMonitoringCard', () => {
  it('renders employee name', () => {
    render(
      <EmployeeMonitoringCard
        employee={mockEmployee}
        onClick={vi.fn()}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('shows department', () => {
    render(
      <EmployeeMonitoringCard
        employee={mockEmployee}
        onClick={vi.fn()}
      />
    );

    expect(screen.getByText('Engineering')).toBeInTheDocument();
  });

  it('shows productivity score', () => {
    render(
      <EmployeeMonitoringCard
        employee={mockEmployee}
        onClick={vi.fn()}
      />
    );

    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(
      <EmployeeMonitoringCard
        employee={mockEmployee}
        onClick={onClick}
      />
    );

    fireEvent.click(screen.getByText('John Doe'));
    expect(onClick).toHaveBeenCalled();
  });

  it('shows selected state', () => {
    render(
      <EmployeeMonitoringCard
        employee={mockEmployee}
        isSelected={true}
        onClick={vi.fn()}
      />
    );

    const card = screen.getByText('John Doe').closest('.card, [class*="card"]');
    expect(card).toHaveClass('ring-2');
  });
});
