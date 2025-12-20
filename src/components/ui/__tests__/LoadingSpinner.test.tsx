import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders spinner', () => {
    render(<LoadingSpinner />);
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders text when provided', () => {
    render(<LoadingSpinner text="Loading..." />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('applies size classes', () => {
    render(<LoadingSpinner size="lg" />);
    expect(document.querySelector('.h-12')).toBeInTheDocument();
  });
});
