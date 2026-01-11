import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusIndicator } from '../StatusIndicator';
describe('StatusIndicator', () => {
  it('shows online', () => { render(<StatusIndicator status="online" />); expect(screen.getByTestId('status-dot')).toHaveClass('bg-green'); });
  it('shows offline', () => { render(<StatusIndicator status="offline" />); expect(screen.getByTestId('status-dot')).toHaveClass('bg-gray'); });
  it('shows busy', () => { render(<StatusIndicator status="busy" />); expect(screen.getByTestId('status-dot')).toHaveClass('bg-red'); });
  it('shows label', () => { render(<StatusIndicator status="online" showLabel />); expect(screen.getByText('Online')).toBeInTheDocument(); });
});