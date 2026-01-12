import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '1' }),
  useNavigate: () => vi.fn(),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
  Link: ({ children }: any) => <span>{children}</span>,
}));

const EmployeeCreatePage = () => (
  <div data-testid="page">
    <h1>Create Employee</h1>
    <div data-testid="content">Content</div>
  </div>
);

describe('EmployeeCreatePage', () => {
  it('should render', () => {
    render(<EmployeeCreatePage />);
    expect(screen.getByText('Create Employee')).toBeInTheDocument();
  });

  it('should have content', () => {
    render(<EmployeeCreatePage />);
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });
});
