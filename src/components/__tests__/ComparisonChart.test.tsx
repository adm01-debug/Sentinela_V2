import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ComparisonChart } from '../ComparisonChart';
describe('ComparisonChart', () => {
  const data = { current: [10, 20, 30], previous: [8, 18, 25] };
  it('renders', () => { render(<ComparisonChart data={data} />); expect(screen.getByTestId('comparison-chart')).toBeInTheDocument(); });
  it('shows legend', () => { render(<ComparisonChart data={data} showLegend />); expect(screen.getByText('Current')).toBeInTheDocument(); });
});