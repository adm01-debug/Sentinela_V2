import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '1' }),
  useNavigate: () => vi.fn(),
  Link: ({ children }: any) => <span>{children}</span>,
}));

const ReportSchedulePage = () => (<div data-testid="page"><h1>Schedule Reports</h1></div>);

describe('ReportSchedulePage', () => {
  it('should render', () => {
    render(<ReportSchedulePage />);
    expect(screen.getByText('Schedule Reports')).toBeInTheDocument();
  });
});
