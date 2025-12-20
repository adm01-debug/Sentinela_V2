import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ViolationCard } from '../violations/ViolationCard';

const mockViolation = {
  id: '1',
  employee_name: 'Jane Doe',
  violation_type: 'unauthorized_access',
  severity: 'high',
  status: 'open',
  description: 'Accessed restricted area',
  created_at: new Date().toISOString(),
};

describe('ViolationCard', () => {
  const handlers = {
    onViewDetails: vi.fn(),
    onResolve: vi.fn(),
  };

  beforeEach(() => { vi.clearAllMocks(); });

  it('renders employee name', () => {
    render(<ViolationCard violation={mockViolation} typeLabel="Acesso Nao Autorizado" {...handlers} />);
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  it('shows type label', () => {
    render(<ViolationCard violation={mockViolation} typeLabel="Acesso Nao Autorizado" {...handlers} />);
    expect(screen.getByText('Acesso Nao Autorizado')).toBeInTheDocument();
  });

  it('shows status badge', () => {
    render(<ViolationCard violation={mockViolation} typeLabel="Test" {...handlers} />);
    expect(screen.getByText('open')).toBeInTheDocument();
  });

  it('calls onViewDetails when eye clicked', () => {
    render(<ViolationCard violation={mockViolation} typeLabel="Test" {...handlers} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(handlers.onViewDetails).toHaveBeenCalled();
  });

  it('shows resolve button for open violations', () => {
    render(<ViolationCard violation={mockViolation} typeLabel="Test" {...handlers} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(2); // View and Resolve
  });
});
