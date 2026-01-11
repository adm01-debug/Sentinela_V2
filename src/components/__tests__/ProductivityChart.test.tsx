import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductivityChart } from '../ProductivityChart';
describe('ProductivityChart', () => {
  const data = [{ date: '2026-01-01', score: 85 }, { date: '2026-01-02', score: 90 }];
  it('renders chart', () => { render(<ProductivityChart data={data} />); expect(screen.getByTestId('productivity-chart')).toBeInTheDocument(); });
  it('shows average', () => { render(<ProductivityChart data={data} showAverage />); expect(screen.getByText('87.5%')).toBeInTheDocument(); });
  it('handles empty data', () => { render(<ProductivityChart data={[]} />); expect(screen.getByText(/no data/i)).toBeInTheDocument(); });
  it('supports different periods', () => { render(<ProductivityChart data={data} period="week" />); expect(screen.getByText(/weekly/i)).toBeInTheDocument(); });
});