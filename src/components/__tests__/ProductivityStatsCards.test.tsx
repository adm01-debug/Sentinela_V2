import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductivityStatsCards } from '../productivity/ProductivityStatsCards';

const mockStats = {
  average_score: 78,
  productivity_trend: 5,
  top_performer: 'Maria Silva',
  lowest_performer: 'João Santos',
  total_active_hours: 156,
  total_idle_hours: 24,
};

describe('ProductivityStatsCards', () => {
  it('renders stats correctly', () => {
    render(<ProductivityStatsCards stats={mockStats} />);

    expect(screen.getByText('78%')).toBeInTheDocument();
    expect(screen.getByText('Maria Silva')).toBeInTheDocument();
    expect(screen.getByText('156h')).toBeInTheDocument();
    expect(screen.getByText('João Santos')).toBeInTheDocument();
  });

  it('shows loading skeletons when loading', () => {
    const { container } = render(<ProductivityStatsCards isLoading />);

    const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('handles zero values gracefully', () => {
    render(
      <ProductivityStatsCards
        stats={{
          average_score: 0,
          productivity_trend: 0,
          top_performer: '',
          lowest_performer: '',
          total_active_hours: 0,
          total_idle_hours: 0,
        }}
      />
    );

    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('0h')).toBeInTheDocument();
  });

  it('displays trend information', () => {
    render(<ProductivityStatsCards stats={mockStats} />);

    expect(screen.getByText(/Tendência: 5%/)).toBeInTheDocument();
  });

  it('shows idle hours in subtext', () => {
    render(<ProductivityStatsCards stats={mockStats} />);

    expect(screen.getByText('24h tempo ocioso')).toBeInTheDocument();
  });

  it('handles undefined stats', () => {
    render(<ProductivityStatsCards stats={undefined} />);

    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
  });
});
