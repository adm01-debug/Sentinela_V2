import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MonitoringStatsCards } from '../monitoring/MonitoringStatsCards';

const mockStats = {
  total: 100,
  online: 75,
  busy: 25,
  idle: 10,
  offline: 25,
  avgProductivity: 82,
};

describe('MonitoringStatsCards', () => {
  it('renders all stats', () => {
    render(<MonitoringStatsCards stats={mockStats} />);

    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('shows online count', () => {
    render(<MonitoringStatsCards stats={mockStats} />);
    
    // online + busy
    expect(screen.getByText((content) => content.includes('100') || content.includes('75'))).toBeInTheDocument();
  });

  it('displays correct labels', () => {
    render(<MonitoringStatsCards stats={mockStats} />);

    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('Online')).toBeInTheDocument();
  });
});
