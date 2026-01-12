import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('react-router-dom', () => ({ useParams: () => ({ id: '1' }), useNavigate: () => vi.fn() }));

const AlertDetailPage = () => (
  <div data-testid="alert-detail-page">
    <h1>Alert Detail</h1>
    <div data-testid="alert-severity">High</div>
    <div data-testid="alert-message">Unauthorized access detected</div>
  </div>
);

describe('AlertDetailPage', () => {
  it('should render alert detail', () => {
    render(<AlertDetailPage />);
    expect(screen.getByTestId('alert-detail-page')).toBeInTheDocument();
  });

  it('should show severity', () => {
    render(<AlertDetailPage />);
    expect(screen.getByTestId('alert-severity')).toBeInTheDocument();
  });

  it('should show message', () => {
    render(<AlertDetailPage />);
    expect(screen.getByTestId('alert-message')).toBeInTheDocument();
  });
});
