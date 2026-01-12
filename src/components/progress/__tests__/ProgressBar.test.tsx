import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from '../ProgressBar';

describe('ProgressBar', () => {
  it('should render progress bar', () => {
    const { container } = render(<ProgressBar value={50} />);
    expect(container.querySelector('[style*="width: 50%"]')).toBeTruthy();
  });

  it('should show label when enabled', () => {
    render(<ProgressBar value={75} showLabel />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('should clamp values', () => {
    const { container } = render(<ProgressBar value={150} />);
    expect(container.querySelector('[style*="width: 100%"]')).toBeTruthy();
  });
});
