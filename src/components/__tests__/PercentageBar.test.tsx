import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PercentageBar } from '../PercentageBar';
describe('PercentageBar', () => {
  it('renders', () => { render(<PercentageBar value={75} />); expect(screen.getByTestId('percentage-bar')).toBeInTheDocument(); });
  it('shows value', () => { render(<PercentageBar value={75} showValue />); expect(screen.getByText('75%')).toBeInTheDocument(); });
});