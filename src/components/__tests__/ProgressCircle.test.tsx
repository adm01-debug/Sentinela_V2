import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressCircle } from '../ProgressCircle';
describe('ProgressCircle', () => {
  it('renders', () => { render(<ProgressCircle value={75} />); expect(screen.getByTestId('progress-circle')).toBeInTheDocument(); });
  it('shows value', () => { render(<ProgressCircle value={75} showValue />); expect(screen.getByText('75%')).toBeInTheDocument(); });
});