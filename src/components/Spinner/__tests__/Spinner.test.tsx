import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Spinner } from '../Spinner';

describe('Spinner', () => {
  it('renders spinner', () => {
    render(<Spinner />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('applies size classes', () => {
    render(<Spinner size="lg" />);
    expect(screen.getByTestId('spinner')).toHaveClass('lg');
  });

  it('shows label', () => {
    render(<Spinner label="Loading..." />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('has proper aria attributes', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
  });
});