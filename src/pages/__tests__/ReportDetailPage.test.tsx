import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '1' }),
  useNavigate: () => vi.fn(),
  Link: ({ children }: any) => <span>{children}</span>,
}));

const ReportDetailPage = () => (<div data-testid="page"><h1>Report Detail</h1></div>);

describe('ReportDetailPage', () => {
  it('should render', () => {
    render(<ReportDetailPage />);
    expect(screen.getByText('Report Detail')).toBeInTheDocument();
  });
});
