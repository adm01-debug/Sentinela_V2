import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingState, Spinner, LoadingSkeleton } from '../LoadingState';

describe('Spinner', () => {
  it('should render with default size', () => {
    render(<Spinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
  });

  it('should render with custom size', () => {
    const { container } = render(<Spinner size="lg" />);
    expect(container.querySelector('svg')).toHaveClass('h-8', 'w-8');
  });
});

describe('LoadingState', () => {
  it('should render loading message', () => {
    render(<LoadingState />);
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('should render custom message', () => {
    render(<LoadingState message="Custom loading" />);
    expect(screen.getByText('Custom loading')).toBeInTheDocument();
  });

  it('should render fullscreen variant', () => {
    const { container } = render(<LoadingState fullScreen />);
    expect(container.firstChild).toHaveClass('min-h-screen');
  });
});

describe('LoadingSkeleton', () => {
  it('should render specified number of rows', () => {
    const { container } = render(<LoadingSkeleton rows={5} />);
    const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletons.length).toBeGreaterThanOrEqual(5);
  });
});
