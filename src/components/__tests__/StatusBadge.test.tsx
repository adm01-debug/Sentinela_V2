import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../StatusBadge';
describe('StatusBadge', () => {
  it('renders active', () => { render(<StatusBadge status="active" />); expect(screen.getByText('active')).toBeInTheDocument(); });
  it('renders inactive', () => { render(<StatusBadge status="inactive" />); expect(screen.getByText('inactive')).toBeInTheDocument(); });
  it('applies color', () => { const { container } = render(<StatusBadge status="active" />); expect(container.firstChild).toHaveClass('bg-green'); });
  it('custom label', () => { render(<StatusBadge status="active" label="Online" />); expect(screen.getByText('Online')).toBeInTheDocument(); });
});