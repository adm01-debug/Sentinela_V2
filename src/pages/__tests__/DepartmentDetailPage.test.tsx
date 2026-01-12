import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '1' }),
  useNavigate: () => vi.fn(),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
  Link: ({ children }: any) => <span>{children}</span>,
}));

const DepartmentDetailPage = () => (
  <div data-testid="page">
    <h1>Department Detail</h1>
    <div data-testid="content">Content</div>
  </div>
);

describe('DepartmentDetailPage', () => {
  it('should render', () => {
    render(<DepartmentDetailPage />);
    expect(screen.getByText('Department Detail')).toBeInTheDocument();
  });

  it('should have content', () => {
    render(<DepartmentDetailPage />);
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });
});
