import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ViolationStats } from '../ViolationStats';
describe('ViolationStats', () => {
  const stats = { total: 25, critical: 3, high: 7, medium: 10, low: 5 };
  it('renders', () => { render(<ViolationStats stats={stats} />); expect(screen.getByText('25')).toBeInTheDocument(); });
  it('shows breakdown', () => { render(<ViolationStats stats={stats} />); expect(screen.getByText('Critical: 3')).toBeInTheDocument(); });
  it('shows chart', () => { render(<ViolationStats stats={stats} showChart />); expect(screen.getByTestId('stats-chart')).toBeInTheDocument(); });
});