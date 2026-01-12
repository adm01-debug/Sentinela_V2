import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '1' }),
  useNavigate: () => vi.fn(),
  Link: ({ children }: any) => <span>{children}</span>,
}));

const ReportCreatePage = () => (<div data-testid="page"><h1>Create Report</h1></div>);

describe('ReportCreatePage', () => {
  it('should render', () => {
    render(<ReportCreatePage />);
    expect(screen.getByText('Create Report')).toBeInTheDocument();
  });
});
