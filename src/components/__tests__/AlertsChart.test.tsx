import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AlertsChart } from '../AlertsChart';

describe('AlertsChart', () => {
  const mockData = [{ date: '2026-01-01', critical: 2, warning: 5, info: 10 }];
  it('renders chart', () => { render(<AlertsChart data={mockData} />); expect(screen.getByRole('img')).toBeInTheDocument(); });
  it('shows legend', () => { render(<AlertsChart data={mockData} showLegend />); expect(screen.getByText('critical')).toBeInTheDocument(); });
  it('handles empty data', () => { render(<AlertsChart data={[]} />); expect(screen.getByText(/no alerts/i)).toBeInTheDocument(); });
  it('supports different chart types', () => { render(<AlertsChart data={mockData} type="bar" />); expect(screen.getByTestId('bar-chart')).toBeInTheDocument(); });
});