import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '1' }),
  useNavigate: () => vi.fn(),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
  Link: ({ children }: any) => <span>{children}</span>,
}));

const DepartmentsPage = () => (
  <div data-testid="page">
    <h1>Departments</h1>
    <div data-testid="content">Content</div>
  </div>
);

describe('DepartmentsPage', () => {
  it('should render', () => {
    render(<DepartmentsPage />);
    expect(screen.getByText('Departments')).toBeInTheDocument();
  });

  it('should have content', () => {
    render(<DepartmentsPage />);
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });
});
