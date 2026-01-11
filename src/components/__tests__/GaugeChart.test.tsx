import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GaugeChart } from '../GaugeChart';
describe('GaugeChart', () => {
  it('renders', () => { render(<GaugeChart value={75} max={100} />); expect(screen.getByTestId('gauge-chart')).toBeInTheDocument(); });
  it('shows value', () => { render(<GaugeChart value={75} max={100} showValue />); expect(screen.getByText('75%')).toBeInTheDocument(); });
  it('shows label', () => { render(<GaugeChart value={75} max={100} label="Progress" />); expect(screen.getByText('Progress')).toBeInTheDocument(); });
});