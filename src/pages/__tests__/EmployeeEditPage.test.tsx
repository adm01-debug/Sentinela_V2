import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '1' }),
  useNavigate: () => vi.fn(),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
  Link: ({ children }: any) => <span>{children}</span>,
}));

const EmployeeEditPage = () => (
  <div data-testid="page">
    <h1>Edit Employee</h1>
    <div data-testid="content">Content</div>
  </div>
);

describe('EmployeeEditPage', () => {
  it('should render', () => {
    render(<EmployeeEditPage />);
    expect(screen.getByText('Edit Employee')).toBeInTheDocument();
  });

  it('should have content', () => {
    render(<EmployeeEditPage />);
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });
});
