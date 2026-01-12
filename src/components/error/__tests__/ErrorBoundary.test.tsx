import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';

const ThrowError = () => { throw new Error('Test error'); };

describe('ErrorBoundary', () => {
  it('should render children when no error', () => {
    render(<ErrorBoundary><div>Content</div></ErrorBoundary>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should render fallback on error', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<ErrorBoundary><ThrowError /></ErrorBoundary>);
    expect(screen.getByText(/algo deu errado/i)).toBeInTheDocument();
  });

  it('should render custom fallback', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<ErrorBoundary fallback={<div>Custom Error</div>}><ThrowError /></ErrorBoundary>);
    expect(screen.getByText('Custom Error')).toBeInTheDocument();
  });
});
