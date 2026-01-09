import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatCard } from '../StatCard';

describe('StatCard', () => {
  it('renders title and value', () => {
    render(<StatCard title="Users" value="1,234" />);
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('shows positive trend', () => {
    render(<StatCard title="Revenue" value="$10K" trend={{ value: 12, direction: 'up' }} />);
    expect(screen.getByText('+12%')).toBeInTheDocument();
    expect(screen.getByTestId('trend')).toHaveClass('positive');
  });

  it('shows negative trend', () => {
    render(<StatCard title="Churn" value="2%" trend={{ value: 5, direction: 'down' }} />);
    expect(screen.getByText('-5%')).toBeInTheDocument();
    expect(screen.getByTestId('trend')).toHaveClass('negative');
  });

  it('shows loading state', () => {
    render(<StatCard title="Loading" loading />);
    expect(screen.getByTestId('stat-skeleton')).toBeInTheDocument();
  });
});