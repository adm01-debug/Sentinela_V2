import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render spinner', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('img', { hidden: true }) || document.querySelector('.animate-spin')).toBeTruthy();
  });

  it('should render with text', () => {
    render(<LoadingSpinner text="Carregando..." />);
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('should render fullscreen', () => {
    const { container } = render(<LoadingSpinner fullScreen />);
    expect(container.querySelector('.fixed')).toBeTruthy();
  });
});
