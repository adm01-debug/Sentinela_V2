import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RiskIndicator } from '../RiskIndicator';
describe('RiskIndicator', () => {
  it('shows low risk', () => { render(<RiskIndicator level="low" />); expect(screen.getByText('Low Risk')).toBeInTheDocument(); });
  it('shows high risk', () => { render(<RiskIndicator level="high" />); expect(screen.getByText('High Risk')).toBeInTheDocument(); });
  it('applies color', () => { const { container } = render(<RiskIndicator level="high" />); expect(container.firstChild).toHaveClass('bg-red'); });
});