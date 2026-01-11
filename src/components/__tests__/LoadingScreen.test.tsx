import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingScreen } from '../LoadingScreen';
describe('LoadingScreen', () => {
  it('renders loading', () => { render(<LoadingScreen />); expect(screen.getByTestId('loading-screen')).toBeInTheDocument(); });
  it('shows spinner', () => { render(<LoadingScreen />); expect(screen.getByTestId('spinner')).toBeInTheDocument(); });
  it('shows custom message', () => { render(<LoadingScreen message="Loading data..." />); expect(screen.getByText('Loading data...')).toBeInTheDocument(); });
  it('is fullscreen', () => { const { container } = render(<LoadingScreen fullscreen />); expect(container.firstChild).toHaveClass('fullscreen'); });
});