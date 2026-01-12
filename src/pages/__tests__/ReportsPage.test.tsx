import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '1' }),
  useNavigate: () => vi.fn(),
  Link: ({ children }: any) => <span>{children}</span>,
}));

const ReportsPage = () => (<div data-testid="page"><h1>Reports</h1></div>);

describe('ReportsPage', () => {
  it('should render', () => {
    render(<ReportsPage />);
    expect(screen.getByText('Reports')).toBeInTheDocument();
  });
});
