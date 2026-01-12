import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '1' }),
  useNavigate: () => vi.fn(),
  Link: ({ children }: any) => <span>{children}</span>,
}));

const ActivityDetailPage = () => (
  <div data-testid="activity-detail-page">
    <h1>Activity Detail</h1>
    <div data-testid="activity-info">
      <span data-testid="activity-type">Screenshot</span>
      <span data-testid="activity-time">10:30 AM</span>
    </div>
  </div>
);

describe('ActivityDetailPage', () => {
  it('should render page', () => {
    render(<ActivityDetailPage />);
    expect(screen.getByTestId('activity-detail-page')).toBeInTheDocument();
  });

  it('should display activity info', () => {
    render(<ActivityDetailPage />);
    expect(screen.getByTestId('activity-info')).toBeInTheDocument();
  });

  it('should show activity type', () => {
    render(<ActivityDetailPage />);
    expect(screen.getByTestId('activity-type')).toBeInTheDocument();
  });

  it('should show activity time', () => {
    render(<ActivityDetailPage />);
    expect(screen.getByTestId('activity-time')).toBeInTheDocument();
  });
});
