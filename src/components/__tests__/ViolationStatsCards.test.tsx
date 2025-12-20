import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ViolationStatsCards } from '../violations/ViolationStatsCards';

const mockStats = {
  total: 100,
  open: 25,
  investigating: 10,
  resolved: 65,
  bySeverity: {
    critical: 5,
    high: 20,
  },
};

describe('ViolationStatsCards', () => {
  it('renders open violations', () => {
    render(<ViolationStatsCards stats={mockStats} />);
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('renders investigating count', () => {
    render(<ViolationStatsCards stats={mockStats} />);
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('renders resolved count', () => {
    render(<ViolationStatsCards stats={mockStats} />);
    expect(screen.getByText('65')).toBeInTheDocument();
  });

  it('renders total count', () => {
    render(<ViolationStatsCards stats={mockStats} />);
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('shows critical count in subtitle', () => {
    render(<ViolationStatsCards stats={mockStats} />);
    expect(screen.getByText(/5 criticas/i)).toBeInTheDocument();
  });
});
