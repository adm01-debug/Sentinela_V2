import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Progress } from '../Progress';

describe('Progress', () => {
  it('renders with value', () => {
    render(<Progress value={50} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
  });

  it('shows label when enabled', () => {
    render(<Progress value={75} showLabel />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('applies color styles', () => {
    render(<Progress value={100} color="success" />);
    expect(screen.getByTestId('progress-bar')).toHaveClass('success');
  });

  it('shows indeterminate state', () => {
    render(<Progress indeterminate />);
    expect(screen.getByRole('progressbar')).toHaveClass('indeterminate');
  });
});