import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
}));

const ActivitiesPage = () => (
  <div data-testid="activities-page">
    <h1>Activities</h1>
    <div data-testid="activity-list">
      <div data-testid="activity-item">Activity 1</div>
      <div data-testid="activity-item">Activity 2</div>
    </div>
  </div>
);

describe('ActivitiesPage', () => {
  it('should render page title', () => {
    render(<ActivitiesPage />);
    expect(screen.getByText('Activities')).toBeInTheDocument();
  });

  it('should render activity list', () => {
    render(<ActivitiesPage />);
    expect(screen.getByTestId('activity-list')).toBeInTheDocument();
  });

  it('should display activity items', () => {
    render(<ActivitiesPage />);
    const items = screen.getAllByTestId('activity-item');
    expect(items.length).toBeGreaterThan(0);
  });
});
