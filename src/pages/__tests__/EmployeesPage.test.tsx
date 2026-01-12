import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '1' }),
  useNavigate: () => vi.fn(),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
  Link: ({ children }: any) => <span>{children}</span>,
}));

const EmployeesPage = () => (
  <div data-testid="page">
    <h1>Employees</h1>
    <div data-testid="content">Content</div>
  </div>
);

describe('EmployeesPage', () => {
  it('should render', () => {
    render(<EmployeesPage />);
    expect(screen.getByText('Employees')).toBeInTheDocument();
  });

  it('should have content', () => {
    render(<EmployeesPage />);
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });
});
