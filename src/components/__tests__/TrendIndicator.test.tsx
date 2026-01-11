import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TrendIndicator } from '../TrendIndicator';
describe('TrendIndicator', () => {
  it('shows positive', () => { render(<TrendIndicator value={5.5} />); expect(screen.getByText('+5.5%')).toBeInTheDocument(); });
  it('shows negative', () => { render(<TrendIndicator value={-3.2} />); expect(screen.getByText('-3.2%')).toBeInTheDocument(); });
  it('green for positive', () => { const { container } = render(<TrendIndicator value={5} />); expect(container.firstChild).toHaveClass('text-green'); });
  it('red for negative', () => { const { container } = render(<TrendIndicator value={-5} />); expect(container.firstChild).toHaveClass('text-red'); });
});