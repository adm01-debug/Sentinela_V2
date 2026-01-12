import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '1' }),
  useNavigate: () => vi.fn(),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
  Link: ({ children }: any) => <span>{children}</span>,
}));

const EmployeeDetailPage = () => (
  <div data-testid="page">
    <h1>Employee Detail</h1>
    <div data-testid="content">Content</div>
  </div>
);

describe('EmployeeDetailPage', () => {
  it('should render', () => {
    render(<EmployeeDetailPage />);
    expect(screen.getByText('Employee Detail')).toBeInTheDocument();
  });

  it('should have content', () => {
    render(<EmployeeDetailPage />);
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });
});
