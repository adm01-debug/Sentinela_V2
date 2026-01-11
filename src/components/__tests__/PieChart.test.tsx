import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PieChart } from '../PieChart';
describe('PieChart', () => {
  const data = [{ label: 'A', value: 30 }, { label: 'B', value: 70 }];
  it('renders', () => { render(<PieChart data={data} />); expect(screen.getByTestId('pie-chart')).toBeInTheDocument(); });
  it('shows legend', () => { render(<PieChart data={data} showLegend />); expect(screen.getByText('A')).toBeInTheDocument(); });
});