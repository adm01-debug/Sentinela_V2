import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LineChart } from '../LineChart';
describe('LineChart', () => {
  it('renders', () => { render(<LineChart data={[{x:1,y:10}]} />); expect(screen.getByTestId('line-chart')).toBeInTheDocument(); });
});