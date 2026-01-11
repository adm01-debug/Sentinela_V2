import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActivityStatsCards } from '../ActivityStatsCards';

describe('ActivityStatsCards', () => {
  const mockStats = {
    totalActivities: 1500,
    activeUsers: 45,
    avgDuration: 120,
    violations: 3,
  };

  it('renders all stat cards', () => {
    render(<ActivityStatsCards stats={mockStats} />);
    expect(screen.getByText('1,500')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
  });

  it('displays loading skeletons', () => {
    render(<ActivityStatsCards stats={mockStats} loading />);
    expect(screen.getAllByTestId('skeleton')).toHaveLength(4);
  });

  it('shows trend indicators', () => {
    render(<ActivityStatsCards stats={mockStats} trends={{ totalActivities: 5.2 }} />);
    expect(screen.getByText('+5.2%')).toBeInTheDocument();
  });

  it('handles zero values', () => {
    render(<ActivityStatsCards stats={{ ...mockStats, violations: 0 }} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('applies custom grid layout', () => {
    const { container } = render(<ActivityStatsCards stats={mockStats} columns={2} />);
    expect(container.firstChild).toHaveClass('grid-cols-2');
  });
});
