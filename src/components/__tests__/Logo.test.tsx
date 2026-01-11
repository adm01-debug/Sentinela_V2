import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Logo } from '../Logo';
describe('Logo', () => {
  it('renders', () => { render(<Logo />); expect(screen.getByAltText(/logo/i)).toBeInTheDocument(); });
  it('size', () => { const { container } = render(<Logo size="lg" />); expect(container.firstChild).toHaveClass('w-12'); });
});