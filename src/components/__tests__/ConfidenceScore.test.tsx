import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConfidenceScore } from '../ConfidenceScore';
describe('ConfidenceScore', () => {
  it('renders score', () => { render(<ConfidenceScore score={85} />); expect(screen.getByText('85%')).toBeInTheDocument(); });
  it('shows high confidence', () => { const { container } = render(<ConfidenceScore score={90} />); expect(container.firstChild).toHaveClass('high'); });
  it('shows low confidence', () => { const { container } = render(<ConfidenceScore score={30} />); expect(container.firstChild).toHaveClass('low'); });
});