import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from '../ProgressBar';
describe('ProgressBar', () => {
  it('renders', () => { render(<ProgressBar value={50} />); expect(screen.getByRole('progressbar')).toBeInTheDocument(); });
  it('shows value', () => { render(<ProgressBar value={50} showValue />); expect(screen.getByText('50%')).toBeInTheDocument(); });
  it('indeterminate', () => { const { container } = render(<ProgressBar indeterminate />); expect(container.firstChild).toHaveClass('animate'); });
});